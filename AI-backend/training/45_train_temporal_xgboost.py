 
import pandas as pd
import numpy as np
import xgboost as xgb
import os
import json
import time

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    average_precision_score,
    confusion_matrix,
    classification_report
)


# ============================================================
# STEP 45
# TEMPORAL WEATHER + XGBOOST
# EVENT-AWARE TRAINING / TESTING
# ============================================================

INPUT_FILE = "data/processed/temporal_weather_training_data.csv"

MODEL_DIR = "models"

MODEL_FILE = "models/resqmesh_temporal_xgboost.json"

FEATURE_FILE = "models/resqmesh_temporal_features.json"

RESULT_FILE = "data/processed/temporal_xgboost_results.csv"


os.makedirs(MODEL_DIR, exist_ok=True)


print("=" * 80)
print("STEP 45 - TEMPORAL WEATHER XGBOOST")
print("=" * 80)


start_time = time.time()


# ============================================================
# 1. LOAD DATA
# ============================================================

print("\n[1/10] Loading temporal dataset...")


if not os.path.exists(INPUT_FILE):
    print("ERROR: Input file not found:")
    print(INPUT_FILE)
    raise SystemExit


df = pd.read_csv(INPUT_FILE)


print(f"Rows    : {len(df):,}")
print(f"Columns : {len(df.columns)}")


# ============================================================
# 2. CREATE ENGINEERED WEATHER FEATURES
# ============================================================

print("\n[2/10] Creating engineered weather features...")


# ------------------------------------------------------------
# Rain binary
# ------------------------------------------------------------

df["rain_binary"] = (
    df["rain"] > 0
).astype(int)


# ------------------------------------------------------------
# Temperature-humidity interaction
# ------------------------------------------------------------

df["temperature_humidity_index"] = (
    df["temperature_2m"]
    * (df["relative_humidity_2m"] / 100.0)
)


# ------------------------------------------------------------
# Wind vector components
#
# Wind direction is measured clockwise from North.
# ------------------------------------------------------------

direction_rad = np.deg2rad(
    df["wind_direction_10m"]
)


df["wind_u"] = (
    -df["wind_speed_10m"]
    * np.sin(direction_rad)
)


df["wind_v"] = (
    -df["wind_speed_10m"]
    * np.cos(direction_rad)
)


print("Created:")
print("  rain_binary")
print("  temperature_humidity_index")
print("  wind_u")
print("  wind_v")


# ============================================================
# 3. DEFINE MODEL FEATURES
# ============================================================

print("\n[3/10] Preparing model features...")


# ------------------------------------------------------------
# Current weather features
# ------------------------------------------------------------

base_weather_features = [

    "temperature_2m",

    "relative_humidity_2m",

    "dew_point_2m",

    "precipitation",

    "rain",

    "surface_pressure",

    "cloud_cover",

    "cloud_cover_low",

    "wind_speed_10m",

    "wind_direction_10m"

]


# ------------------------------------------------------------
# Existing engineered features
# ------------------------------------------------------------

existing_features = [

    "rain_binary",

    "temperature_humidity_index",

    "wind_u",

    "wind_v"

]


# ------------------------------------------------------------
# Temporal features created in Step 44
# ------------------------------------------------------------

temporal_features = [

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

    "humidity_pressure_risk"

]


# ------------------------------------------------------------
# Calendar features
# ------------------------------------------------------------

calendar_features = [

    "hour",

    "month",

    "day_of_year",

    "hour_sin",

    "hour_cos",

    "month_sin",

    "month_cos"

]


# ------------------------------------------------------------
# Combine all features
# ------------------------------------------------------------

feature_columns = (

    base_weather_features

    + existing_features

    + temporal_features

    + calendar_features

)


# Remove accidental duplicates

feature_columns = list(
    dict.fromkeys(feature_columns)
)


print(
    f"Total model features: {len(feature_columns)}"
)


# ============================================================
# CHECK FEATURES
# ============================================================

missing_features = [

    col

    for col in feature_columns

    if col not in df.columns

]


if missing_features:

    print("\nERROR: Missing features:")

    for col in missing_features:

        print(" -", col)

    raise SystemExit


print("All model features are available.")


# ============================================================
# 4. CHECK TARGET
# ============================================================

