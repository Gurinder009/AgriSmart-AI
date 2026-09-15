# AgriSmart AI — Database Schema & ER Architecture

## Database Engine
- **Default (Zero-Config)**: SQLite (`sqlite:///./agrismart.db`)
- **Production (Enterprise)**: PostgreSQL (`postgresql://postgres:postgres@localhost:5432/agrismart_db`)
- Managed through **SQLAlchemy 2.0 ORM** with automated declarative schema creation.

---

## Entity Relationship Summary

```
   ┌───────────┐         1:N         ┌───────────┐
   │   users   │────────────────────<│   farms   │
   └─────┬─────┘                     └─────┬─────┘
         │                                 │
         │ 1:N                             ├─── 1:N ──< soil_data
         ├───< chat_history                ├─── 1:N ──< crop_predictions
         └───< notifications               ├─── 1:N ──< disease_predictions
                                           ├─── 1:N ──< irrigation_records
                                           ├─── 1:N ──< fertilizer_recommendations
                                           └─── 1:N ──< sensor_data
```

---

## Detailed Table Schemas

### 1. `users`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY, AUTOINCREMENT | Unique user identifier |
| `name` | VARCHAR(120) | NOT NULL | Farmer / Administrator full name |
| `email` | VARCHAR(120) | UNIQUE, INDEX, NOT NULL | Account login email |
| `phone` | VARCHAR(30) | NULLABLE | Mobile contact number |
| `password_hash` | VARCHAR(255) | NOT NULL | Bcrypt salted password hash |
| `role` | VARCHAR(20) | NOT NULL, DEFAULT 'farmer' | Access role: `farmer` or `admin` |
| `preferred_language` | VARCHAR(10) | DEFAULT 'en' | User locale: `en`, `hi`, `pa` |
| `created_at` | DATETIME | DEFAULT UTC NOW | Account creation timestamp |
| `updated_at` | DATETIME | DEFAULT UTC NOW | Last profile update timestamp |

### 2. `farms`
| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | INTEGER | PRIMARY KEY | Unique farm identifier |
| `user_id` | INTEGER | FOREIGN KEY -> `users.id` (CASCADE) | Owner user ID |
| `farm_name` | VARCHAR(150) | NOT NULL | Name of field plot |
| `location` | VARCHAR(200) | NOT NULL | District, State, Country |
| `latitude` | FLOAT | NULLABLE | Geographical latitude coordinate |
| `longitude` | FLOAT | NULLABLE | Geographical longitude coordinate |
| `area` | FLOAT | DEFAULT 1.0 | Field area |
| `area_unit` | VARCHAR(20) | DEFAULT 'acres' | `acres`, `hectares`, `bigha` |
| `soil_type` | VARCHAR(50) | DEFAULT 'Loamy' | Texture class |
| `current_crop` | VARCHAR(50) | NULLABLE | Currently planted crop |

### 3. `soil_data`
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Soil test record ID |
| `farm_id` | INTEGER FK | Target farm ID |
| `nitrogen` | FLOAT | Available N in kg/ha |
| `phosphorus` | FLOAT | Available P in kg/ha |
| `potassium` | FLOAT | Available K in kg/ha |
| `ph` | FLOAT | Soil pH value (0 - 14) |
| `moisture` | FLOAT | Volumetric water content % |
| `health_score` | FLOAT | Computed 0-100 soil fertility score |

### 4. `crop_predictions`
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Prediction ID |
| `farm_id` | INTEGER FK | Associated farm ID |
| `recommended_crop` | VARCHAR(50) | Primary ML output crop |
| `confidence` | FLOAT | Model probability % |
| `alternative_crops` | TEXT | JSON string of runner-up crops |
| `explanation` | TEXT | Agronomic rationale |

### 5. `disease_predictions`
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Scan ID |
| `farm_id` | INTEGER FK | Associated farm ID |
| `crop` | VARCHAR(50) | Identified host plant |
| `image_path` | VARCHAR(255) | Static URL of uploaded leaf |
| `disease` | VARCHAR(100) | Pathological condition |
| `confidence` | FLOAT | CV confidence score % |
| `severity` | VARCHAR(30) | `Low`, `Moderate`, `High` |
| `recommendations` | TEXT | Chemical & bio remedies |

### 6. `sensor_data` (IoT Ready)
| Column | Type | Description |
|---|---|---|
| `id` | INTEGER PRIMARY KEY | Ingest packet ID |
| `farm_id` | INTEGER FK | Associated farm ID |
| `sensor_id` | VARCHAR(60) | Microcontroller ID (e.g. `ESP32-NODE-01`) |
| `moisture` | FLOAT | Live volumetric soil moisture % |
| `temperature` | FLOAT | Ambient temperature in °C |
| `humidity` | FLOAT | Ambient relative humidity % |
| `ph` | FLOAT | In-situ soil pH reading |
