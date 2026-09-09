from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    MONGO_URL: str
    MONGO_DB_NAME: str = "QuickMeetCluster"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    SECRET_KEY: str
    FIREBASE_CREDENTIALS_BASE64: str | None = None
    FRONTEND_URL: str = "http://localhost:3000"
    
    class Config:
        env_file = ".env"

settings = Settings()
