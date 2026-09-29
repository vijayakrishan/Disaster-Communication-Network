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
    confusion_matrix
)


# ============================================================
# STEP 47
# FINAL UNSEEN EVENT TEST
#
# Training:
#   Event 1 = 2021 flood event
#
# Testing:
#   Event 2 = 2023 flood event
#
# Threshold:
#   Selected ONLY from Step 46 validation
# ============================================================


INPUT_FILE = (
    "data/processed/"
    "temporal_weather_training_data.csv"
)

THRESHOLD_FILE = (
    "models/"
    "resqmesh_temporal_threshold.json"
)

MODEL_OUTPUT = (
    "models/"
    "resqmesh_temporal_final_model.json"
)

FEATURE_OUTPUT = (
    "models/"
    "resqmesh_temporal_final_features.json"
)

RESULT_OUTPUT = (
    "data/processed/"
    "resqmesh_final_unseen_test_results.csv"
)


os.makedirs(
    "models",
    exist_ok=True
)


start_time = time.time()


print("=" * 80)
print("STEP 47 - FINAL UNSEEN 2023 EVENT TEST")
print("=" * 80)


# ============================================================
# 1. LOAD DATA
# ============================================================

print("\n[1/10] Loading temporal dataset...")


if not os.path.exists(INPUT_FILE):

    print("ERROR: Dataset not found:")
    print(INPUT_FILE)

    raise SystemExit


df = pd.read_csv(
    INPUT_FILE
)


print(
    f"Rows    : {len(df):,}"
)

print(
    f"Columns : {len(df.columns)}"
)


# ============================================================
# 2. ENGINEER FEATURES
# ============================================================

print("\n[2/10] Creating engineered features...")


df["rain_binary"] = (
    df["rain"] > 0
).astype(int)


