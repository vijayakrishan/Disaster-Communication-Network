import pandas as pd
import numpy as np
import xgboost as xgb

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix
)


print("=" * 80)
print("STEP 48 - UNSEEN 2023 THRESHOLD DIAGNOSTIC")
print("=" * 80)


INPUT_FILE = (
    "data/processed/"
    "temporal_weather_training_data.csv"
)

MODEL_FILE = (
    "models/"
    "resqmesh_temporal_final_model.json"
)


# ============================================================
# 1. LOAD DATA
# ============================================================

print("\n[1/7] Loading dataset...")

df = pd.read_csv(INPUT_FILE)

print(
    f"Rows    : {len(df):,}"
)

print(
    f"Columns : {len(df.columns)}"
)


# ============================================================
# 2. ENGINEER FEATURES
# ============================================================

print("\n[2/7] Creating engineered features...")


df["rain_binary"] = (
    df["rain"] > 0
).astype(int)


df["temperature_humidity_index"] = (
    df["temperature_2m"]
    *
    (
        df["relative_humidity_2m"] / 100.0
    )
)


direction_rad = np.deg2rad(
    df["wind_direction_10m"]
)


df["wind_u"] = (
    -df["wind_speed_10m"]
    *
    np.sin(direction_rad)
)


df["wind_v"] = (
    -df["wind_speed_10m"]
    *
    np.cos(direction_rad)
)


# ============================================================
# 3. FEATURES
# ============================================================

print("\n[3/7] Preparing features...")


features = [

    "temperature_2m",
    "relative_humidity_2m",
    "dew_point_2m",
    "precipitation",
    "rain",
    "surface_pressure",
    "cloud_cover",
    "cloud_cover_low",
    "wind_speed_10m",
    "wind_direction_10m",

    "rain_binary",
    "temperature_humidity_index",
    "wind_u",
    "wind_v",

    "rain_3h",
    "rain_6h",
    "rain_12h",
    "rain_24h",
    "rain_48h",

    "precip_3h",
    "precip_6h",
    "precip_12h",
    "precip_24h",
    "precip_48h",

    "rain_3h_max",
    "rain_6h_max",
    "rain_12h_max",
    "rain_24h_max",

    "humidity_6h_mean",
    "humidity_12h_mean",
    "humidity_24h_mean",
    "humidity_24h_max",

    "temperature_6h_mean",
    "temperature_24h_mean",
    "temperature_24h_min",
    "temperature_24h_max",

    "cloud_6h_mean",
    "cloud_12h_mean",
    "cloud_24h_mean",

    "pressure_change_3h",
    "pressure_change_6h",
    "pressure_change_12h",
    "pressure_change_24h",

    "rain_change_1h",
    "rain_change_3h",
    "rain_change_6h",

    "is_heavy_rain_3h",
    "is_heavy_rain_6h",
    "is_heavy_rain_24h",
    "is_extreme_rain_24h",

    "rain_acceleration",
    "humidity_pressure_risk",

    "hour",
    "month",
    "day_of_year",
    "hour_sin",
    "hour_cos",
    "month_sin",
    "month_cos"

]


# ============================================================
# 4. BUILD 2023 TEST SET
# ============================================================

print("\n[4/7] Preparing unseen 2023 test set...")


event_2 = df[
    df["event_id"] == 2
].copy()


normal = df[
    df["event_id"] == 0
].copy()


test_normal = normal.sample(
    n=len(event_2) * 3,
    random_state=123
)


test_df = pd.concat(
    [
        event_2,
        test_normal
    ],
    ignore_index=True
)


test_df = test_df.sample(
    frac=1,
    random_state=123
).reset_index(
    drop=True
)


X_test = test_df[
    features
].copy()


y_test = test_df[
    "flood_event"
].astype(int)


X_test = X_test.replace(
    [np.inf, -np.inf],
    np.nan
)


X_test = X_test.fillna(
    X_test.median()
)


print(
    f"Test rows: {len(test_df):,}"
)


print(
    "\nTest distribution:"
)

print(
    y_test.value_counts()
    .sort_index()
)


