from datetime import datetime, timedelta

import pandas as pd

from src.services.mongo_client import get_db


async def get_daily_series_by_product(
    product: str, lookback_days: int = 90
) -> pd.DataFrame:
    """Aggregate demand events into a daily time series for one product."""
    db = get_db()
    since = datetime.utcnow() - timedelta(days=lookback_days)

    pipeline = [
        {"$match": {"product": product, "date": {"$gte": since}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$date"}
                },
                "target": {"$sum": "$quantity"},
            }
        },
        {"$sort": {"_id": 1}},
        {"$project": {"_id": 0, "timestamp": "$_id", "target": 1}},
    ]

    cursor = db["demandevents"].aggregate(pipeline)
    rows = await cursor.to_list(length=None)

    if not rows:
        return pd.DataFrame(columns=["timestamp", "target"])

    df = pd.DataFrame(rows)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = _fill_missing_dates(df, since)
    return df


async def get_daily_series_by_category(
    category: str, lookback_days: int = 90
) -> pd.DataFrame:
    """Aggregate demand events into a daily time series for one category."""
    db = get_db()
    since = datetime.utcnow() - timedelta(days=lookback_days)

    pipeline = [
        {"$match": {"category": category, "date": {"$gte": since}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$date"}
                },
                "target": {"$sum": "$quantity"},
            }
        },
        {"$sort": {"_id": 1}},
        {"$project": {"_id": 0, "timestamp": "$_id", "target": 1}},
    ]

    cursor = db["demandevents"].aggregate(pipeline)
    rows = await cursor.to_list(length=None)

    if not rows:
        return pd.DataFrame(columns=["timestamp", "target"])

    df = pd.DataFrame(rows)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = _fill_missing_dates(df, since)
    return df


async def get_daily_series_overall(lookback_days: int = 90) -> pd.DataFrame:
    """Aggregate all demand events into a single daily time series."""
    db = get_db()
    since = datetime.utcnow() - timedelta(days=lookback_days)

    pipeline = [
        {"$match": {"date": {"$gte": since}}},
        {
            "$group": {
                "_id": {
                    "$dateToString": {"format": "%Y-%m-%d", "date": "$date"}
                },
                "target": {"$sum": "$quantity"},
            }
        },
        {"$sort": {"_id": 1}},
        {"$project": {"_id": 0, "timestamp": "$_id", "target": 1}},
    ]

    cursor = db["demandevents"].aggregate(pipeline)
    rows = await cursor.to_list(length=None)

    if not rows:
        return pd.DataFrame(columns=["timestamp", "target"])

    df = pd.DataFrame(rows)
    df["timestamp"] = pd.to_datetime(df["timestamp"])
    df = _fill_missing_dates(df, since)
    return df


async def list_forecastable_products(min_days: int = 7) -> list[dict]:
    """List products that have enough data points for forecasting."""
    db = get_db()

    pipeline = [
        {
            "$group": {
                "_id": "$product",
                "category": {"$first": "$category"},
                "total_qty": {"$sum": "$quantity"},
                "distinct_days": {
                    "$addToSet": {
                        "$dateToString": {"format": "%Y-%m-%d", "date": "$date"}
                    }
                },
            }
        },
        {
            "$project": {
                "_id": 0,
                "product": "$_id",
                "category": 1,
                "total_qty": 1,
                "data_days": {"$size": "$distinct_days"},
            }
        },
        {"$match": {"data_days": {"$gte": min_days}}},
        {"$sort": {"total_qty": -1}},
    ]

    cursor = db["demandevents"].aggregate(pipeline)
    return await cursor.to_list(length=None)


async def list_forecastable_categories(min_days: int = 7) -> list[dict]:
    """List categories that have enough data points for forecasting."""
    db = get_db()

    pipeline = [
        {
            "$group": {
                "_id": "$category",
                "total_qty": {"$sum": "$quantity"},
                "distinct_days": {
                    "$addToSet": {
                        "$dateToString": {"format": "%Y-%m-%d", "date": "$date"}
                    }
                },
            }
        },
        {
            "$project": {
                "_id": 0,
                "category": "$_id",
                "total_qty": 1,
                "data_days": {"$size": "$distinct_days"},
            }
        },
        {"$match": {"data_days": {"$gte": min_days}}},
        {"$sort": {"total_qty": -1}},
    ]

    cursor = db["demandevents"].aggregate(pipeline)
    return await cursor.to_list(length=None)


def _fill_missing_dates(df: pd.DataFrame, since: datetime) -> pd.DataFrame:
    """Fill gaps in the time series with 0 so Chronos gets a continuous series."""
    if df.empty:
        return df

    full_range = pd.date_range(
        start=since.date(), end=datetime.utcnow().date(), freq="D"
    )
    full_df = pd.DataFrame({"timestamp": full_range})
    merged = full_df.merge(df, on="timestamp", how="left")
    merged["target"] = merged["target"].fillna(0).astype(float)
    return merged
