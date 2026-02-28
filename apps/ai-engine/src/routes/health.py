from fastapi import APIRouter

from src.models.schemas import HealthResponse
from src.services.forecaster import get_model_info
from src.services.mongo_client import get_db

router = APIRouter()


@router.get("/health", response_model=HealthResponse)
async def health_check():
    model_info = get_model_info()

    db_status = "disconnected"
    try:
        db = get_db()
        await db.command("ping")
        db_status = "connected"
    except Exception:
        db_status = "error"

    return HealthResponse(
        status="ok",
        model=model_info,
        database=db_status,
    )
