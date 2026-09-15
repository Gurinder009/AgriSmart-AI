import os
from typing import List

BASE_BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT_DIR = os.path.dirname(BASE_BACKEND_DIR)
default_db_path = os.path.join(BASE_BACKEND_DIR, "agrismart.db").replace("\\", "/")
default_upload_dir = os.path.join(BASE_BACKEND_DIR, "uploads")

# Load environment variables from backend/.env and root/.env if available
try:
    from dotenv import load_dotenv
    load_dotenv(os.path.join(PROJECT_ROOT_DIR, ".env"))
    load_dotenv(os.path.join(BASE_BACKEND_DIR, ".env"), override=True)
except ImportError:
    pass

class Settings:
    PROJECT_NAME: str = "AgriSmart AI — Intelligent Smart Agriculture Platform"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api"
    
    DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{default_db_path}")
    JWT_SECRET: str = os.getenv("JWT_SECRET", "agrismart_super_secret_jwt_key_development_change_in_production_987654")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))
    
    @property
    def WEATHER_API_KEY(self) -> str:
        return os.getenv("WEATHER_API_KEY", "").strip()
        
    LLM_API_KEY: str = os.getenv("LLM_API_KEY", "")
    
    CORS_ORIGINS: List[str] = [
        origin.strip() for origin in os.getenv(
            "CORS_ORIGINS",
            "http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:3000,*"
        ).split(",") if origin.strip()
    ]
    
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", default_upload_dir)
    DISEASE_UPLOAD_DIR: str = os.path.join(UPLOAD_DIR, "disease")
    SAMPLE_LEAVES_DIR: str = os.path.join(UPLOAD_DIR, "sample_leaves")

settings = Settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.DISEASE_UPLOAD_DIR, exist_ok=True)
os.makedirs(settings.SAMPLE_LEAVES_DIR, exist_ok=True)

