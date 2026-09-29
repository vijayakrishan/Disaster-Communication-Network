import pandas as pd
import numpy as np
import xgboost as xgb
import json
import os
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
# STEP 50
# FINAL VALIDATION
#
# IMPORTANT:
#
# Event 1 = development event
# Event 2 = completely unseen final test event
#
# Calendar features are NOT used.
#
# Threshold is selected ONLY from the 2021 development
# validation split.
#
# The selected threshold is then frozen and applied to 2023.
# ============================================================


INPUT_FILE = (
    "data/processed/"
    "temporal_weather_training_data.csv"
)

MODEL_OUTPUT = (
    "models/"
    "resqmesh_final_validated_model.json"
)

FEATURE_OUTPUT = (
    "models/"
    "resqmesh_final_validated_features.json"
)

THRESHOLD_OUTPUT = (
    "models/"
    "resqmesh_final_validated_threshold.json"
)

RESULT_OUTPUT = (
    "data/processed/"
    "resqmesh_final_validation_results.csv"
)


os.makedirs(
    "models",
    exist_ok=True
)

os.makedirs(
    "data/processed",
    exist_ok=True
)


start_time = time.time()


print("=" * 80)
print("STEP 50 - FINAL VALIDATION AND FINAL UNSEEN TEST")
print("=" * 80)


# ============================================================
# 1. LOAD DATA
# ============================================================

print("\n[1/12] Loading temporal dataset...")


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

print(
    "\n[2/12] Creating engineered weather features..."
)


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
# 3. PHYSICAL + TEMPORAL FEATURES
#
# NO CALENDAR FEATURES
# ============================================================

print(
    "\n[3/12] Preparing physical + temporal features..."
)


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
    # Rain risk indicators
    # --------------------------------------------------------

    "is_heavy_rain_3h",
    "is_heavy_rain_6h",
    "is_heavy_rain_24h",
    "is_extreme_rain_24h",

    "rain_acceleration",

    "humidity_pressure_risk"

]


print(
    f"Total features: {len(features)}"
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

    print(
        "\nERROR: Missing features:"
    )

    for feature in missing_features:

        print(
            " -",
            feature
        )

    raise SystemExit


# ============================================================
# 4. SEPARATE EVENTS
# ============================================================

print(
    "\n[4/12] Separating development and unseen events..."
)


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
    f"2021 flood rows : {len(event_1):,}"
)


print(
    f"2023 flood rows : {len(event_2):,}"
)


print(
    f"Normal rows     : {len(normal):,}"
)


# ============================================================
# 5. BUILD DEVELOPMENT DATA
#
# 2021 FLOOD + NORMAL
# ============================================================

print(
    "\n[5/12] Building 2021 development dataset..."
)


development_flood = event_1.copy()


development_normal = normal.sample(
    n=len(development_flood) * 3,
    random_state=42
)


development = pd.concat(
    [
        development_flood,
        development_normal
    ],
    ignore_index=True
)


development = development.sample(
    frac=1,
    random_state=42
).reset_index(
    drop=True
)


print(
    "\nDevelopment distribution:"
)


print(
    development[
        "flood_event"
    ]
    .value_counts()
    .sort_index()
)


# ============================================================
# 6. INTERNAL TRAIN / VALIDATION SPLIT
# ============================================================

print(
    "\n[6/12] Creating internal validation split..."
)


development_train, development_validation = (
    train_test_split(
        development,
        test_size=0.30,
        random_state=42,
        stratify=development["flood_event"]
    )
)


print(
    f"Development training rows : "
    f"{len(development_train):,}"
)


print(
    f"Validation rows            : "
    f"{len(development_validation):,}"
)


print(
    "\nDevelopment training distribution:"
)


print(
    development_train[
        "flood_event"
    ]
    .value_counts()
    .sort_index()
)


print(
    "\nValidation distribution:"
)


print(
    development_validation[
        "flood_event"
    ]
    .value_counts()
    .sort_index()
)


# ============================================================
# 7. PREPARE VALIDATION MATRICES
# ============================================================