print("\n[4/10] Checking target...")


target = "flood_event"


if target not in df.columns:

    print(
        f"ERROR: Target column '{target}' "
        "not found."
    )

    raise SystemExit


print(
    f"Target column: {target}"
)


# ============================================================
# 5. EVENT-AWARE SPLIT
# ============================================================

print("\n[5/10] Creating event-aware train/test split...")


# ------------------------------------------------------------
# Event 1 = training flood event
# Event 2 = completely unseen test flood event
# Event 0 = normal observations
# ------------------------------------------------------------

train_flood = df[
    df["event_id"] == 1
].copy()


test_flood = df[
    df["event_id"] == 2
].copy()


normal_data = df[
    df["event_id"] == 0
].copy()


print("\nAvailable data:")


print(
    f"Training flood event : "
    f"{len(train_flood):,}"
)


print(
    f"Testing flood event  : "
    f"{len(test_flood):,}"
)


print(
    f"Normal observations  : "
    f"{len(normal_data):,}"
)


# ============================================================
# 6. SAMPLE NORMAL OBSERVATIONS
# ============================================================

print("\n[6/10] Sampling normal observations...")


# ------------------------------------------------------------
# Maintain approximately 1:3 flood/normal ratio
# ------------------------------------------------------------

TRAIN_NORMAL_COUNT = (
    len(train_flood) * 3
)


TEST_NORMAL_COUNT = (
    len(test_flood) * 3
)


print(
    f"Training normal samples: "
    f"{TRAIN_NORMAL_COUNT:,}"
)


print(
    f"Testing normal samples : "
    f"{TEST_NORMAL_COUNT:,}"
)


# ------------------------------------------------------------
# Training normal samples
# ------------------------------------------------------------

train_normal = normal_data.sample(
    n=TRAIN_NORMAL_COUNT,
    random_state=42
)


# ------------------------------------------------------------
# Remove training normal rows before
# selecting test normal rows.
# ------------------------------------------------------------

remaining_normal = normal_data.drop(
    train_normal.index
)


# ------------------------------------------------------------
# Test normal samples
# ------------------------------------------------------------

test_normal = remaining_normal.sample(
    n=TEST_NORMAL_COUNT,
    random_state=43
)


# ============================================================
# 7. BUILD TRAIN / TEST DATASETS
# ============================================================

print("\n[7/10] Building train/test datasets...")


train_df = pd.concat(
    [
        train_flood,
        train_normal
    ],
    ignore_index=True
)


test_df = pd.concat(
    [
        test_flood,
        test_normal
    ],
    ignore_index=True
)


# Shuffle training data

train_df = train_df.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)


# Shuffle testing data

test_df = test_df.sample(
    frac=1,
    random_state=42
).reset_index(drop=True)


print("\nTRAIN DISTRIBUTION:")

print(
    train_df[target]
    .value_counts()
    .sort_index()
)


print("\nTEST DISTRIBUTION:")

print(
    test_df[target]
    .value_counts()
    .sort_index()
)


# ============================================================
# 8. PREPARE X AND y
# ============================================================

print("\n[8/10] Preparing X and y...")


X_train = train_df[
    feature_columns
].copy()


y_train = train_df[
    target
].astype(int)


X_test = test_df[
    feature_columns
].copy()


