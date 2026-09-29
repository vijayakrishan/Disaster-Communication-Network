import pandas as pd
import numpy as np
import os
import json

from xgboost import XGBClassifier

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

print("=" * 70)
print("RESQMESH - PHYSICAL FEATURES XGBOOST")
print("=" * 70)

TRAIN_FILE = "data/processed/train_event_aware.csv"
TEST_FILE = "data/processed/test_event_aware.csv"

MODEL_DIR = "models"

MODEL_FILE = (
    MODEL_DIR +
    "/resqmesh_physical_xgboost.json"
)

FEATURE_FILE = (
    MODEL_DIR +
    "/resqmesh_physical_features.json"
)

IMPORTANCE_FILE = (
    "data/processed/"
    "physical_xgboost_feature_importance.csv"
)

METRICS_FILE = (
    "data/processed/"
    "physical_xgboost_metrics.json"
)

# ================================================================
# PHYSICAL FEATURES
# ================================================================

FEATURES = [

    # ------------------------------------------------------------
    # WEATHER
    # ------------------------------------------------------------

    "temperature_2m",
    "relative_humidity_2m",
    "dew_point_2m",
    "precipitation",
    "rain",
    "surface_pressure",
    "cloud_cover",
    "cloud_cover_low",
    "wind_speed_10m",

    # ------------------------------------------------------------
    # DERIVED WEATHER
    # ------------------------------------------------------------

    "temperature_humidity_index",

    # ------------------------------------------------------------
    # RIVER CONDITIONS
    # ------------------------------------------------------------

    "river_discharge",
    "discharge_change_1d",
    "discharge_change_3d",
    "discharge_change_7d",
    "discharge_3d_mean",
    "discharge_7d_mean",
    "discharge_7d_max",
    "discharge_7d_min",
    "discharge_30d_mean",
    "discharge_vs_7d_mean",
    "discharge_vs_30d_mean"
]

TARGET = "flood_event"

RANDOM_STATE = 42

# ================================================================
# 1. LOAD DATA
# ================================================================

print("\nLoading data...")

train_df = pd.read_csv(
    TRAIN_FILE,
    low_memory=False
)

test_df = pd.read_csv(
    TEST_FILE,
    low_memory=False
)

print(
    f"Training rows: {len(train_df):,}"
)

print(
    f"Testing rows:  {len(test_df):,}"
)

# ================================================================
# 2. CHECK FEATURES
# ================================================================

print("\n" + "=" * 70)
print("CHECKING FEATURES")
print("=" * 70)

missing_features = [
    feature
    for feature in FEATURES
    if feature not in train_df.columns
]

if missing_features:

    print(
        "\nERROR: Missing features:"
    )

    for feature in missing_features:
        print(
            f"  - {feature}"
        )

    raise SystemExit(1)

print(
    f"\nUsing {len(FEATURES)} physical features."
)

for i, feature in enumerate(
    FEATURES,
    start=1
):

    print(
        f"{i:2d}. {feature}"
    )

# ================================================================
# 3. TARGET
# ================================================================

y_train = (
    train_df[TARGET]
    .astype(int)
)

y_test = (
    test_df[TARGET]
    .astype(int)
)

print("\nTraining target:")

print(
    y_train.value_counts()
    .sort_index()
)

print("\nTesting target:")

print(
    y_test.value_counts()
    .sort_index()
)

# ================================================================
# 4. PREPARE FEATURES
# ================================================================

X_train = train_df[
    FEATURES
].copy()

X_test = test_df[
    FEATURES
].copy()

for feature in FEATURES:

    X_train[feature] = pd.to_numeric(
        X_train[feature],
        errors="coerce"
    )

    X_test[feature] = pd.to_numeric(
        X_test[feature],
        errors="coerce"
    )

# ================================================================
# 5. INFINITE VALUES
# ================================================================

X_train = X_train.replace(
    [np.inf, -np.inf],
    np.nan
)

X_test = X_test.replace(
    [np.inf, -np.inf],
    np.nan
)

print("\nInfinite values converted to NaN.")

# ================================================================
# 6. MISSING VALUES
# ================================================================

print("\n" + "=" * 70)
print("MISSING VALUE SUMMARY")
print("=" * 70)

missing_train = (
    X_train.isna()
    .sum()
    .sort_values(
        ascending=False
    )
)

missing_test = (
    X_test.isna()
    .sum()
    .sort_values(
        ascending=False
    )
)

print("\nTraining missing values:")

print(
    missing_train[
        missing_train > 0
    ].to_string()
)

print("\nTesting missing values:")

print(
    missing_test[
        missing_test > 0
    ].to_string()
)

# ================================================================
# 7. CLASS WEIGHT
# ================================================================

normal_count = (
    y_train == 0
).sum()

flood_count = (
    y_train == 1
).sum()

scale_pos_weight = (
    normal_count /
    flood_count
)

print("\n" + "=" * 70)
print("CLASS BALANCE")
print("=" * 70)

print(
    f"\nNormal: {normal_count:,}"
)

print(
    f"Flood:  {flood_count:,}"
)

print(
    f"scale_pos_weight: "
    f"{scale_pos_weight:.4f}"
)

# ================================================================
# 8. MODEL
# ================================================================

