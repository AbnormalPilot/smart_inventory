from pydantic import BaseModel, Field


class ProductForecastRequest(BaseModel):
    product: str
    horizon: int = Field(default=14, ge=1, le=90)
    lookback_days: int = Field(default=90, ge=7, le=365)


class CategoryForecastRequest(BaseModel):
    category: str
    horizon: int = Field(default=14, ge=1, le=90)
    lookback_days: int = Field(default=90, ge=7, le=365)


class OverallForecastRequest(BaseModel):
    horizon: int = Field(default=14, ge=1, le=90)
    lookback_days: int = Field(default=90, ge=7, le=365)


class BatchForecastRequest(BaseModel):
    products: list[str]
    horizon: int = Field(default=14, ge=1, le=90)
    lookback_days: int = Field(default=90, ge=7, le=365)


class PredictionPoint(BaseModel):
    date: str
    predicted_quantity: float
    lower_bound: float
    upper_bound: float


class ForecastResponse(BaseModel):
    entity: str
    entity_type: str
    horizon: int
    predictions: list[PredictionPoint]
    total_predicted: float
    avg_daily: float
    confidence_level: str = "80%"
    model: str = "chronos-t5-small"


class HealthResponse(BaseModel):
    status: str
    model: dict
    database: str