print(
    "\n[7/12] Preparing validation matrices..."
)


X_dev_train = development_train[
    features
].copy()


y_dev_train = development_train[
    "flood_event"
].astype(int)


X_validation = development_validation[
    features
].copy()


y_validation = development_validation[
    "flood_event"
].astype(int)


# ------------------------------------------------------------
# Replace infinity
# ------------------------------------------------------------

X_dev_train = X_dev_train.replace(
    [np.inf, -np.inf],
    np.nan
)


X_validation = X_validation.replace(
    [np.inf, -np.inf],
    np.nan
)


# ------------------------------------------------------------
# Use training medians
# ------------------------------------------------------------

training_medians = (
    X_dev_train.median()
)


X_dev_train = X_dev_train.fillna(
    training_medians
)


X_validation = X_validation.fillna(
    training_medians
)


print(
    f"Training matrix   : "
    f"{X_dev_train.shape}"
)


print(
    f"Validation matrix : "
    f"{X_validation.shape}"
)


# ============================================================
# 8. TRAIN VALIDATION MODEL
# ============================================================

print(
    "\n[8/12] Training validation model..."
)


validation_model = xgb.XGBClassifier(

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


validation_model.fit(
    X_dev_train,
    y_dev_train
)


print(
    "Validation model training completed."
)


# ============================================================
# 9. VALIDATION PROBABILITIES
# ============================================================

print(
    "\n[9/12] Selecting threshold using 2021 validation only..."
)


validation_probabilities = (
    validation_model.predict_proba(
        X_validation
    )[:, 1]
)


validation_roc_auc = (
    roc_auc_score(
        y_validation,
        validation_probabilities
    )
)


validation_pr_auc = (
    average_precision_score(
        y_validation,
        validation_probabilities
    )
)


print(
    f"Validation ROC-AUC : "
    f"{validation_roc_auc:.4f}"
)


print(
    f"Validation PR-AUC  : "
    f"{validation_pr_auc:.4f}"
)


# ============================================================
# THRESHOLD SEARCH
# ============================================================

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

    validation_predictions = (
        validation_probabilities
        >= threshold
    ).astype(int)


    accuracy = accuracy_score(
        y_validation,
        validation_predictions
    )


    balanced_accuracy = (
        balanced_accuracy_score(
            y_validation,
            validation_predictions
        )
    )


    precision = precision_score(
        y_validation,
        validation_predictions,
        zero_division=0
    )


    recall = recall_score(
        y_validation,
        validation_predictions,
        zero_division=0
    )


    f1 = f1_score(
        y_validation,
        validation_predictions,
        zero_division=0
    )


    threshold_results.append({

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
            f1

    })


threshold_df = pd.DataFrame(
    threshold_results
)


# ============================================================
# SELECT THRESHOLD
#
# Primary:
#   F1
#
# Tie breaker:
#   Balanced accuracy
# ============================================================

threshold_df = threshold_df.sort_values(
    [
        "f1",
        "balanced_accuracy"
    ],
    ascending=False
).reset_index(
    drop=True
)


selected_threshold = float(
    threshold_df.iloc[0]["threshold"]
)


selected_validation_row = (
    threshold_df.iloc[0]
)


print("\n")
print("=" * 80)
print("2021 VALIDATION THRESHOLD RESULTS")
print("=" * 80)


print(
    threshold_df.to_string(
        index=False,
        float_format=lambda x:
        f"{x:.6f}"
    )
)


print("\n")
print("=" * 80)
print("FROZEN THRESHOLD")
print("=" * 80)


print(
    f"Selected threshold : "
    f"{selected_threshold:.6f}"
)


print(
    f"Validation F1      : "
    f"{selected_validation_row['f1']:.4f}"
)


print(
    f"Validation Recall  : "
    f"{selected_validation_row['recall']:.4f}"
)


print(
    f"Validation Precision: "
    f"{selected_validation_row['precision']:.4f}"
)


print(
    f"Validation Balanced Accuracy: "
    f"{selected_validation_row['balanced_accuracy']:.4f}"
)


# ============================================================
# 10. FINAL TRAINING DATA
#
# After threshold selection:
# use ALL 2021 development data.
# ============================================================

print(
    "\n[10/12] Training final model on all 2021 development data..."
)


X_final_train = development[
    features
].copy()


y_final_train = development[
    "flood_event"
].astype(int)


X_final_train = X_final_train.replace(
    [np.inf, -np.inf],
    np.nan
)


final_training_medians = (
    X_final_train.median()
)


X_final_train = X_final_train.fillna(
    final_training_medians
)


final_model = xgb.XGBClassifier(

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


final_model.fit(
    X_final_train,
    y_final_train
)


print(
    "Final model training completed."
)


# ============================================================
# 11. PREPARE 2023 UNSEEN TEST
# ============================================================

print(
    "\n[11/12] Preparing completely unseen 2023 test..."
)


test_flood = event_2.copy()


test_normal = normal.sample(
    n=len(test_flood) * 3,
    random_state=123
)


final_test = pd.concat(
    [
        test_flood,
        test_normal
    ],
    ignore_index=True
)


final_test = final_test.sample(
    frac=1,
    random_state=123
).reset_index(
    drop=True
)


X_final_test = final_test[
    features
].copy()


y_final_test = final_test[
    "flood_event"
].astype(int)


X_final_test = X_final_test.replace(
    [np.inf, -np.inf],
    np.nan
)


X_final_test = X_final_test.fillna(
    final_training_medians
)


print(
    f"Final test rows : "
    f"{len(final_test):,}"
)


print(
    "\nFinal test distribution:"
)


print(
    y_final_test
    .value_counts()
    .sort_index()
)


# ============================================================
# 12. FINAL EVALUATION
# ============================================================

print(
    "\n[12/12] Evaluating frozen model on unseen 2023..."
)


final_probabilities = (
    final_model.predict_proba(
        X_final_test
    )[:, 1]
)


# ------------------------------------------------------------
# IMPORTANT:
#
# This threshold was selected BEFORE looking at 2023.
# ------------------------------------------------------------

final_predictions = (
    final_probabilities
    >= selected_threshold
).astype(int)


# ------------------------------------------------------------
# Metrics
# ------------------------------------------------------------

final_accuracy = accuracy_score(
    y_final_test,
    final_predictions
)


final_balanced_accuracy = (
    balanced_accuracy_score(
        y_final_test,
        final_predictions
    )
)


final_precision = precision_score(
    y_final_test,
    final_predictions,
    zero_division=0
)


final_recall = recall_score(
    y_final_test,
    final_predictions,
    zero_division=0
)


final_f1 = f1_score(
    y_final_test,
    final_predictions,
    zero_division=0
)


final_roc_auc = roc_auc_score(
    y_final_test,
    final_probabilities
)


final_pr_auc = average_precision_score(
    y_final_test,
    final_probabilities
)


final_cm = confusion_matrix(
    y_final_test,
    final_predictions
)


# ============================================================
# FINAL RESULTS
# ============================================================

print("\n")
print("=" * 80)
print("FINAL VALIDATED MODEL RESULTS")
print("=" * 80)


print(
    "\nTraining event : 2021"
)


print(
    "Final test event: 2023"
)


print(
    "\nFROZEN THRESHOLD:"
)


print(
    f"{selected_threshold:.6f}"
)


print(
    "\nFINAL UNSEEN TEST METRICS:"
)


print(
    f"Accuracy            : "
    f"{final_accuracy:.4f} "
    f"({final_accuracy * 100:.2f}%)"
)


print(
    f"Balanced Accuracy   : "
    f"{final_balanced_accuracy:.4f} "
    f"({final_balanced_accuracy * 100:.2f}%)"
)


print(
    f"Precision           : "
    f"{final_precision:.4f} "
    f"({final_precision * 100:.2f}%)"
)


print(
    f"Recall              : "
    f"{final_recall:.4f} "
    f"({final_recall * 100:.2f}%)"
)


print(
    f"F1 Score            : "
    f"{final_f1:.4f} "
    f"({final_f1 * 100:.2f}%)"
)


print(
    f"ROC-AUC             : "
    f"{final_roc_auc:.4f}"
)


print(
    f"PR-AUC              : "
    f"{final_pr_auc:.4f}"
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
    f"{final_cm[0,0]:6d}   "
    f"{final_cm[0,1]:6d}"
)


print(
    f"Actual Flood     "
    f"{final_cm[1,0]:6d}   "
    f"{final_cm[1,1]:6d}"
)


# ============================================================
# PROBABILITY DISTRIBUTION
# ============================================================

normal_probabilities = (
    final_probabilities[
        y_final_test.values == 0
    ]
)


flood_probabilities = (
    final_probabilities[
        y_final_test.values == 1
    ]
)


print(
    "\nProbability distribution:"
)


print(
    f"Normal mean   : "
    f"{normal_probabilities.mean():.8f}"
)


print(
    f"Normal median : "
    f"{np.median(normal_probabilities):.8f}"
)


print(
    f"Flood mean    : "
    f"{flood_probabilities.mean():.8f}"
)


print(
    f"Flood median  : "
    f"{np.median(flood_probabilities):.8f}"
)


# ============================================================
# FEATURE IMPORTANCE
# ============================================================

print(
    "\nTop 20 final feature importances:"
)


importance = pd.DataFrame({

    "feature":
        features,

    "importance":
        final_model.feature_importances_

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
# SAVE FINAL MODEL
# ============================================================

print(
    "\nSaving final model..."
)


final_model.save_model(
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
        features,
        f,
        indent=2
    )


# ============================================================
# SAVE THRESHOLD
# ============================================================

threshold_information = {

    "selected_threshold":
        selected_threshold,

    "selection_method":
        "Maximum validation F1; balanced accuracy used as tie-breaker",

    "threshold_selection_event":
        "2021",

    "final_test_event":
        "2023",

    "calendar_features_used":
        False

}


with open(
    THRESHOLD_OUTPUT,
    "w",
    encoding="utf-8"
) as f:

    json.dump(
        threshold_information,
        f,
        indent=2
    )


# ============================================================
# SAVE FINAL RESULTS
# ============================================================

final_results = {

    "model":
        "ResQMesh No-Calendar Temporal XGBoost",

    "training_event":
        "2021",

    "test_event":
        "2023",

    "number_of_features":
        len(features),

    "threshold":
        selected_threshold,

    "validation_f1":
        float(selected_validation_row["f1"]),

    "validation_balanced_accuracy":
        float(
            selected_validation_row[
                "balanced_accuracy"
            ]
        ),

    "final_accuracy":
        final_accuracy,

    "final_balanced_accuracy":
        final_balanced_accuracy,

    "final_precision":
        final_precision,

    "final_recall":
        final_recall,

    "final_f1":
        final_f1,

    "final_roc_auc":
        final_roc_auc,

    "final_pr_auc":
        final_pr_auc,

    "true_negative":
        int(final_cm[0, 0]),

    "false_positive":
        int(final_cm[0, 1]),

    "false_negative":
        int(final_cm[1, 0]),

    "true_positive":
        int(final_cm[1, 1])

}


pd.DataFrame(
    [final_results]
).to_csv(
    RESULT_OUTPUT,
    index=False
)


# ============================================================
# COMPLETION
# ============================================================

print("\n")
print("=" * 80)
print("STEP 50 COMPLETED SUCCESSFULLY")
print("=" * 80)


print(
    "\nFINAL MODEL:"
)

print(
    MODEL_OUTPUT
)


print(
    "\nFINAL FEATURE LIST:"
)

print(
    FEATURE_OUTPUT
)


print(
    "\nFINAL THRESHOLD:"
)

print(
    THRESHOLD_OUTPUT
)


print(
    "\nFINAL RESULTS:"
)

print(
    RESULT_OUTPUT
)


print(
    f"\nExecution time: "
    f"{time.time() - start_time:.2f} seconds"
)


print("=" * 80)