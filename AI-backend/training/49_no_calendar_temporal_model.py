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

import os


print("=" * 80)
print("STEP 49 - TEMPORAL WEATHER MODEL WITHOUT CALENDAR FEATURES")
print("=" * 80)


INPUT_FILE = (
    "data/processed/"
    "temporal_weather_training_data.csv"
)

MODEL_OUTPUT = (
    "models/"
    "resqmesh_no_calendar_temporal_xgboost.json"
)


# ============================================================
# 1. LOAD DATA
# ============================================================

print("\n[1/8] Loading dataset...")

df = pd.read_csv(INPUT_FILE)

print(
    f"Rows    : {len(df):,}"
)

print(
    f"Columns : {len(df.columns)}"
)


# ============================================================
# 2. CREATE ENGINEERED WEATHER FEATURES
# ============================================================

print("\n[2/8] Creating engineered features...")


# Rain binary

df["rain_binary"] = (
    df["rain"] > 0
).astype(int)


# Temperature-Humidity Index

df["temperature_humidity_index"] = (
    df["temperature_2m"]
    *
    (
        df["relative_humidity_2m"] / 100.0
    )
)


# Wind vector components

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
# 3. PHYSICAL + TEMPORAL WEATHER FEATURES
# ============================================================

print("\n[3/8] Preparing physical weather features...")


features = [

    # --------------------------------------------------------
    # Basic weather
    # --------------------------------------------------------

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

    # --------------------------------------------------------
    # Engineered weather
    # --------------------------------------------------------

    "rain_binary",
    "temperature_humidity_index",
    "wind_u",
    "wind_v",

    # --------------------------------------------------------
    # Rain accumulation
    # --------------------------------------------------------

    "rain_3h",
    "rain_6h",
    "rain_12h",
    "rain_24h",
    "rain_48h",

    # --------------------------------------------------------
    # Precipitation accumulation
    # --------------------------------------------------------

    "precip_3h",
    "precip_6h",
    "precip_12h",
    "precip_24h",
    "precip_48h",

    # --------------------------------------------------------
    # Rain intensity / maxima
    # --------------------------------------------------------

    "rain_3h_max",
    "rain_6h_max",
    "rain_12h_max",
    "rain_24h_max",

    # --------------------------------------------------------
    # Humidity temporal features
    # --------------------------------------------------------

    "humidity_6h_mean",
    "humidity_12h_mean",
    "humidity_24h_mean",
    "humidity_24h_max",

    # --------------------------------------------------------
    # Temperature temporal features
    # --------------------------------------------------------

    "temperature_6h_mean",
    "temperature_24h_mean",
    "temperature_24h_min",
    "temperature_24h_max",

    # --------------------------------------------------------
    # Cloud temporal features
    # --------------------------------------------------------

    "cloud_6h_mean",
    "cloud_12h_mean",
    "cloud_24h_mean",

    # --------------------------------------------------------
    # Pressure changes
    # --------------------------------------------------------

    "pressure_change_3h",
    "pressure_change_6h",
    "pressure_change_12h",
    "pressure_change_24h",

    # --------------------------------------------------------
    # Rain changes
    # --------------------------------------------------------

    "rain_change_1h",
    "rain_change_3h",
    "rain_change_6h",

    # --------------------------------------------------------
    # Risk indicators
    # --------------------------------------------------------

    "is_heavy_rain_3h",
    "is_heavy_rain_6h",
    "is_heavy_rain_24h",
    "is_extreme_rain_24h",

    "rain_acceleration",

    "humidity_pressure_risk"

]


print(
    f"Total physical features: {len(features)}"
)


# ============================================================
# CHECK FEATURES
# ============================================================

missing_features = [

    feature
    for feature in features
    if feature not in df.columns

]


if missing_features:

    print("\nERROR: Missing features:")

    for feature in missing_features:

        print(
            " -",
            feature
        )

    raise SystemExit


# ============================================================
# 4. PREPARE EVENT-AWARE DATA
# ============================================================

print(
    "\n[4/8] Preparing event-aware datasets..."
)


# 2021 flood event

event_1 = df[
    df["event_id"] == 1
].copy()


# 2023 flood event

event_2 = df[
    df["event_id"] == 2
].copy()


# Normal observations

normal = df[
    df["event_id"] == 0
].copy()


print(
    f"2021 flood rows : "
    f"{len(event_1):,}"
)


print(
    f"2023 flood rows : "
    f"{len(event_2):,}"
)


print(
    f"Normal rows     : "
    f"{len(normal):,}"
)


# ============================================================
# 5. BUILD TRAINING AND FINAL TEST DATA
# ============================================================

print(
    "\n[5/8] Building train/test datasets..."
)


# ------------------------------------------------------------
# TRAINING
# ------------------------------------------------------------

train_flood = event_1.copy()


train_normal = normal.sample(
    n=len(train_flood) * 3,
    random_state=42
)


train_df = pd.concat(
    [
        train_flood,
        train_normal
    ],
    ignore_index=True
)


train_df = train_df.sample(
    frac=1,
    random_state=42
).reset_index(
    drop=True
)


# ------------------------------------------------------------
# FINAL UNSEEN TEST
# ------------------------------------------------------------

test_flood = event_2.copy()


test_normal = normal.sample(
    n=len(test_flood) * 3,
    random_state=123
)