y_test = test_df[
    target
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

train_medians = X_train.median()


X_train = X_train.fillna(
    train_medians
)


X_test = X_test.fillna(
    train_medians
)


print(
    f"Training shape: "
    f"{X_train.shape}"
)


print(
    f"Testing shape : "
    f"{X_test.shape}"
)


print(
    f"Training flood rows: "
    f"{y_train.sum():,}"
)


print(
    f"Training normal rows: "
    f"{(y_train == 0).sum():,}"
)


print(
    f"Testing flood rows: "
    f"{y_test.sum():,}"
)


print(
    f"Testing normal rows: "
    f"{(y_test == 0).sum():,}"
)


# ============================================================
# 9. TRAIN XGBOOST
# ============================================================

print("\n[9/10] Training XGBoost...")


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


print("XGBoost training completed.")


# ============================================================
# 10. EVALUATION
# ============================================================

print("\n[10/10] Evaluating model...")


# ------------------------------------------------------------
# Predicted probabilities
# ------------------------------------------------------------

probabilities = model.predict_proba(
    X_test
)[:, 1]


# ------------------------------------------------------------
# Default threshold
# ------------------------------------------------------------

threshold = 0.5


predictions = (
    probabilities >= threshold
).astype(int)


# ------------------------------------------------------------
# Metrics
# ------------------------------------------------------------

accuracy = accuracy_score(
    y_test,
    predictions
)


balanced_accuracy = balanced_accuracy_score(
    y_test,
    predictions
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


roc_auc = roc_auc_score(
    y_test,
    probabilities
)


pr_auc = average_precision_score(
    y_test,
    probabilities
)


cm = confusion_matrix(
    y_test,
    predictions
)


# ============================================================
# PRINT RESULTS
# ============================================================

print("\n")
print("=" * 80)
print("TEMPORAL XGBOOST RESULTS")
print("=" * 80)


print(
    f"Accuracy           : "
    f"{accuracy:.4f} "
    f"({accuracy * 100:.2f}%)"
)


print(
    f"Balanced Accuracy  : "
    f"{balanced_accuracy:.4f}"
)


print(
    f"Precision          : "
    f"{precision:.4f}"
)


print(
    f"Recall             : "
    f"{recall:.4f}"
)


print(
    f"F1 Score           : "
    f"{f1:.4f}"
)


print(
    f"ROC-AUC            : "
    f"{roc_auc:.4f}"
)


print(
    f"PR-AUC             : "
    f"{pr_auc:.4f}"
)


# ============================================================
# CONFUSION MATRIX
# ============================================================

print("\nConfusion Matrix:")

print(cm)


# ============================================================
# CLASSIFICATION REPORT
# ============================================================

print("\nClassification Report:")


print(
    classification_report(
        y_test,
        predictions,
        target_names=[
            "Normal",
            "Flood"
        ],
        zero_division=0
    )
)


# ============================================================
# PROBABILITY ANALYSIS
# ============================================================

print("\nProbability distribution:")


normal_probabilities = probabilities[
    y_test.values == 0
]


flood_probabilities = probabilities[
    y_test.values == 1
]


print(
    f"Normal mean probability   : "
    f"{normal_probabilities.mean():.6f}"
)


print(
    f"Flood mean probability    : "
    f"{flood_probabilities.mean():.6f}"
)


print(
    f"Normal median probability : "
    f"{np.median(normal_probabilities):.6f}"
)


print(
    f"Flood median probability  : "
    f"{np.median(flood_probabilities):.6f}"
)


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

print("\nTop 30 feature importances:")


importance_df = pd.DataFrame(
    {
        "feature": feature_columns,
        "importance": model.feature_importances_
    }
)


importance_df = importance_df.sort_values(
    "importance",
    ascending=False
)


print(
    importance_df.head(30).to_string(
        index=False
    )
)


# ============================================================
# SAVE MODEL
# ============================================================

print("\nSaving model...")


model.save_model(
    MODEL_FILE
)


# ============================================================
# SAVE FEATURE LIST
# ============================================================

with open(
    FEATURE_FILE,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        feature_columns,
        f,
        indent=2
    )


# ============================================================
# SAVE RESULTS
# ============================================================

results = pd.DataFrame(
    [
        {
            "model": "Temporal XGBoost",

            "features": len(
                feature_columns
            ),

            "train_rows": len(
                train_df
            ),

            "test_rows": len(
                test_df
            ),

            "accuracy": accuracy,

            "balanced_accuracy":
                balanced_accuracy,

            "precision": precision,

            "recall": recall,

            "f1": f1,

            "roc_auc": roc_auc,

            "pr_auc": pr_auc,

            "threshold": threshold
        }
    ]
)


results.to_csv(
    RESULT_FILE,
    index=False
)


# ============================================================
# FINAL OUTPUT
# ============================================================

print("\n")
print("=" * 80)
print("STEP 45 COMPLETED SUCCESSFULLY")
print("=" * 80)


print("\nModel saved:")
print(
    MODEL_FILE
)


print("\nFeature list saved:")
print(
    FEATURE_FILE
)


print("\nResults saved:")
print(
    RESULT_FILE
)


print(
    f"\nExecution time: "
    f"{time.time() - start_time:.2f} seconds"
)


print("=" * 80)