import datetime
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(120), nullable=False)
    email = Column(String(120), unique=True, index=True, nullable=False)
    phone = Column(String(30), nullable=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="farmer", nullable=False) # farmer, admin
    preferred_language = Column(String(10), default="en", nullable=False) # en, hi, pa
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    farms = relationship("Farm", back_populates="owner", cascade="all, delete-orphan")
    soil_records = relationship("SoilData", back_populates="user", cascade="all, delete-orphan")
    crop_predictions = relationship("CropPrediction", back_populates="user", cascade="all, delete-orphan")
    disease_predictions = relationship("DiseasePrediction", back_populates="user", cascade="all, delete-orphan")
    irrigation_records = relationship("IrrigationRecord", back_populates="user", cascade="all, delete-orphan")
    fertilizer_records = relationship("FertilizerRecommendation", back_populates="user", cascade="all, delete-orphan")
    chat_messages = relationship("ChatHistory", back_populates="user", cascade="all, delete-orphan")
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")

class Farm(Base):
    __tablename__ = "farms"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_name = Column(String(150), nullable=False)
    location = Column(String(200), nullable=False)
    latitude = Column(Float, nullable=True)
    longitude = Column(Float, nullable=True)
    area = Column(Float, default=1.0)
    area_unit = Column(String(20), default="acres") # acres, hectares, bigha
    soil_type = Column(String(50), default="Loamy") # Alluvial, Black, Red, Clay, Sandy, Loamy
    current_crop = Column(String(50), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    owner = relationship("User", back_populates="farms")
    soil_records = relationship("SoilData", back_populates="farm", cascade="all, delete-orphan")
    crop_predictions = relationship("CropPrediction", back_populates="farm", cascade="all, delete-orphan")
    disease_predictions = relationship("DiseasePrediction", back_populates="farm", cascade="all, delete-orphan")
    irrigation_records = relationship("IrrigationRecord", back_populates="farm", cascade="all, delete-orphan")
    fertilizer_records = relationship("FertilizerRecommendation", back_populates="farm", cascade="all, delete-orphan")
    sensor_records = relationship("SensorData", back_populates="farm", cascade="all, delete-orphan")

class SoilData(Base):
    __tablename__ = "soil_data"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="SET NULL"), nullable=True)
    nitrogen = Column(Float, nullable=False)
    phosphorus = Column(Float, nullable=False)
    potassium = Column(Float, nullable=False)
    ph = Column(Float, nullable=False)
    moisture = Column(Float, nullable=False)
    temperature = Column(Float, nullable=True)
    humidity = Column(Float, nullable=True)
    health_score = Column(Float, nullable=True)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="soil_records")
    farm = relationship("Farm", back_populates="soil_records")

class CropPrediction(Base):
    __tablename__ = "crop_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="SET NULL"), nullable=True)
    nitrogen = Column(Float, nullable=False)
    phosphorus = Column(Float, nullable=False)
    potassium = Column(Float, nullable=False)
    ph = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    rainfall = Column(Float, nullable=False)
    recommended_crop = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    alternative_crops = Column(Text, nullable=True) # JSON string of alternatives
    explanation = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="crop_predictions")
    farm = relationship("Farm", back_populates="crop_predictions")

class DiseasePrediction(Base):
    __tablename__ = "disease_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="SET NULL"), nullable=True)
    crop = Column(String(50), nullable=False)
    image_path = Column(String(255), nullable=False)
    disease = Column(String(100), nullable=False)
    confidence = Column(Float, nullable=False)
    severity = Column(String(30), default="Moderate") # Low, Moderate, High
    recommendations = Column(Text, nullable=False) # JSON or descriptive string
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="disease_predictions")
    farm = relationship("Farm", back_populates="disease_predictions")

class IrrigationRecord(Base):
    __tablename__ = "irrigation_records"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="SET NULL"), nullable=True)
    soil_moisture = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    rainfall_probability = Column(Float, nullable=False)
    crop = Column(String(50), nullable=False)
    irrigation_required = Column(Boolean, nullable=False)
    recommended_duration = Column(String(50), nullable=True) # e.g. "45 minutes"
    water_volume = Column(String(50), nullable=True) # e.g. "3500 liters"
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="irrigation_records")
    farm = relationship("Farm", back_populates="irrigation_records")

class FertilizerRecommendation(Base):
    __tablename__ = "fertilizer_recommendations"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="SET NULL"), nullable=True)
    crop = Column(String(50), nullable=False)
    soil_values = Column(Text, nullable=False) # JSON string of NPK, pH
    recommendation = Column(Text, nullable=False)
    deficiency = Column(String(100), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="fertilizer_records")
    farm = relationship("Farm", back_populates="fertilizer_records")

class WeatherRecord(Base):
    __tablename__ = "weather_records"
    
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="SET NULL"), nullable=True)
    location = Column(String(150), nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    rainfall = Column(Float, default=0.0)
    wind_speed = Column(Float, default=0.0)
    condition = Column(String(100), nullable=False)
    forecast_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class ChatHistory(Base):
    __tablename__ = "chat_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    answer = Column(Text, nullable=False)
    language = Column(String(10), default="en")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="chat_messages")

class Notification(Base):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(150), nullable=False)
    message = Column(Text, nullable=False)
    category = Column(String(50), default="general") # weather, irrigation, disease, soil, system
    severity = Column(String(20), default="info") # info, warning, alert, success
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="notifications")

class SensorData(Base):
    __tablename__ = "sensor_data"
    
    id = Column(Integer, primary_key=True, index=True)
    farm_id = Column(Integer, ForeignKey("farms.id", ondelete="CASCADE"), nullable=False)
    sensor_id = Column(String(60), nullable=False) # e.g. "ESP32-NODE-01"
    moisture = Column(Float, nullable=False)
    temperature = Column(Float, nullable=False)
    humidity = Column(Float, nullable=False)
    ph = Column(Float, nullable=True)
    recorded_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    farm = relationship("Farm", back_populates="sensor_records")

