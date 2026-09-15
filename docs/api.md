# AgriSmart AI — REST API Documentation

## Base URL
- Local Development: `http://localhost:8000/api`
- Interactive Swagger UI: `http://localhost:8000/docs`
- ReDoc UI: `http://localhost:8000/redoc`

---

## 1. Authentication
- `POST /api/auth/register`: Register a new farmer or admin account.
  - Body: `{"name": "...", "email": "...", "password": "...", "phone": "...", "preferred_language": "en|hi|pa", "role": "farmer|admin"}`
- `POST /api/auth/login`: Authenticate and receive a JWT Bearer token.
  - Body: `{"email": "demo@agrismart.local", "password": "Demo@12345"}`
  - Response: `{"access_token": "...", "token_type": "bearer", "user": {...}}`
- `GET /api/auth/me`: Retrieve current logged-in user profile (Bearer token required).
- `PUT /api/auth/profile`: Update name, phone, or preferred language.
- `POST /api/auth/reset-password`: Reset user password.

---

## 2. Farm Management
- `GET /api/farms`: Retrieve all farms owned by the user (or all system farms if admin).
- `POST /api/farms`: Register a new farm.
  - Body: `{"farm_name": "...", "location": "...", "area": 5.0, "area_unit": "acres", "soil_type": "Loamy", "current_crop": "Wheat"}`
- `GET /api/farms/{id}`: Farm details.
- `PUT /api/farms/{id}`: Update farm information.
- `DELETE /api/farms/{id}`: Delete farm and cascade-delete telemetry.
- `GET /api/farms/{id}/telemetry`: Retrieve latest soil and sensor telemetry for farm.

---

## 3. Crop Recommendation AI
- `POST /api/crop/recommend`: Run ML Random Forest prediction.
  - Body: `{"nitrogen": 90, "phosphorus": 42, "potassium": 43, "temperature": 25, "humidity": 80, "ph": 6.5, "rainfall": 200}`
  - Response:
    ```json
    {
      "recommended_crop": "wheat",
      "confidence": 94.2,
      "alternatives": [{"crop": "chickpea", "confidence": 3.8}],
      "crop_info": { "scientific_name": "Triticum aestivum", "season": "Rabi", ... },
      "explanation": "Given your soil profile..."
    }
    ```
- `GET /api/crop/history`: Retrieve past recommendations.

---

## 4. Crop Disease Detection (Computer Vision)
- `POST /api/disease/predict`: Upload foliage image for pathology classification.
  - Multipart form data: `file` (JPEG, PNG, WebP, max 10MB), optional `farm_id`.
  - Response:
    ```json
    {
      "crop": "Tomato",
      "disease": "Early Blight (Alternaria solani)",
      "confidence": 92.4,
      "severity": "Moderate",
      "symptoms": "Dark brown circular spots with concentric rings...",
      "organic_remedy": "Spray Neem seed kernel extract (5%)...",
      "chemical_remedy": "Apply Mancozeb 75% WP @ 2.5g/L...",
      "disclaimer": "AI prediction — verify with a local agricultural expert..."
    }
    ```
- `GET /api/disease/history`: View past scans.

---

## 5. Soil Fertility Analysis
- `POST /api/soil/analyze`:
  - Body: `{"nitrogen": 88, "phosphorus": 44, "potassium": 42, "ph": 6.6, "moisture": 48}`
  - Response: 100-point soil health score, rating, parameter breakdown, suitable crops.

---

## 6. Fertilizer Advisor
- `POST /api/fertilizer/recommend`:
  - Body: `{"crop": "Wheat", "nitrogen": 85, "phosphorus": 35, "potassium": 35, "ph": 6.6, "farm_area": 5.0, "area_unit": "acres"}`
  - Response: Specific commercial bag quantities (DAP, Neem-coated Urea, MOP) scaled to farm acreage.

---

## 7. Smart Irrigation
- `POST /api/irrigation/recommend`:
  - Body: `{"soil_moisture": 32, "temperature": 28, "humidity": 55, "crop": "Wheat", "rainfall_probability": 15}`
  - Response: `{"irrigation_required": true, "recommended_duration": "45 minutes", "suggested_time_window": "Early morning 06:00 AM", ...}`

---

## 8. Weather Integration
- `GET /api/weather/current`: Current weather conditions, humidity, rain probability, and agricultural advisory.
- `GET /api/weather/forecast`: 7-day meteorological forecast.

---

## 9. AI Agriculture Assistant
- `POST /api/chat`:
  - Body: `{"question": "My wheat leaves are turning yellow.", "language": "en|hi|pa"}`
  - Response: Agronomic answer in the chosen language.
- `GET /api/chat/history`: Conversation memory.
- `DELETE /api/chat/clear`: Clear conversation turns.

---

## 10. IoT Sensor Ingestion
- `POST /api/sensors/data`: Telemetry endpoint for ESP32/microcontroller hardware.
  - Body: `{"sensor_id": "ESP32-01", "farm_id": 1, "moisture": 42.5, "temperature": 24.8, "humidity": 64.0, "ph": 6.7}`
