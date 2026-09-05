"""TrackAI backend configuration via pydantic-settings."""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    database_url: str = "sqlite:///./trackai.db"
    cors_origins: str = "*"

    # Simulation
    sim_interval_seconds: float = 3.0
    sim_vehicle_count: int = 20
    sim_enabled: bool = True

    @property
    def cors_origins_list(self) -> List[str]:
        if self.cors_origins.strip() == "*":
            return ["*"]
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