print("\n" + "=" * 70)
print("TRAINING XGBOOST")
print("=" * 70)

model = XGBClassifier(

    n_estimators=500,

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

    random_state=RANDOM_STATE,

    scale_pos_weight=scale_pos_weight,

    n_jobs=-1
)

print(
    "\nStarting training..."
)

model.fit(
    X_train,
    y_train,

    eval_set=[
        (X_train, y_train),
        (X_test, y_test)
    ],

    verbose=False
)

print(
    "Training completed."
)

# ================================================================
# 9. PROBABILITIES
# ================================================================

probabilities = model.predict_proba(
    X_test
)[:, 1]

threshold = 0.50

predictions = (
    probabilities >= threshold
).astype(int)

# ================================================================
# 10. METRICS
# ================================================================

print("\n" + "=" * 70)
print("MODEL EVALUATION")
print("=" * 70)

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

roc_auc = roc_auc_score(
    y_test,
    probabilities
)

pr_auc = average_precision_score(
    y_test,
    probabilities
)

print(
    f"\nAccuracy: "
    f"{accuracy:.4f} "
    f"({accuracy * 100:.2f}%)"
)

print(
    f"Balanced Accuracy: "
    f"{balanced_accuracy:.4f}"
)

print(
    f"Precision: "
    f"{precision:.4f}"
)

print(
    f"Recall: "
    f"{recall:.4f}"
)

print(
    f"F1 Score: "
    f"{f1:.4f}"
)

print(
    f"ROC-AUC: "
    f"{roc_auc:.4f}"
)

print(
    f"PR-AUC: "
    f"{pr_auc:.4f}"
)

# ================================================================
# 11. CONFUSION MATRIX
# ================================================================

print("\n" + "=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)

cm = confusion_matrix(
    y_test,
    predictions
)

print(
    "\n              Predicted"
)

print(
    "              Normal  Flood"
)

print(
    f"Actual Normal "
    f"{cm[0,0]:8d} "
    f"{cm[0,1]:6d}"
)

print(
    f"Actual Flood  "
    f"{cm[1,0]:8d} "
    f"{cm[1,1]:6d}"
)

# ================================================================
# 12. CLASSIFICATION REPORT
# ================================================================

print("\n" + "=" * 70)
print("CLASSIFICATION REPORT")
print("=" * 70)

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

# ================================================================
# 13. PROBABILITY DISTRIBUTION
# ================================================================

print("\n" + "=" * 70)
print("PROBABILITY DISTRIBUTION")
print("=" * 70)

flood_probabilities = probabilities[
    y_test.values == 1
]

normal_probabilities = probabilities[
    y_test.values == 0
]

print("\nFlood probabilities:")

print(
    pd.Series(
        flood_probabilities
    ).describe()
)

print("\nNormal probabilities:")

print(
    pd.Series(
        normal_probabilities
    ).describe()
)

# ================================================================
# 14. FEATURE IMPORTANCE
# ================================================================

print("\n" + "=" * 70)
print("FEATURE IMPORTANCE")
print("=" * 70)

importance_df = pd.DataFrame({

    "feature":
        FEATURES,

    "importance":
        model.feature_importances_

})

importance_df = (
    importance_df
    .sort_values(
        "importance",
        ascending=False
    )
    .reset_index(
        drop=True
    )
)

print(
    importance_df.to_string(
        index=False
    )
)

# ================================================================
# 15. SAVE MODEL
# ================================================================

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)

model.save_model(
    MODEL_FILE
)

print(
    f"\nModel saved: "
    f"{MODEL_FILE}"
)

# ================================================================
# 16. SAVE FEATURES
# ================================================================

with open(
    FEATURE_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        FEATURES,
        file,
        indent=2
    )

print(
    f"Features saved: "
    f"{FEATURE_FILE}"
)

# ================================================================
# 17. SAVE IMPORTANCE
# ================================================================

importance_df.to_csv(
    IMPORTANCE_FILE,
    index=False
)

print(
    f"Importance saved: "
    f"{IMPORTANCE_FILE}"
)

# ================================================================
# 18. SAVE METRICS
# ================================================================

metrics = {

    "accuracy":
        float(accuracy),

    "balanced_accuracy":
        float(balanced_accuracy),

    "precision":
        float(precision),

    "recall":
        float(recall),

    "f1":
        float(f1),

    "roc_auc":
        float(roc_auc),

    "pr_auc":
        float(pr_auc),

    "threshold":
        float(threshold),

    "num_features":
        len(FEATURES),

    "train_rows":
        len(train_df),

    "test_rows":
        len(test_df),

    "train_normal":
        int(normal_count),

    "train_flood":
        int(flood_count),

    "test_normal":
        int(
            (y_test == 0).sum()
        ),

    "test_flood":
        int(
            (y_test == 1).sum()
        )
}

with open(
    METRICS_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        metrics,
        file,
        indent=2
    )

print(
    f"Metrics saved: "
    f"{METRICS_FILE}"
)

# ================================================================
# END
# ================================================================

print("\n" + "=" * 70)
print("STEP 42 COMPLETE")
print("=" * 70)

print(
    "\nThis model uses only physical/environmental "
    "and river-condition features."
)

print(
    "\nDo NOT select a final threshold from "
    "the test event yet."
)

print("=" * 70)