# ============================================================
# 5. LOAD FINAL MODEL
# ============================================================

print("\n[5/7] Loading final XGBoost model...")


model = xgb.XGBClassifier()

model.load_model(
    MODEL_FILE
)


probabilities = model.predict_proba(
    X_test
)[:, 1]


roc_auc = roc_auc_score(
    y_test,
    probabilities
)


pr_auc = average_precision_score(
    y_test,
    probabilities
)


print(
    f"\nROC-AUC : {roc_auc:.4f}"
)

print(
    f"PR-AUC  : {pr_auc:.4f}"
)


# ============================================================
# 6. PROBABILITY DISTRIBUTION
# ============================================================

print("\n[6/7] Probability distribution...")


normal_probs = probabilities[
    y_test.values == 0
]


flood_probs = probabilities[
    y_test.values == 1
]


print("\nNORMAL")

print(
    f"Minimum : {normal_probs.min():.8f}"
)

print(
    f"25%     : {np.percentile(normal_probs,25):.8f}"
)

print(
    f"Median  : {np.median(normal_probs):.8f}"
)

print(
    f"75%     : {np.percentile(normal_probs,75):.8f}"
)

print(
    f"Maximum : {normal_probs.max():.8f}"
)


print("\nFLOOD")

print(
    f"Minimum : {flood_probs.min():.8f}"
)

print(
    f"25%     : {np.percentile(flood_probs,25):.8f}"
)

print(
    f"Median  : {np.median(flood_probs):.8f}"
)

print(
    f"75%     : {np.percentile(flood_probs,75):.8f}"
)

print(
    f"Maximum : {flood_probs.max():.8f}"
)


# ============================================================
# 7. THRESHOLD DIAGNOSTICS
# ============================================================

print(
    "\n[7/7] Testing diagnostic thresholds..."
)


thresholds = [

    0.00001,
    0.00002,
    0.00005,
    0.00010,
    0.00020,
    0.00030,
    0.00050,
    0.00075,
    0.00100,
    0.00200,
    0.00300,
    0.00500,
    0.01000,
    0.02000,
    0.05000,
    0.10000,
    0.20000,
    0.50000

]


results = []


for threshold in thresholds:

    predictions = (
        probabilities >= threshold
    ).astype(int)


    accuracy = accuracy_score(
        y_test,
        predictions
    )


    balanced_accuracy = (
        balanced_accuracy_score(
            y_test,
            predictions
        )
    )


    precision = precision_score(
        y_test,
        predictions,
        zero_division=0
    )


    recall = recall_score(
        y_test,
        predictions,
        zero_division=0
    )


    f1 = f1_score(
        y_test,
        predictions,
        zero_division=0
    )


    cm = confusion_matrix(
        y_test,
        predictions
    )


    results.append({

        "threshold":
            threshold,

        "accuracy":
            accuracy,

        "balanced_accuracy":
            balanced_accuracy,

        "precision":
            precision,

        "recall":
            recall,

        "f1":
            f1,

        "true_negative":
            cm[0, 0],

        "false_positive":
            cm[0, 1],

        "false_negative":
            cm[1, 0],

        "true_positive":
            cm[1, 1]

    })


results_df = pd.DataFrame(
    results
)


print("\n")
print("=" * 80)
print("2023 UNSEEN THRESHOLD DIAGNOSTIC")
print("=" * 80)


print(
    results_df.to_string(
        index=False,
        float_format=lambda x:
        f"{x:.4f}"
    )
)


print("\n")
print("=" * 80)
print("IMPORTANT")
print("=" * 80)

print(
    "These thresholds are diagnostic only."
)

print(
    "Do NOT use this table to claim final model accuracy."
)

print(
    "The 2023 event is the unseen evaluation event."
)

print(
    "Threshold selection for production must be "
    "validated independently."
)

print("=" * 80)


OUTPUT_FILE = (
    "data/processed/"
    "unseen_2023_threshold_diagnostic.csv"
)


results_df.to_csv(
    OUTPUT_FILE,
    index=False
)


print(
    f"\nSaved:"
)

print(
    OUTPUT_FILE
)