test_df = pd.concat(
    [
        test_flood,
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


print(
    "\nTraining distribution:"
)


print(
    train_df[
        "flood_event"
    ]
    .value_counts()
    .sort_index()
)


print(
    "\nTest distribution:"
)


print(
    test_df[
        "flood_event"
    ]
    .value_counts()
    .sort_index()
)


# ============================================================
# 6. PREPARE MATRICES
# ============================================================

print(
    "\n[6/8] Preparing matrices..."
)


X_train = train_df[
    features
].copy()


y_train = train_df[
    "flood_event"
].astype(int)


X_test = test_df[
    features
].copy()


y_test = test_df[
    "flood_event"
].astype(int)


# ------------------------------------------------------------
# Replace infinity
# ------------------------------------------------------------

X_train = X_train.replace(
    [np.inf, -np.inf],
    np.nan
)


X_test = X_test.replace(
    [np.inf, -np.inf],
    np.nan
)


# ------------------------------------------------------------
# Fill missing values using TRAINING medians
# ------------------------------------------------------------

training_medians = X_train.median()


X_train = X_train.fillna(
    training_medians
)


X_test = X_test.fillna(
    training_medians
)


print(
    f"Training shape: "
    f"{X_train.shape}"
)


print(
    f"Test shape    : "
    f"{X_test.shape}"
)


# ============================================================
# 7. TRAIN XGBOOST
# ============================================================

print(
    "\n[7/8] Training XGBoost..."
)


model = xgb.XGBClassifier(

    n_estimators=700,

    max_depth=5,

    learning_rate=0.03,

    subsample=0.85,

    colsample_bytree=0.85,

    min_child_weight=3,

    gamma=0.1,

    reg_alpha=0.1,

    reg_lambda=1.0,

    objective="binary:logistic",

    eval_metric="logloss",

    tree_method="hist",

    random_state=42,

    n_jobs=-1,

    scale_pos_weight=3

)


model.fit(
    X_train,
    y_train
)


print(
    "Training completed."
)


# ============================================================
# 8. EVALUATE ON UNSEEN 2023 EVENT
# ============================================================

print(
    "\n[8/8] Evaluating unseen 2023 event..."
)


# ------------------------------------------------------------
# Get probability scores
# ------------------------------------------------------------

probabilities = model.predict_proba(
    X_test
)[:, 1]


# ------------------------------------------------------------
# Diagnostic threshold
#
# IMPORTANT:
# This is NOT a production threshold.
# Step 48 showed that the model probabilities
# are much lower than 0.5.
# ------------------------------------------------------------

threshold = 0.002


predictions = (
    probabilities >= threshold
).astype(int)


# ------------------------------------------------------------
# Classification metrics
# ------------------------------------------------------------

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


# ------------------------------------------------------------
# Probability ranking metrics
# ------------------------------------------------------------

roc_auc = roc_auc_score(
    y_test,
    probabilities
)


pr_auc = average_precision_score(
    y_test,
    probabilities
)


# ------------------------------------------------------------
# Confusion matrix
# ------------------------------------------------------------

cm = confusion_matrix(
    y_test,
    predictions
)


# ============================================================
# RESULTS
# ============================================================

print("\n")
print("=" * 80)
print("NO-CALENDAR TEMPORAL MODEL RESULTS")
print("=" * 80)


print(
    f"Diagnostic threshold : "
    f"{threshold:.4f}"
)


print(
    f"Accuracy             : "
    f"{accuracy:.4f} "
    f"({accuracy * 100:.2f}%)"
)


print(
    f"Balanced Accuracy    : "
    f"{balanced_accuracy:.4f} "
    f"({balanced_accuracy * 100:.2f}%)"
)


print(
    f"Precision            : "
    f"{precision:.4f} "
    f"({precision * 100:.2f}%)"
)


print(
    f"Recall               : "
    f"{recall:.4f} "
    f"({recall * 100:.2f}%)"
)


print(
    f"F1                   : "
    f"{f1:.4f} "
    f"({f1 * 100:.2f}%)"
)


print(
    f"ROC-AUC              : "
    f"{roc_auc:.4f}"
)


print(
    f"PR-AUC               : "
    f"{pr_auc:.4f}"
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print(
    "\nConfusion Matrix:"
)


print(
    "                 Predicted"
)


print(
    "                 Normal   Flood"
)


print(
    f"Actual Normal    "
    f"{cm[0, 0]:6d}   "
    f"{cm[0, 1]:6d}"
)


print(
    f"Actual Flood     "
    f"{cm[1, 0]:6d}   "
    f"{cm[1, 1]:6d}"
)


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

print(
    "\nTop 20 feature importances:"
)


importance = pd.DataFrame({

    "feature":
        features,

    "importance":
        model.feature_importances_

})


importance = importance.sort_values(
    "importance",
    ascending=False
)


print(
    importance.head(20).to_string(
        index=False
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

os.makedirs(
    "models",
    exist_ok=True
)


model.save_model(
    MODEL_OUTPUT
)


print(
    "\nModel saved:"
)


print(
    MODEL_OUTPUT
)


# ============================================================
# SAVE RESULTS
# ============================================================

RESULT_OUTPUT = (
    "data/processed/"
    "resqmesh_no_calendar_results.csv"
)


results = {

    "model":
        "No-calendar temporal XGBoost",

    "training_event":
        "2021",

    "test_event":
        "2023",

    "features":
        len(features),

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

    "roc_auc":
        roc_auc,

    "pr_auc":
        pr_auc,

    "true_negative":
        int(cm[0, 0]),

    "false_positive":
        int(cm[0, 1]),

    "false_negative":
        int(cm[1, 0]),

    "true_positive":
        int(cm[1, 1])

}


pd.DataFrame(
    [results]
).to_csv(
    RESULT_OUTPUT,
    index=False
)


print(
    "\nResults saved:"
)


print(
    RESULT_OUTPUT
)


print("\n")
print("=" * 80)
print("STEP 49 COMPLETED")
print("=" * 80)