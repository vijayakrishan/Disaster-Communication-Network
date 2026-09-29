# RESQMESH AI Backend (`AI-backend`)

Standalone Spring Boot 3 & Python ML Decision Support & Disaster Risk Prediction Backend Service for the **RESQMESH** LoRa Mesh Emergency Communication Network.

---

## 1. Overview

**RESQMESH** is a deployable LoRa mesh emergency communication network for remote and disaster-affected areas lacking cellular infrastructure.

The hardware network consists of:
- **Victim Node**: ESP32 + SX1278 LoRa + GPS + SOS button
- **Relay Nodes**: ESP32 + SX1278 LoRa mesh repeaters
- **Base Station**: ESP32 + SX1278 LoRa connected to command laptop/backend

The **AI Backend Module** is an environmental disaster risk estimation and decision-support service. It evaluates environmental, atmospheric, and temporal patterns across 52 physical parameters to estimate flood and disaster risk regimes in real time.

> **Operational Scope Note**:
> The model output represents **AI-based disaster risk estimation / decision support**. It is intended as an early warning and decision aid and does not guarantee that a disaster will occur.

---

## 2. Directory Structure

```
AI-backend/
├── src/                                 # Spring Boot 3 Java source code
│   ├── main/java/com/resqmesh/ai/       # Controllers, Services, DTOs, Configs
│   ├── main/resources/application.properties  # Service configuration (port 8086)
│   ├── main/resources/model/            # Packaged model files for in-memory inference
│   ├── main/resources/static/           # Interactive Web UI dashboard (HTML/CSS/JS)
│   └── test/java/com/resqmesh/ai/       # Automated test suite (19 unit/integration tests)
│
├── models/                              # Trained model artifacts & feature schemas
│   ├── resqmesh_final_validated_model.json
│   ├── resqmesh_final_validated_features.json
│   ├── resqmesh_final_validated_threshold.json
│   └── other trained model checkpoints...
│
├── prediction/                          # Python inference & FastAPI service
│   ├── ai_api.py                        # FastAPI prediction endpoint
│   └── predict_risk.py                  # Standalone inference helper
│
├── scripts/                             # Reproducible training pipelines
│   └── train_model.py                   # One-command reproducible training entry point
│
├── training/                            # Comprehensive 50-step training research pipeline
│   ├── 01_inspect_all.py ... 50_final_validation.py
│   └── README.md
│
├── reports/                             # Evaluation reports & validation metrics
│   ├── final_training_report.md
│   ├── final_metrics.json
│   ├── confusion_matrix.csv
│   └── feature_importance.csv
│
├── data/                                # Catalogs, rainfall normals & event registers
│   ├── raw/
│   ├── processed/
│   └── README.md
│
├── pom.xml                              # Maven build file (Spring Boot 3.3.x, XGBoost4J)
├── requirements.txt                     # Python dependencies (pandas, numpy, scikit-learn, xgboost)
├── run_demo.bat                         # Windows one-click demonstration launcher
├── .gitignore                           # AI-backend specific ignore rules
└── README.md                            # Complete documentation
```

---

## 3. Quick Start: Running the AI Backend & Dashboard

### Option A: One-Click Windows Launcher (Easiest)
From this directory, double-click `run_demo.bat` or run:
```cmd
run_demo.bat
```
This checks your Java/Maven environment, starts the service on port `8086`, and automatically opens the interactive dashboard in your browser.

### Option B: Using Maven (Development)
```powershell
mvn spring-boot:run
```

### Option C: Building & Running Standalone JAR
```powershell
mvn clean package -DskipTests
java -jar target\resqmesh-ai-backend-1.0.0.jar
```

Once started, open:
👉 **`http://localhost:8086`**

---

## 4. Opening in IDEs

### IntelliJ IDEA
1. Open **IntelliJ IDEA**.
2. Select **File → Open...** and choose the `AI-backend` folder.
3. IntelliJ IDEA will detect `pom.xml` and import dependencies automatically.
4. Locate `src/main/java/com/resqmesh/ai/ResqmeshAiApplication.java` and click **Run ▶**.

### VS Code
1. Open VS Code in `AI-backend`.
2. Ensure the **Extension Pack for Java** is installed.
3. Press `F5` or run `ResqmeshAiApplication`.

---

## 5. REST API Documentation

### A. Health & Model Status
**`GET /api/ai/health`**

Response (`200 OK`):
```json
{
  "status": "UP",
  "modelLoaded": true,
  "modelVersion": "resqmesh-final-validated",
  "featureCount": 52,
  "threshold": 0.5,
  "message": "RESQMESH AI Decision Support Service is operational and model is loaded."
}
```

