from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017/smart_inventory"
    MODEL_NAME: str = "autogluon/chronos-t5-small"
    PORT: int = 8000

    class Config:
        env_file = ".env"


settings = Settings()
