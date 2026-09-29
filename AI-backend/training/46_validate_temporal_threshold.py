import pandas as pd
import numpy as np
import xgboost as xgb
import os
import json
import time

from sklearn.model_selection import train_test_split

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
# STEP 46
# INTERNAL VALIDATION + THRESHOLD SELECTION
#
# IMPORTANT:
# 2021 event = development data
# 2023 event = completely unseen final test
# ============================================================


INPUT_FILE = (
    "data/processed/"
    "temporal_weather_training_data.csv"
)

MODEL_OUTPUT = (
    "models/"
    "resqmesh_temporal_validation_model.json"
)

FEATURE_OUTPUT = (
    "models/"
    "resqmesh_temporal_validation_features.json"
)

RESULT_OUTPUT = (
    "data/processed/"
    "temporal_threshold_validation_results.csv"
)


os.makedirs(
    "models",
    exist_ok=True
)


print("=" * 80)
print("STEP 46 - INTERNAL VALIDATION + THRESHOLD SELECTION")
print("=" * 80)


start_time = time.time()


# ============================================================
# 1. LOAD DATA
# ============================================================

print("\n[1/9] Loading temporal dataset...")


if not os.path.exists(INPUT_FILE):

    print("ERROR: Input file not found:")
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
# 2. CREATE ENGINEERED FEATURES
# ============================================================

print("\n[2/9] Creating engineered weather features...")


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
    *
    (
        df["relative_humidity_2m"]
        / 100.0
    )
)


# ------------------------------------------------------------
# Wind vector components
# ------------------------------------------------------------

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

print("\n[3/9] Preparing model features...")


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


existing_features = [

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
    existing_features
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

    col
    for col in feature_columns
    if col not in df.columns

]


if missing_features:

    print("\nERROR: Missing features:")

    for col in missing_features:

        print(" -", col)

    raise SystemExit


print(
    f"Total model features: "
    f"{len(feature_columns)}"
)


# ============================================================
# 4. EVENT DATA
# ============================================================

print("\n[4/9] Preparing event-aware development data...")


# ------------------------------------------------------------
# Event 1 = development flood event
# Event 2 = unseen final test event
# ------------------------------------------------------------

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
    f"Event 1 flood rows : "
    f"{len(event_1):,}"
)


print(
    f"Event 2 flood rows : "
    f"{len(event_2):,}"
)


print(
    f"Normal rows        : "
    f"{len(normal):,}"
)


# ============================================================
# 5. BUILD DEVELOPMENT DATA
# ============================================================

print("\n[5/9] Building development dataset...")


# ------------------------------------------------------------
# Use ALL Event 1 flood observations.
#
# Normal observations are sampled at approximately
# 3:1 normal:flood ratio.
# ------------------------------------------------------------

development_normal_count = (
    len(event_1) * 3
)


development_normal = normal.sample(
    n=development_normal_count,
    random_state=42
)


development = pd.concat(
    [
        event_1,
        development_normal
    ],
    ignore_index=True
)


# Shuffle

development = development.sample(
    frac=1,
    random_state=42
).reset_index(
    drop=True
)


print("\nDevelopment distribution:")

print(
    development["flood_event"]
    .value_counts()
    .sort_index()
)


# ============================================================
# 6. 70/30 INTERNAL VALIDATION SPLIT
# ============================================================

print(
    "\n[6/9] Creating internal "
    "70/30 validation split..."
)


dev_train, dev_validation = train_test_split(

    development,

    test_size=0.30,

    random_state=42,

    stratify=development[
        "flood_event"
    ]

)


print(
    f"Development train rows : "
    f"{len(dev_train):,}"
)


print(
    f"Validation rows         : "
    f"{len(dev_validation):,}"
)


print("\nDevelopment train distribution:")

print(
    dev_train[
        "flood_event"
    ]
    .value_counts()
    .sort_index()
)


print("\nValidation distribution:")

print(
    dev_validation[
        "flood_event"
    ]
    .value_counts()
    .sort_index()
)


# ============================================================
# 7. PREPARE X / y
# ============================================================

print("\n[7/9] Preparing training and validation matrices...")


X_train = dev_train[
    feature_columns
].copy()


y_train = dev_train[
    "flood_event"
].astype(int)


X_validation = dev_validation[
    feature_columns
].copy()


y_validation = dev_validation[
    "flood_event"
].astype(int)


# ------------------------------------------------------------
# Replace infinity
# ------------------------------------------------------------

X_train = X_train.replace(
    [np.inf, -np.inf],
    np.nan
)


X_validation = X_validation.replace(
    [np.inf, -np.inf],
    np.nan
)


# ------------------------------------------------------------
# Fill missing values using training medians
# ------------------------------------------------------------

train_medians = X_train.median()


X_train = X_train.fillna(
    train_medians
)


X_validation = X_validation.fillna(
    train_medians
)


print(
    f"Training shape   : "
    f"{X_train.shape}"
)


print(
    f"Validation shape : "
    f"{X_validation.shape}"
)


# ============================================================
# 8. TRAIN MODEL
# ============================================================

