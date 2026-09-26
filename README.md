# AgriSmart AI

> **Intelligent Smart Agriculture Platform for Indian & Global Precision Farming**

[![FastAPI](https://img.shields.io/badge/Backend-FastAPI_0.141-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/Frontend-React_18_+_TypeScript-61DAFB.svg?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Bundler-Vite_8-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind_CSS_3.4-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![scikit-learn](https://img.shields.io/badge/ML-scikit--learn_Random_Forest-F7931E.svg?logo=scikit-learn&logoColor=white)](https://scikit-learn.org)
[![Python](https://img.shields.io/badge/Python-3.11_--_3.14-3776AB.svg?logo=python&logoColor=white)](https://python.org)
[![Languages](https://img.shields.io/badge/Languages-English_•_हिन्दी_•_ਪੰਜਾਬੀ-22c55e.svg)](#features)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## Overview

**AgriSmart AI** is a complete, production-grade intelligent smart agriculture platform designed to empower smallholder and commercial farmers by replacing guesswork with data-driven precision farming. The system integrates machine learning, computer vision, IoT environmental telemetry, automated agronomic decision support, and trilingual conversational assistance.

Key objectives:
- **Maximize Crop Yield**: Suggest optimal crops according to exact soil parameters (N, P, K, pH) and climate conditions (temperature, humidity, rainfall).
- **Prevent Crop Loss**: Detect leaf diseases early via image processing with instant actionable organic and chemical remedies.
- **Optimize Resource Consumption**: Provide area-scaled fertilizer plans (DAP, Urea, MOP) and evapotranspiration-based irrigation schedules to conserve water and inputs.
- **Empower Farmers**: Bridge language barriers through native support for English, Hindi (हिन्दी), and Punjabi (ਪੰਜਾਬੀ).

---

## Features

1. **🌾 Machine Learning Crop Recommendation**
   - 95.7% accuracy Random Forest classifier trained across 23 staple crops (Rice, Wheat, Maize, Cotton, Sugarcane, Jute, Pulses, Fruits, etc.).
   - Confidence scoring and top alternate crop recommendations.

2. **🍃 Computer Vision Leaf Disease Detection**
   - Instant leaf photo diagnosis for conditions such as Early Blight, Late Blight, Leaf Rust, Powdery Mildew, and Healthy specimens.
   - Actionable remediation advice: organic remedies, chemical treatments, and prevention protocols.

3. **🧪 Soil Health & Fertility Analysis**
   - 100-point soil fertility scoring algorithm.
   - Comprehensive N-P-K nutrient status categorization and micronutrient deficiency diagnosis.

4. **⚖️ Area-Scaled Fertilizer Advisor**
   - Translates raw nutrient requirements into commercial fertilizer formulations (Urea, DAP, MOP).
   - Tailored specifically to the farm's exact acreage or hectare dimensions.

5. **💧 Smart Irrigation & Water Balance**
   - Daily evapotranspiration calculation (ET₀) and groundwater management.
   - Precipitation-adjusted watering duration and volume recommendations.

6. **🌦️ Weather Intelligence**
   - 7-day agricultural forecasts with spray advisories, frost warnings, and harvesting condition indices.
   - Built-in agricultural weather simulation engine when external API keys are omitted.

7. **🤖 Trilingual AI Agriculture Copilot**
   - Conversational assistant answering agronomic questions fluently in English, Hindi (हिन्दी), and Punjabi (ਪੰਜਾਬੀ).
   - Knowledge base covering pest control, crop cycles, soil amendments, and government schemes.

8. **📡 IoT Microcontroller Telemetry**
   - Real-time REST ingestion (`POST /api/sensors/data`) supporting ESP32, ESP8266, and Arduino LoRa field nodes.

---

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Bundler & Tooling**: Vite 8
- **Styling**: Tailwind CSS 3.4 (Custom agricultural palette)
- **Routing**: React Router DOM v7
- **Telemetry Charts**: Recharts
- **Iconography**: Lucide React
- **HTTP Client**: Axios with automated JWT Bearer authorization interceptors

### Backend
- **Framework**: Python 3.10 - 3.14 + FastAPI
- **Data Validation**: Pydantic v2
- **ORM & Database**: SQLAlchemy 2.0 (Zero-config SQLite for local development, PostgreSQL ready for production)
- **Authentication**: Bcrypt password hashing & PyJWT token handling
- **Testing**: Pytest & FastAPI TestClient

### Machine Learning & Data Science
- **Libraries**: scikit-learn, NumPy, Pandas, Joblib, Pillow (PIL)
- **Models**: Random Forest Classifier with 5-fold cross validation

---

## Project Architecture

```
AgriSmart-AI/
├── backend/                      # FastAPI Python Application
│   ├── app/
│   │   ├── config.py             # System configuration & environment loading
│   │   ├── database.py           # SQLAlchemy database session & engine
│   │   ├── main.py               # Application entrypoint, CORS, lifespan
│   │   ├── ml/                   # ML inference wrappers & serialized models
│   │   ├── models/               # SQLAlchemy ORM models (11 core schemas)
│   │   ├── routers/              # 13 REST API endpoints
│   │   ├── schemas/              # Pydantic validation models
│   │   ├── services/             # Agronomic business logic engines
│   │   └── utils/                # Security helpers & database seeders
│   ├── tests/                    # Automated Pytest suite
│   ├── requirements.txt          # Python dependencies
│   └── Dockerfile                # Backend container definition
├── frontend/                     # React 18 + TypeScript + Vite
│   ├── src/
│   │   ├── components/           # Reusable UI widgets, Navbar, Sidebar
│   │   ├── context/              # Auth, Language, and Notification state
│   │   ├── i18n/                 # Multi-language translations (en, hi, pa)
│   │   ├── layouts/              # Dashboard & Public layouts
│   │   ├── pages/                # 14 Full application views
│   │   ├── services/             # Axios API integration layer
│   │   └── types/                # Domain type interfaces
│   ├── package.json              # Frontend dependencies
│   └── Dockerfile                # Frontend container definition
├── ml/                           # ML Training & Research Pipelines
│   ├── datasets/                 # 23-crop agronomic training data
│   ├── models/                   # Serialized .joblib models
│   └── training/                 # Model training and benchmark scripts
├── scripts/                      # Telemetry generators & test utilities
├── docs/                         # Extended architectural & API documentation
├── docker-compose.yml            # Multi-service container orchestration
└── README.md                     # Platform documentation
```

---

## Installation

### Prerequisites
- **Python**: 3.10, 3.11, 3.12, 3.13, or 3.14
- **Node.js**: 18.x or higher & npm
- **Git**: Installed and configured

Clone the repository:
```bash
git clone https://github.com/<YOUR_GITHUB_USERNAME>/AgriSmart-AI.git
cd AgriSmart-AI
```

---

## Backend Setup

1. Navigate to the `backend/` directory:
   ```bash
   cd backend
   ```

2. Create and activate a virtual environment:
   ```bash
   # Windows
   python -m venv venv
   .\venv\Scripts\activate

   # macOS / Linux
   python3 -m venv venv
   source venv/bin/activate
   ```

3. Install required Python packages:
   ```bash
   pip install -r requirements.txt
   ```

4. Run the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --port 8000
   ```

The backend server will run at `http://127.0.0.1:8000`.

---

## Frontend Setup

1. Open a separate terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

The frontend application will be live at `http://localhost:5173`.

---

## Database Setup

AgriSmart AI defaults to a **zero-configuration SQLite database** for local development.

- On the first backend startup, tables are automatically created via SQLAlchemy.
- Default demo accounts, initial farm telemetry, sample soil analyses, and notification channels are automatically populated by `app/utils/seed_data.py`.

### PostgreSQL Setup (Optional for Production)
If you prefer PostgreSQL, set the `DATABASE_URL` environment variable:
```bash
DATABASE_URL="postgresql://postgres:password@localhost:5432/agrismart_db"
```

Or deploy using Docker Compose:
```bash
docker-compose up --build
```

---

## Environment Variables

Copy `.env.example` to create your `.env` file:

```bash
cp .env.example .env
```

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | SQLAlchemy database connection string | `sqlite:///./agrismart.db` |
| `JWT_SECRET` | Secret key used for signing JWT tokens | Secure random string |
| `JWT_ALGORITHM` | JWT signing algorithm | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Authentication token validity | `1440` (24 hours) |
| `WEATHER_API_KEY` | OpenWeatherMap API Key (optional fallback engine included) | `""` |
| `LLM_API_KEY` | OpenAI / Gemini API Key (optional fallback knowledge base included) | `""` |
| `CORS_ORIGINS` | Comma-separated allowed frontend origins | `http://localhost:5173,http://localhost:3000` |
| `UPLOAD_DIR` | Directory for uploaded leaf diagnostic photos | `./uploads` |

---

## ML Model Setup

The project includes pre-trained scikit-learn models located at `backend/app/ml/crop_rf_model.joblib`.

To regenerate the synthetic training dataset or retrain the Random Forest model:
```bash
# Run training pipeline
python ml/training/train_crop_model.py

# Evaluate metrics (Cross-validation accuracy: ~95.7%)
python ml/training/evaluate_models.py
```

Trained models are automatically synchronized to `backend/app/ml/` for direct inference.

---

## API Documentation

Once the backend is running, interactive API documentation is available at:
- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

### Core Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate user & receive JWT token |
| `POST` | `/api/auth/register` | Register a new farmer account |
| `GET` | `/api/farms/` | List all registered farms for user |
| `POST` | `/api/crop/recommend` | ML-driven crop recommendation from N, P, K, pH |
| `POST` | `/api/disease/predict` | Upload leaf photo for CV disease diagnosis |
| `POST` | `/api/soil/analyze` | Calculate soil fertility score & amendments |
| `POST` | `/api/fertilizer/recommend` | Generate farm-scaled NPK fertilizer dosages |
| `POST` | `/api/irrigation/calculate` | Compute daily crop water requirements & duration |
| `GET` | `/api/weather/forecast` | 7-day agricultural weather forecast |
| `POST` | `/api/chat/message` | Trilingual AI agricultural copilot chat |
| `POST` | `/api/sensors/data` | IoT node sensor ingestion |

---

## Demo Account

The system comes pre-configured with instant demonstration accounts for quick evaluation:

| Account Type | Email | Password | Access Level |
|---|---|---|---|
| **Farmer Account** | `demo@agrismart.local` | `Demo@12345` | Farm dashboard, crop recommendations, disease scans, soil logs |
| **Admin Account** | `admin@agrismart.local` | `Admin@12345` | System-wide statistics, all farms, user audit logs |

> **Quick Login Tip**: Click the **"🌾 Demo Farmer"** or **"🛡️ Demo Admin"** shortcut buttons directly on the login page for instant one-click login.

---

## Screenshots section

### 1. Unified Farm Command Center
*Real-time farm overview, weather widgets, active alerts, quick actions, and sensor feeds.*

### 2. ML Crop Recommendation Engine
*Interactive N-P-K nutrient sliders, soil pH, and rainfall parameters yielding ranked crop recommendations.*

### 3. Leaf Disease Detection & Diagnosis
*Drag-and-drop leaf image scanner providing classification confidence and organic & chemical remedies.*

### 4. Soil Fertility & Micronutrient Health
*100-point fertility dial, nutrient gauges, and deficiency warnings.*

### 5. Area-Scaled Fertilizer Schedule
*Precision DAP, Urea, and MOP distribution schedules calculated to the exact farm area.*

### 6. Trilingual AI Agronomist Chat
*Multilingual agricultural guidance in English, Hindi (हिन्दी), and Punjabi (ਪੰਜਾਬੀ).*

---

## Future Scope

- **Drone Multispectral Imagery**: Support for NDVI (Normalized Difference Vegetation Index) orthomosaics.
- **Satellite Soil Moisture Ingestion**: Integration with Sentinel-2 and ISRO open satellite data feeds.
- **Mandi Price Prediction**: Deep learning models for agricultural produce market price forecasting.
- **Automated Solenoid Valves**: Bi-directional IoT control enabling direct automated valve actuation based on soil moisture thresholds.
- **Offline Progressive Web App (PWA)**: Enhanced mobile caching for low-connectivity rural environments.

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
