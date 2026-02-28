from fastapi import APIRouter, HTTPException

from src.models.schemas import (
    BatchForecastRequest,
    CategoryForecastRequest,
    ForecastResponse,
    OverallForecastRequest,
    PredictionPoint,
    ProductForecastRequest,
)
from src.services.data_pipeline import (
    get_daily_series_by_category,
    get_daily_series_by_product,
    get_daily_series_overall,
    list_forecastable_categories,
    list_forecastable_products,
)
from src.services.forecaster import forecaster_available, predict

router = APIRouter(prefix="/forecast")


def _build_response(
    entity: str, entity_type: str, horizon: int, predictions_df
) -> ForecastResponse:
    predictions = [
        PredictionPoint(**row) for row in predictions_df.to_dict("records")
    ]
    total = round(float(predictions_df["predicted_quantity"].sum()), 1)
    avg = round(total / horizon, 1) if horizon > 0 else 0

    return ForecastResponse(
        entity=entity,
        entity_type=entity_type,
        horizon=horizon,
        predictions=predictions,
        total_predicted=total,
        avg_daily=avg,
    )


@router.post("/product", response_model=ForecastResponse)
async def forecast_product(req: ProductForecastRequest):
    df = await get_daily_series_by_product(req.product, req.lookback_days)

    if df.empty or len(df) < 3:
        raise HTTPException(
            status_code=422,
            detail=f"Not enough data for product '{req.product}'. Need at least 3 days of history.",
        )

    if not forecaster_available():
        raise HTTPException(
            status_code=503,
            detail="Forecasting model not available. Install dependencies with: pip install chronos-forecasting torch",
        )

    predictions_df = predict(df, prediction_length=req.horizon)
    return _build_response(req.product, "product", req.horizon, predictions_df)


@router.post("/category", response_model=ForecastResponse)
async def forecast_category(req: CategoryForecastRequest):
    df = await get_daily_series_by_category(req.category, req.lookback_days)

    if df.empty or len(df) < 3:
        raise HTTPException(
            status_code=422,
            detail=f"Not enough data for category '{req.category}'.",
        )

    if not forecaster_available():
        raise HTTPException(status_code=503, detail="Forecasting model not available.")

    predictions_df = predict(df, prediction_length=req.horizon)
    return _build_response(req.category, "category", req.horizon, predictions_df)


@router.post("/overall", response_model=ForecastResponse)
async def forecast_overall(req: OverallForecastRequest):
    df = await get_daily_series_overall(req.lookback_days)

    if df.empty or len(df) < 3:
        raise HTTPException(
            status_code=422, detail="Not enough demand data for forecasting."
        )

    if not forecaster_available():
        raise HTTPException(status_code=503, detail="Forecasting model not available.")

    predictions_df = predict(df, prediction_length=req.horizon)
    return _build_response("all_products", "overall", req.horizon, predictions_df)


@router.post("/batch")
async def forecast_batch(req: BatchForecastRequest):
    if not forecaster_available():
        raise HTTPException(status_code=503, detail="Forecasting model not available.")

    results = []
    errors = []

    for product in req.products:
        try:
            df = await get_daily_series_by_product(product, req.lookback_days)
            if df.empty or len(df) < 3:
                errors.append(
                    {"product": product, "error": "Not enough data (need 3+ days)"}
                )
                continue

            predictions_df = predict(df, prediction_length=req.horizon)
            resp = _build_response(product, "product", req.horizon, predictions_df)
            results.append(resp.model_dump())
        except Exception as e:
            errors.append({"product": product, "error": str(e)})

    return {"results": results, "errors": errors}


@router.get("/products")
async def get_forecastable_products():
    products = await list_forecastable_products()
    return {"products": products, "count": len(products)}


@router.get("/categories")
async def get_forecastable_categories():
    categories = await list_forecastable_categories()
    return {"categories": categories, "count": len(categories)}