print("\n[8/9] Training validation model...")


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
    "Validation model training completed."
)


# ============================================================
# 9. VALIDATION PREDICTIONS
# ============================================================

validation_probabilities = (
    model.predict_proba(
        X_validation
    )[:, 1]
)


validation_roc_auc = roc_auc_score(
    y_validation,
    validation_probabilities
)


validation_pr_auc = (
    average_precision_score(
        y_validation,
        validation_probabilities
    )
)


print("\n")
print("=" * 80)
print("INTERNAL VALIDATION PROBABILITY METRICS")
print("=" * 80)


print(
    f"ROC-AUC : "
    f"{validation_roc_auc:.4f}"
)


print(
    f"PR-AUC  : "
    f"{validation_pr_auc:.4f}"
)


# ============================================================
# THRESHOLD SEARCH
# ============================================================

print("\n")
print("=" * 80)
print("THRESHOLD ANALYSIS ON INTERNAL VALIDATION")
print("=" * 80)


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


threshold_results = []


for threshold in thresholds:

    predictions = (
        validation_probabilities
        >= threshold
    ).astype(int)


    accuracy = accuracy_score(
        y_validation,
        predictions
    )


    balanced_accuracy = (
        balanced_accuracy_score(
            y_validation,
            predictions
        )
    )


    precision = precision_score(
        y_validation,
        predictions,
        zero_division=0
    )


    recall = recall_score(
        y_validation,
        predictions,
        zero_division=0
    )


    f1 = f1_score(
        y_validation,
        predictions,
        zero_division=0
    )


    cm = confusion_matrix(
        y_validation,
        predictions
    )


    threshold_results.append(

        {

            "threshold": threshold,

            "accuracy": accuracy,

            "balanced_accuracy":
                balanced_accuracy,

            "precision": precision,

            "recall": recall,

            "f1": f1,

            "true_negative": cm[0, 0],

            "false_positive": cm[0, 1],

            "false_negative": cm[1, 0],

            "true_positive": cm[1, 1]

        }

    )


results_df = pd.DataFrame(
    threshold_results
)


# ============================================================
# PRINT TABLE
# ============================================================

print(
    results_df.to_string(
        index=False,
        float_format=lambda x:
        f"{x:.4f}"
    )
)


# ============================================================
# SELECT THRESHOLD
# ============================================================

# ------------------------------------------------------------
# Primary selection criterion:
#
# F1 score
#
# This balances flood precision and flood recall.
#
# Tie-breaker:
# balanced accuracy
# ------------------------------------------------------------

best_f1 = results_df[
    "f1"
].max()


best_candidates = results_df[
    results_df["f1"] == best_f1
]


best_row = best_candidates.sort_values(
    "balanced_accuracy",
    ascending=False
).iloc[0]


selected_threshold = float(
    best_row["threshold"]
)


print("\n")
print("=" * 80)
print("SELECTED THRESHOLD")
print("=" * 80)


print(
    f"Threshold          : "
    f"{selected_threshold:.5f}"
)


print(
    f"Validation F1      : "
    f"{best_row['f1']:.4f}"
)


print(
    f"Validation Recall  : "
    f"{best_row['recall']:.4f}"
)


print(
    f"Validation Precision: "
    f"{best_row['precision']:.4f}"
)


print(
    f"Balanced Accuracy  : "
    f"{best_row['balanced_accuracy']:.4f}"
)


# ============================================================
# SAVE MODEL
# ============================================================

print("\nSaving validation model...")


model.save_model(
    MODEL_OUTPUT
)


# ============================================================
# SAVE FEATURE LIST
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
# SAVE THRESHOLD RESULTS
# ============================================================

results_df.to_csv(
    RESULT_OUTPUT,
    index=False
)


# ============================================================
# SAVE SELECTED THRESHOLD
# ============================================================

threshold_file = (
    "models/"
    "resqmesh_temporal_threshold.json"
)


threshold_data = {

    "selected_threshold":
        selected_threshold,

    "selection_method":
        "maximum_validation_f1",

    "validation_roc_auc":
        float(validation_roc_auc),

    "validation_pr_auc":
        float(validation_pr_auc),

    "validation_f1":
        float(best_row["f1"]),

    "validation_precision":
        float(best_row["precision"]),

    "validation_recall":
        float(best_row["recall"]),

    "validation_balanced_accuracy":
        float(
            best_row[
                "balanced_accuracy"
            ]
        )

}


with open(
    threshold_file,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        threshold_data,
        f,
        indent=2
    )


# ============================================================
# FINAL
# ============================================================

print("\n")
print("=" * 80)
print("STEP 46 COMPLETED SUCCESSFULLY")
print("=" * 80)


print("\nValidation model:")
print(
    MODEL_OUTPUT
)


print("\nFeature list:")
print(
    FEATURE_OUTPUT
)


print("\nThreshold results:")
print(
    RESULT_OUTPUT
)


print("\nSelected threshold:")
print(
    threshold_file
)


print(
    f"\nExecution time: "
    f"{time.time() - start_time:.2f} seconds"
)


print("=" * 80)