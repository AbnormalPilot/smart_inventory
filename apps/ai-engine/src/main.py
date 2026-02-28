from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.routes.health import router as health_router
from src.routes.forecast import router as forecast_router
from src.services import mongo_client


@asynccontextmanager
async def lifespan(app: FastAPI):
    await mongo_client.connect()
    yield
    await mongo_client.disconnect()


app = FastAPI(
    title="Smart Inventory AI Engine",
    description="Chronos-2 powered demand forecasting",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(forecast_router)
