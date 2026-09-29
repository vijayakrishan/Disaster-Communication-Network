import sys
import json
import numpy as np
import joblib
from pathlib import Path

from xgboost import XGBClassifier


# ============================================================
# RESQMESH REAL-TIME RISK PREDICTION
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

MODEL_FILE = (
    BASE_DIR
    / "models"
    / "resqmesh_xgboost_model.json"
)

INFO_FILE = (
    BASE_DIR
    / "models"
    / "resqmesh_xgboost_features.joblib"
)


# ============================================================
# LOAD MODEL
# ============================================================

model = XGBClassifier()

model.load_model(
    MODEL_FILE
)

model_info = joblib.load(
    INFO_FILE
)

FEATURES = model_info["features"]


# ============================================================
# PREDICTION FUNCTION
# ============================================================

def predict_risk(
    water_level,
    water_level_change_1,
    water_level_change_3,
    temperature,
    pressure,
    hour,
    month,
    day_of_year
):

    # --------------------------------------------------------
    # Cyclic time features
    # --------------------------------------------------------

    hour_sin = np.sin(
        2 * np.pi * hour / 24
    )

    hour_cos = np.cos(
        2 * np.pi * hour / 24
    )

    month_sin = np.sin(
        2 * np.pi * month / 12
    )

    month_cos = np.cos(
        2 * np.pi * month / 12
    )

    # --------------------------------------------------------
    # Create input
    # --------------------------------------------------------

    input_data = [[
        water_level,
        water_level_change_1,
        water_level_change_3,
        temperature,
        pressure,
        hour,
        month,
        day_of_year,
        hour_sin,
        hour_cos,
        month_sin,
        month_cos
    ]]

    # --------------------------------------------------------
    # Prediction
    # --------------------------------------------------------

    prediction = model.predict(
        input_data
    )[0]

    probabilities = model.predict_proba(
        input_data
    )[0]

    class_names = {
        0: "SAFE",
        1: "WARNING",
        2: "DANGER"
    }

    result = {
        "risk_class": class_names[int(prediction)],

        "probabilities": {
            "SAFE": float(probabilities[0]),
            "WARNING": float(probabilities[1]),
            "DANGER": float(probabilities[2])
        }
    }

    return result


# ============================================================
# TEST MODE
# ============================================================

if __name__ == "__main__":

    print("=" * 60)
    print("RESQMESH AI REAL-TIME RISK PREDICTION")
    print("=" * 60)

    # Example current conditions
    #
    # Replace these values later with real sensor/API values.

    result = predict_risk(
        water_level=86.50,
        water_level_change_1=0.10,
        water_level_change_3=0.20,
        temperature=30.0,
        pressure=1005.0,
        hour=14,
        month=6,
        day_of_year=165
    )

    print("\nPrediction:")
    print(
        json.dumps(
            result,
            indent=4
        )
    )

    print("\n" + "=" * 60)