df["temperature_humidity_index"] = (
    df["temperature_2m"]
    *
    (
        df["relative_humidity_2m"]
        / 100.0
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
# 3. FEATURE LIST
# ============================================================

print("\n[3/10] Preparing model features...")


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


engineered_features = [

    "rain_binary",
    "temperature_humidity_index",
    "wind_u",
    "wind_v"

]


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


calendar_features = [

    "hour",
    "month",
    "day_of_year",
    "hour_sin",
    "hour_cos",
    "month_sin",
    "month_cos"

]


feature_columns = (

    base_weather_features
    +
    engineered_features
    +
    temporal_features
    +
    calendar_features

)


feature_columns = list(
    dict.fromkeys(
        feature_columns
    )
)


missing_features = [

    feature
    for feature in feature_columns
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


print(
    f"Total model features: "
    f"{len(feature_columns)}"
)


# ============================================================
# 4. LOAD THRESHOLD FROM STEP 46
# ============================================================

print("\n[4/10] Loading validated threshold...")


if not os.path.exists(
    THRESHOLD_FILE
):

    print(
        "ERROR: Threshold file not found:"
    )

    print(
        THRESHOLD_FILE
    )

    raise SystemExit


with open(
    THRESHOLD_FILE,
    "r",
    encoding="utf-8"
) as f:

    threshold_data = json.load(f)


selected_threshold = float(
    threshold_data[
        "selected_threshold"
    ]
)


print(
    f"Selected threshold: "
    f"{selected_threshold:.5f}"
)


print(
    "Threshold source: "
    "Step 46 internal validation"
)


# ============================================================
# 5. CREATE TRAIN / TEST EVENTS
# ============================================================

print("\n[5/10] Creating event-aware datasets...")


event_1 = df[
    df["event_id"] == 1
].copy()


event_2 = df[
    df["event_id"] == 2
].copy()


normal = df[
    df["event_id"] == 0
].copy()


print(
    f"2021 flood event rows : "
    f"{len(event_1):,}"
)


print(
    f"2023 flood event rows : "
    f"{len(event_2):,}"
)


print(
    f"Normal rows            : "
    f"{len(normal):,}"
)


# ============================================================
# 6. BUILD TRAINING DATA
# ============================================================

print("\n[6/10] Building final training dataset...")


# Use all 2021 flood rows

train_flood = event_1.copy()


# Same 3:1 normal:flood ratio used previously

train_normal_count = (
    len(train_flood) * 3
)


train_normal = normal.sample(
    n=train_normal_count,
    random_state=42
)


train_df = pd.concat(
    [
        train_flood,
        train_normal
    ],
    ignore_index=True
)


# Shuffle

train_df = train_df.sample(
    frac=1,
    random_state=42
).reset_index(
    drop=True
)


# ------------------------------------------------------------
# 2023 test set
#
# Same 3:1 normal:flood ratio.
# ------------------------------------------------------------

test_flood = event_2.copy()


test_normal_count = (
    len(test_flood) * 3
)


test_normal = normal.sample(
    n=test_normal_count,
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


print("\nTraining distribution:")

print(
    train_df[
        "flood_event"
    ]
    .value_counts()
    .sort_index()
)


print("\nFinal test distribution:")

print(
    test_df[
        "flood_event"
    ]
    .value_counts()
    .sort_index()
)


# ============================================================
# 7. PREPARE MATRICES
# ============================================================

print("\n[7/10] Preparing X and y...")


X_train = train_df[
    feature_columns
].copy()


y_train = train_df[
    "flood_event"
].astype(int)


X_test = test_df[
    feature_columns
].copy()


y_test = test_df[
    "flood_event"
].astype(int)


# ------------------------------------------------------------
# Replace infinite values
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
# Training medians
# ------------------------------------------------------------

train_medians = X_train.median()


X_train = X_train.fillna(
    train_medians
)


X_test = X_test.fillna(
    train_medians
)


print(
    f"Training matrix : "
    f"{X_train.shape}"
)


print(
    f"Test matrix     : "
    f"{X_test.shape}"
)


# ============================================================
# 8. TRAIN FINAL MODEL
# ============================================================

print("\n[8/10] Training final temporal XGBoost...")


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
    "Final model training completed."
)


# ============================================================
# 9. FINAL 2023 TEST
# ============================================================

print(
    "\n[9/10] Evaluating on completely unseen "
    "2023 flood event..."
)


test_probabilities = (
    model.predict_proba(
        X_test
    )[:, 1]
)


# ------------------------------------------------------------
# Probability metrics
# ------------------------------------------------------------

roc_auc = roc_auc_score(
    y_test,
    test_probabilities
)


pr_auc = average_precision_score(
    y_test,
    test_probabilities
)


# ------------------------------------------------------------
# Apply threshold selected from validation
# ------------------------------------------------------------

test_predictions = (
    test_probabilities
    >= selected_threshold
).astype(int)


accuracy = accuracy_score(
    y_test,
    test_predictions
)


balanced_accuracy = (
    balanced_accuracy_score(
        y_test,
        test_predictions
    )
)


precision = precision_score(
    y_test,
    test_predictions,
    zero_division=0
)


recall = recall_score(
    y_test,
    test_predictions,
    zero_division=0
)


f1 = f1_score(
    y_test,
    test_predictions,
    zero_division=0
)


cm = confusion_matrix(
    y_test,
    test_predictions
)


# ============================================================
# 10. PRINT FINAL RESULTS
# ============================================================

print("\n")
print("=" * 80)
print("FINAL UNSEEN 2023 TEST RESULTS")
print("=" * 80)


print(
    f"Threshold           : "
    f"{selected_threshold:.5f}"
)


print(
    f"Accuracy            : "
    f"{accuracy:.4f} "
    f"({accuracy * 100:.2f}%)"
)


print(
    f"Balanced Accuracy   : "
    f"{balanced_accuracy:.4f} "
    f"({balanced_accuracy * 100:.2f}%)"
)


print(
    f"Precision           : "
    f"{precision:.4f} "
    f"({precision * 100:.2f}%)"
)


print(
    f"Recall              : "
    f"{recall:.4f} "
    f"({recall * 100:.2f}%)"
)


print(
    f"F1 Score            : "
    f"{f1:.4f} "
    f"({f1 * 100:.2f}%)"
)


print(
    f"ROC-AUC             : "
    f"{roc_auc:.4f}"
)


print(
    f"PR-AUC              : "
    f"{pr_auc:.4f}"
)


print("\nConfusion Matrix:")

print(
    "                 Predicted"
)

print(
    "                 Normal   Flood"
)

print(
    f"Actual Normal    "
    f"{cm[0,0]:6d}   "
    f"{cm[0,1]:6d}"
)

print(
    f"Actual Flood     "
    f"{cm[1,0]:6d}   "
    f"{cm[1,1]:6d}"
)


# ============================================================
# PROBABILITY DISTRIBUTION
# ============================================================

normal_probabilities = (
    test_probabilities[
        y_test.values == 0
    ]
)


flood_probabilities = (
    test_probabilities[
        y_test.values == 1
    ]
)


print("\nProbability distribution:")


print(
    f"Normal mean      : "
    f"{normal_probabilities.mean():.6f}"
)


print(
    f"Normal median    : "
    f"{np.median(normal_probabilities):.6f}"
)


print(
    f"Flood mean       : "
    f"{flood_probabilities.mean():.6f}"
)


print(
    f"Flood median     : "
    f"{np.median(flood_probabilities):.6f}"
)


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

print("\nTop 20 feature importances:")


importance = pd.DataFrame({

    "feature":
        feature_columns,

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

print("\nSaving final model...")


model.save_model(
    MODEL_OUTPUT
)


# ============================================================
# SAVE FEATURES
# ============================================================

with open(
    FEATURE_OUTPUT,
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

results = {

    "test_event":
        "2023",

    "training_event":
        "2021",

    "threshold":
        selected_threshold,

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


print("\n")
print("=" * 80)
print("STEP 47 COMPLETED")
print("=" * 80)


print(
    "\nFinal model:"
)

print(
    MODEL_OUTPUT
)


print(
    "\nFeature list:"
)

print(
    FEATURE_OUTPUT
)


print(
    "\nResults:"
)

print(
    RESULT_OUTPUT
)


print(
    f"\nExecution time: "
    f"{time.time() - start_time:.2f} seconds"
)


print("=" * 80)