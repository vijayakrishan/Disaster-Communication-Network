import sys
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel

# Allow importing predict_risk.py
BASE_DIR = Path(__file__).resolve().parents[1]

sys.path.insert(
    0,
    str(BASE_DIR / "prediction")
)

from predict_risk import predict_risk


# ============================================================
# RESQMESH AI API
# ============================================================

app = FastAPI(
    title="ResQMesh AI Risk Prediction API",
    version="1.0.0"
)


# ============================================================
# REQUEST MODEL
# ============================================================

class RiskRequest(BaseModel):

    water_level: float

    water_level_change_1: float

    water_level_change_3: float

    temperature: float

    pressure: float

    hour: int

    month: int

    day_of_year: int


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/")
def root():

    return {
        "service": "ResQMesh AI",
        "status": "running"
    }


# ============================================================
# PREDICTION API
# ============================================================

@app.post("/predict")
def predict(request: RiskRequest):

    result = predict_risk(
        water_level=request.water_level,
        water_level_change_1=request.water_level_change_1,
        water_level_change_3=request.water_level_change_3,
        temperature=request.temperature,
        pressure=request.pressure,
        hour=request.hour,
        month=request.month,
        day_of_year=request.day_of_year
    )

    return result