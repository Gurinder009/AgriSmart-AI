import datetime
import re
from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict, field_validator, model_validator

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")

def _check_email(v: str) -> str:
    if not isinstance(v, str):
        raise ValueError("Email must be a string")
    clean = v.strip().lower()
    if not EMAIL_REGEX.match(clean):
        raise ValueError("Invalid email address format.")
    return clean

# --- User & Auth Schemas ---
class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., description="Valid email address")
    phone: Optional[str] = None
    preferred_language: str = Field(default="en", description="en, hi, pa")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _check_email(v)

class UserCreate(BaseModel):
    name: Optional[str] = Field(None, min_length=2, max_length=100)
    full_name: Optional[str] = Field(None, min_length=2, max_length=100)
    email: str = Field(..., description="Valid email address")
    phone: Optional[str] = None
    preferred_language: str = Field(default="en", description="en, hi, pa")
    password: str = Field(..., min_length=6)
    confirm_password: Optional[str] = None
    role: Optional[str] = "farmer"

    @model_validator(mode="before")
    @classmethod
    def resolve_name_alias(cls, values: Any) -> Any:
        if isinstance(values, dict):
            if not values.get("name") and values.get("full_name"):
                values["name"] = values["full_name"]
            elif not values.get("full_name") and values.get("name"):
                values["full_name"] = values["name"]
        return values

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _check_email(v)

    @field_validator("name")
    @classmethod
    def validate_name_not_empty(cls, v: Optional[str]) -> str:
        if not v or len(v.strip()) < 2:
            raise ValueError("Name or Full Name is required and must be at least 2 characters.")
        return v.strip()

class UserLogin(BaseModel):
    email: str = Field(..., description="User email address")
    password: str

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _check_email(v)

class UserUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    preferred_language: Optional[str] = None

class PasswordResetRequest(BaseModel):
    email: str = Field(..., description="Email address for password reset")

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _check_email(v)

class PasswordResetConfirm(BaseModel):
    email: str = Field(..., description="Email address")
    new_password: str = Field(..., min_length=6)

    @field_validator("email")
    @classmethod
    def validate_email(cls, v: str) -> str:
        return _check_email(v)

class UserResponse(UserBase):
    id: int
    role: str
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

class UserRegisterResponse(BaseModel):
    message: str
    user: UserResponse
    access_token: Optional[str] = None

class TokenData(BaseModel):
    user_id: Optional[int] = None
    role: Optional[str] = None


# --- Farm Schemas ---
class FarmBase(BaseModel):
    farm_name: str = Field(..., min_length=2, max_length=150)
    location: str = Field(..., min_length=2, max_length=200)
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area: float = Field(default=1.0, gt=0)
    area_unit: str = Field(default="acres")
    soil_type: str = Field(default="Loamy")
    current_crop: Optional[str] = None

class FarmCreate(FarmBase):
    pass

class FarmUpdate(BaseModel):
    farm_name: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    area: Optional[float] = None
    area_unit: Optional[str] = None
    soil_type: Optional[str] = None
    current_crop: Optional[str] = None

class FarmResponse(FarmBase):
    id: int
    user_id: int
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# --- Soil Analysis Schemas ---
class SoilAnalysisRequest(BaseModel):
    farm_id: Optional[int] = None
    nitrogen: float = Field(..., ge=0, le=500, description="Available N in kg/ha")
    phosphorus: float = Field(..., ge=0, le=500, description="Available P in kg/ha")
    potassium: float = Field(..., ge=0, le=600, description="Available K in kg/ha")
    ph: float = Field(..., ge=2.0, le=12.0, description="Soil pH")
    moisture: float = Field(..., ge=0, le=100, description="Soil Moisture %")
    temperature: Optional[float] = 25.0
    soil_type: Optional[str] = "Loamy"

class ParameterStatus(BaseModel):
    value: float
    unit: str
    status: str # Low, Optimal, High, Critical
    rating: str # Poor, Moderate, Good, Excellent
    ideal_range: str
    recommendation: str

class SoilAnalysisResponse(BaseModel):
    id: Optional[int] = None
    farm_id: Optional[int] = None
    health_score: float # 0 - 100
    overall_rating: str
    parameters: Dict[str, ParameterStatus]
    recommendations: List[str]
    suitable_crops: List[str]
    recorded_at: datetime.datetime

# --- Crop Recommendation Schemas ---
class CropRecommendRequest(BaseModel):
    farm_id: Optional[int] = None
    nitrogen: float = Field(..., ge=0, le=300)
    phosphorus: float = Field(..., ge=0, le=300)
    potassium: float = Field(..., ge=0, le=300)
    temperature: float = Field(..., ge=-10, le=60)
    humidity: float = Field(..., ge=0, le=100)
    ph: float = Field(..., ge=3.0, le=11.0)
    rainfall: float = Field(..., ge=0, le=1000)

class AlternativeCrop(BaseModel):
    crop: str
    confidence: float

class CropRecommendResponse(BaseModel):
    id: Optional[int] = None
    recommended_crop: str
    confidence: float
    alternatives: List[AlternativeCrop]
    crop_info: Dict[str, Any]
    explanation: str
    recorded_at: Optional[datetime.datetime] = None