### B. List Feature Schema
**`GET /api/ai/features`**

Response (`200 OK`):
Returns the 52 feature names in strict order.

### C. Demonstration Scenarios
**`GET /api/ai/demo-scenarios`**

Response (`200 OK`):
Returns pre-configured `safe` and `highRisk` feature vectors extracted from actual historical disaster events.

### D. Disaster Risk Prediction
**`POST /api/ai/predict`**

Headers:
`Content-Type: application/json`

Request Body:
```json
{
  "features": {
    "temperature_2m": 24.2,
    "relative_humidity_2m": 84.0,
    "dew_point_2m": 21.4,
    "precipitation": 0.7,
    "rain": 0.7,
    "surface_pressure": 1006.6,
    "cloud_cover": 100.0,
    "cloud_cover_low": 22.0,
    "wind_speed_10m": 28.4,
    "wind_direction_10m": 38.0,
    "rain_binary": 1.0,
    "temperature_humidity_index": 20.33,
    "wind_u": -17.48,
    "wind_v": -22.38,
    "rain_3h": 1.2,
    "rain_6h": 1.7,
    "rain_12h": 4.2,
    "rain_24h": 236.7,
    "rain_48h": 512.9,
    "precip_3h": 1.2,
    "precip_6h": 1.7,
    "precip_12h": 4.2,
    "precip_24h": 236.7,
    "precip_48h": 512.9,
    "rain_3h_max": 0.7,
    "rain_6h_max": 0.7,
    "rain_12h_max": 1.3,
    "rain_24h_max": 59.8,
    "humidity_6h_mean": 83.33,
    "humidity_12h_mean": 84.75,
    "humidity_24h_mean": 88.54,
    "humidity_24h_max": 93.0,
    "temperature_6h_mean": 24.15,
    "temperature_24h_mean": 24.31,
    "temperature_24h_min": 23.8,
    "temperature_24h_max": 25.1,
    "cloud_6h_mean": 100.0,
    "cloud_12h_mean": 100.0,
    "cloud_24h_mean": 100.0,
    "pressure_change_3h": 0.1,
    "pressure_change_6h": -1.8,
    "pressure_change_12h": 0.0,
    "pressure_change_24h": 1.2,
    "rain_change_1h": 0.5,
    "rain_change_3h": 0.4,
    "rain_change_6h": 0.5,
    "is_heavy_rain_3h": 0.0,
    "is_heavy_rain_6h": 0.0,
    "is_heavy_rain_24h": 1.0,
    "is_extreme_rain_24h": 1.0,
    "rain_acceleration": 0.35,
    "humidity_pressure_risk": 159.37
  }
}
```

Response (`200 OK`):
```json
{
  "riskScore": 0.5422,
  "riskLevel": "DANGER",
  "binaryDecision": "DISASTER_RISK_ALERT",
  "validatedThreshold": 0.5,
  "modelVersion": "resqmesh-final-validated",
  "timestamp": "2026-09-29T08:27:04.737426800Z",
  "latencyMs": 4,
  "message": "AI-based disaster risk estimation / decision support"
}
```

---

## 6. Architecture & Native XGBoost4J Inference

- **In-Memory Model Loading**: `ModelLoaderService` loads the native XGBoost Booster into memory during startup. No reload overhead per HTTP request.
- **Ultra-low Latency**: Direct in-memory C++ evaluation via `ml.dmlc:xgboost4j_2.12:2.1.4`. Average inference latency: **3 to 10 ms**.
- **Strict Feature Validation**: `FeatureValidationService` enforces exact 52 features, rejecting missing, null, or out-of-order payloads with HTTP 400.

---

## 7. Python AI Retraining & Research Pipeline

### Setup Python Environment
```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

### Run Reproducible Training
```powershell
python scripts/train_model.py
```

### Python FastAPI Prediction Microservice (Alternative)
```powershell
uvicorn prediction.ai_api:app --host 0.0.0.0 --port 8000 --reload
```

---

## 8. Validation Metrics (Unseen 2023 Flood Test)

- **Accuracy**: 75.43%
- **Balanced Accuracy**: 53.76%
- **Precision**: 54.55%
- **Recall**: 10.42%
- **F1 Score**: 17.49%
- **ROC-AUC**: **0.9077**
- **PR-AUC**: **0.6388**
- **Frozen Binary Threshold**: 0.5000 (calibrated on 2021 Dev event)
