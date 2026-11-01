from pydantic_settings import BaseSettings
from pydantic import ConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = ConfigDict(env_file=".env", case_sensitive=True, extra="ignore")
    
    GEMINI_API_KEY: Optional[str] = None
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    DEBUG: bool = True
    DATABASE_URL: str = "sqlite+aiosqlite:///./celebrate.db"


settings = Settings()