# --- Disease Prediction Schemas ---
class DiseasePredictResponse(BaseModel):
    id: Optional[int] = None
    crop: str
    disease: str
    confidence: float
    severity: str
    is_healthy: bool
    symptoms: str
    causes: str
    organic_remedy: str
    chemical_remedy: str
    preventive_tips: str
    disclaimer: str
    image_url: str
    metrics: Dict[str, Any]
    created_at: Optional[datetime.datetime] = None

# --- Irrigation Schemas ---
class IrrigationRequest(BaseModel):
    farm_id: Optional[int] = None
    soil_moisture: float = Field(..., ge=0, le=100, description="Volumetric water content %")
    temperature: float = Field(..., ge=-10, le=55)
    humidity: float = Field(..., ge=0, le=100)
    crop: str = Field(..., min_length=2)
    rainfall_probability: float = Field(default=0, ge=0, le=100)
    recent_rainfall: Optional[float] = 0.0
    soil_type: Optional[str] = "Loamy"
    auto_weather_sync: Optional[bool] = False

class IrrigationResponse(BaseModel):
    id: Optional[int] = None
    irrigation_required: bool
    soil_moisture: float
    water_stress_level: str # Severe, Moderate, None
    recommended_duration: str
    water_volume: str
    suggested_time_window: str
    water_saving_tips: List[str]
    reason: str
    weather_source: Optional[str] = None
    weather_summary: Optional[Dict[str, Any]] = None
    created_at: Optional[datetime.datetime] = None

# --- Fertilizer Schemas ---
class FertilizerRequest(BaseModel):
    farm_id: Optional[int] = None
    crop: str
    soil_type: str = "Loamy"
    nitrogen: float = Field(..., ge=0)
    phosphorus: float = Field(..., ge=0)
    potassium: float = Field(..., ge=0)
    ph: float = Field(..., ge=3.0, le=11.0)
    farm_area: float = Field(default=1.0, gt=0)
    area_unit: str = "acres"

class FertilizerBlendItem(BaseModel):
    name: str
    dose_per_unit: str
    total_needed: str
    application_stage: str

class FertilizerResponse(BaseModel):
    crop: str
    deficiencies: List[str]
    suggested_nutrient_focus: str
    fertilizer_schedule: List[FertilizerBlendItem]
    organic_amendments: List[str]
    application_considerations: List[str]
    safety_warning: str

class FertilizerHistoryItem(BaseModel):
    id: int
    farm_id: Optional[int] = None
    crop: str
    soil_values: Dict[str, Any]
    recommendation: List[Dict[str, Any]]
    deficiency: Optional[str] = None
    created_at: datetime.datetime


# --- Weather Schemas ---
class CurrentWeather(BaseModel):
    location: str
    temperature: float
    feels_like: float
    humidity: float
    rainfall: float
    wind_speed: float
    condition: str
    description: str
    icon: str
    rain_probability: float
    uv_index: float
    clouds: Optional[int] = 0
    pressure: Optional[float] = 1013.25
    data_source: Optional[str] = "Simulation/Fallback"
    timestamp: datetime.datetime

class ForecastDay(BaseModel):
    date: str
    day_name: str
    temp_min: float
    temp_max: float
    condition: str
    description: str
    icon: str
    rain_probability: float
    humidity: float

class WeatherResponse(BaseModel):
    current: CurrentWeather
    forecast: List[ForecastDay]
    agricultural_advisory: str
    data_source: str = "Simulation/Fallback"
    fallback_reason: Optional[str] = None

# --- Chat Schemas ---
class ChatMessageRequest(BaseModel):
    question: str = Field(..., min_length=1)
    language: str = Field(default="en", description="en, hi, pa")

class ChatMessageResponse(BaseModel):
    id: int
    question: str
    answer: str
    language: str
    created_at: datetime.datetime
    disclaimer: str

# --- Notification Schemas ---
class NotificationResponse(BaseModel):
    id: int
    title: str
    message: str
    category: str
    severity: str
    is_read: bool
    created_at: datetime.datetime

    model_config = ConfigDict(from_attributes=True)

# --- IoT Sensor Schemas ---
class SensorIngestRequest(BaseModel):
    sensor_id: str = Field(..., min_length=2)
    farm_id: int
    moisture: float = Field(..., ge=0, le=100)
    temperature: float = Field(..., ge=-20, le=70)
    humidity: float = Field(..., ge=0, le=100)
    ph: Optional[float] = Field(default=6.5, ge=0, le=14)
    timestamp: Optional[datetime.datetime] = None

class SensorIngestResponse(BaseModel):
    status: str
    message: str
    sensor_id: str
    farm_id: int
    recorded_at: datetime.datetime

# --- Admin & Analytics Schemas ---
class AdminStatsResponse(BaseModel):
    total_users: int
    total_farmers: int
    total_farms: int
    total_crop_predictions: int
    total_disease_scans: int
    total_irrigation_evals: int
    active_sensors: int
    system_status: str
