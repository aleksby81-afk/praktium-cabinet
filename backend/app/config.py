from decimal import Decimal
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file='.env', extra='ignore')
    database_url: str = ''
    secret_key: str = Field(min_length=32)
    admin_key: str = Field(min_length=24)
    yandex_disk_token: str = ''
    # Keep application data with the project files on Yandex Disk.
    yandex_disk_folder: str = '/Проекты ChatGPT/Web prilogenie'
    welcome_bonus: Decimal = Field(default=Decimal('100'), ge=0, max_digits=12, decimal_places=2)
    cashback_percent: Decimal = Field(default=Decimal('5'), ge=0, le=100)
    cors_origins: str = '*'
    access_token_minutes: int = Field(default=1440, gt=0)


settings = Settings()
