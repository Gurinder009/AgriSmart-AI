# AgriSmart AI — System Architecture Document

## Overview
**AgriSmart AI** is a multi-tier, AI-driven precision agriculture platform engineered for smallholder and commercial farmers in India. The platform bridges Machine Learning, Computer Vision, soil telemetry, meteorological APIs, and multi-turn conversational AI into an accessible web dashboard available in **English**, **Hindi (हिन्दी)**, and **Punjabi (ਪੰਜਾਬੀ)**.

---

## 1. High-Level Architecture Diagram

```
                             [ FARMERS & EXTENSION WORKERS ]
                                            │
                                  HTTPS / Mobile Browsers
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │       AgriSmart AI Web Application           │
                    │       (React 18 + TypeScript + Vite)          │
                    │  - Multilingual Engine (EN, HI, PA)           │
                    │  - Recharts Historical Analytics              │
                    │  - Computer Vision Drag-and-Drop Uploader    │
                    │  - Lucide Agricultural Iconography            │
                    └───────────────────────┬───────────────────────┘
                                            │
                               REST / JSON (Bearer JWT)
                                            │
                                            ▼
                    ┌───────────────────────────────────────────────┐
                    │           FastAPI Gateway (Port 8000)         │
                    │  - OAuth2 & JWT Authentication                │
                    │  - Role-Based Access Control (Farmer, Admin)  │
                    │  - CORS Middleware & Static Leaf Storage      │
                    │  - Pydantic V2 Request / Response Validation  │
                    └───────┬───────────────┬───────────────┬───────┘
                            │               │               │
            ┌───────────────┘               │               └───────────────┐
            ▼                               ▼                               ▼
┌───────────────────────┐       ┌───────────────────────┐       ┌───────────────────────┐
│     ML Engine & CV    │       │   Services Subsystem  │       │  Data & Telemetry     │
│ 1. Random Forest      │       │ - Weather Service     │       │ - SQLite / PostgreSQL │
│    Crop Classifier    │       │   (OpenWeather/Sim)   │       │   via SQLAlchemy ORM  │
│    (23 Crops, 95.7%)  │       │ - Smart Irrigation    │       │ - IoT Ingest Endpoint │
│ 2. Leaf CV Pathology  │       │   Water Balance Calc  │       │   (/api/sensors/data) │
│    (10 Pathogen types)│       │ - Fertilizer NPK Def  │       │ - Audit & Predictions │
│ 3. AgriSmart Chatbot  │       │ - Notification Engine │       │ - ESP32 Field Nodes   │
└───────────────────────┘       └───────────────────────┘       └───────────────────────┘
```

---

## 2. Core Subsystems

### A. Machine Learning & Computer Vision
1. **Random Forest Crop Classifier**:
   - **Inputs**: Soil Nitrogen ($N$), Phosphorus ($P$), Potassium ($K$), pH, Ambient Temperature, Relative Humidity, and Precipitation (Rainfall).
   - **Outputs**: Recommended primary crop, confidence percentage, runner-up alternative crops, and customized agronomic guidance.
   - **Trained Model**: 120 estimators, depth 16, evaluated across 2,300 stratified agricultural data points with 95.7% 5-fold cross-validation accuracy.
2. **Computer Vision Disease Detector**:
   - Analyzes botanical characteristics including the Excess Green Index ($2G - R - B$), chlorotic yellowing ratio, and necrotic lesion distribution.
   - Classifies 10 crop disease classes (Early/Late Blight in Tomato/Potato, Rice Blast, Wheat Rust, Corn Rust, Apple Scab, Healthy Leaf).
   - Emits symptoms, biological/organic remedies, chemical dosages, and mandatory agricultural extension disclaimers.

### B. Smart Irrigation Intelligence
- Calculates daily evapotranspiration ($ET_0$) via modified Hargreaves-Samani formulation.
- Adjusts for crop coefficient ($K_c$) and current weather forecast.
- Issues irrigation decisions (YES/NO), recommended application windows (early morning/dusk), duration, and water volumes (Liters/acre).

### C. Soil & Fertilizer Intelligence
- Evaluates soil health on a 100-point index across 5 primary parameters.
- Formulates customized N-P-K fertilizer schedules (DAP, Neem-coated Urea, MOP) scaled directly to the farmer's acreage.

### D. IoT Field Integration
- Standardized REST telemetry endpoint: `POST /api/sensors/data`.
- Ingests soil moisture, ambient temperature, humidity, and pH from remote microcontrollers (ESP32 / Arduino / LoRaWAN).
- Automated background alerts trigger if critical soil dryness (<28%) or high temperature (>38°C) is registered.
