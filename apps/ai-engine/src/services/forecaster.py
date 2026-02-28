import hashlib
import time

import pandas as pd

from src.config import settings

try:
    import torch
    from chronos import ChronosPipeline

    _CHRONOS_AVAILABLE = True
except ImportError:
    _CHRONOS_AVAILABLE = False

_pipeline = None
_cache: dict[str, tuple[float, pd.DataFrame]] = {}
_CACHE_TTL = 3600  # 1 hour
_CACHE_MAX = 200


def forecaster_available() -> bool:
    return _CHRONOS_AVAILABLE


def _get_pipeline():
    """Lazy-load the Chronos model on first call."""
    global _pipeline
    if _pipeline is None:
        _pipeline = ChronosPipeline.from_pretrained(
            settings.MODEL_NAME,
            device_map="cpu",
            dtype=torch.float32,
        )
    return _pipeline


def _cache_key(context: pd.Series, horizon: int, quantiles: tuple) -> str:
    data_hash = hashlib.md5(
        context.to_numpy().tobytes()
        + str(horizon).encode()
        + str(quantiles).encode()
    ).hexdigest()
    return data_hash


def _evict_stale():
    """Remove expired or excess entries from the cache."""
    now = time.time()
    expired = [k for k, (ts, _) in _cache.items() if now - ts > _CACHE_TTL]
    for k in expired:
        del _cache[k]
    while len(_cache) > _CACHE_MAX:
        oldest_key = min(_cache, key=lambda k: _cache[k][0])
        del _cache[oldest_key]


def predict(
    context_df: pd.DataFrame,
    prediction_length: int = 14,
    quantile_levels: list[float] | None = None,
) -> pd.DataFrame:
    """
    Run Chronos inference on a daily time series.

    Args:
        context_df: DataFrame with 'timestamp' and 'target' columns.
        prediction_length: Number of days to forecast.
        quantile_levels: Quantile levels for confidence intervals.

    Returns:
        DataFrame with columns: date, predicted_quantity, lower_bound, upper_bound
    """
    if not _CHRONOS_AVAILABLE:
        raise RuntimeError("Chronos/torch not installed")

    if quantile_levels is None:
        quantile_levels = [0.1, 0.5, 0.9]

    context = context_df["target"].astype(float)
    quantiles_tuple = tuple(quantile_levels)
    key = _cache_key(context, prediction_length, quantiles_tuple)

    if key in _cache:
        ts, result = _cache[key]
        if time.time() - ts < _CACHE_TTL:
            return result

    pipeline = _get_pipeline()

    context_tensor = torch.tensor(context.values, dtype=torch.float32).unsqueeze(0)

    quantile_result = pipeline.predict_quantiles(
        context_tensor,
        prediction_length=prediction_length,
        quantile_levels=quantile_levels,
    )

    # predict_quantiles returns (quantiles_tensor, mean_tensor)
    # quantiles shape: (1, prediction_length, num_quantiles)
    quantiles_tensor = quantile_result[0] if isinstance(quantile_result, tuple) else quantile_result
    preds = quantiles_tensor[0].numpy()

    last_date = context_df["timestamp"].max()
    future_dates = pd.date_range(
        start=last_date + pd.Timedelta(days=1),
        periods=prediction_length,
        freq="D",
    )

    lower = preds[:, 0].flatten().clip(min=0).round(1)
    median = preds[:, 1].flatten().clip(min=0).round(1)
    upper = preds[:, 2].flatten().clip(min=0).round(1)

    result = pd.DataFrame(
        {
            "date": future_dates.strftime("%Y-%m-%d"),
            "lower_bound": lower,
            "predicted_quantity": median,
            "upper_bound": upper,
        }
    )

    _evict_stale()
    _cache[key] = (time.time(), result)

    return result


def get_model_info() -> dict:
    """Return info about the loaded model."""
    loaded = _pipeline is not None
    return {
        "model": settings.MODEL_NAME,
        "loaded": loaded,
        "device": "cpu",
        "available": _CHRONOS_AVAILABLE,
        "cache_entries": len(_cache),
    }
