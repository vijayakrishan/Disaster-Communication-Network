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
print("RESQMESH - XGBOOST WITHOUT CALENDAR FEATURES")
print("=" * 70)

TRAIN_FILE = "data/processed/train_event_aware.csv"
TEST_FILE = "data/processed/test_event_aware.csv"

MODEL_DIR = "models"

MODEL_FILE = (
    MODEL_DIR +
    "/resqmesh_no_calendar_xgboost.json"
)

FEATURE_FILE = (
    MODEL_DIR +
    "/resqmesh_no_calendar_features.json"
)

IMPORTANCE_FILE = (
    "data/processed/"
    "no_calendar_xgboost_feature_importance.csv"
)

METRICS_FILE = (
    "data/processed/"
    "no_calendar_xgboost_metrics.json"
)

RANDOM_STATE = 42

# ================================================================
# 1. LOAD DATA
# ================================================================

print("\nLoading training data...")

if not os.path.exists(TRAIN_FILE):
    print("\nERROR: Training file not found.")
    raise SystemExit(1)

if not os.path.exists(TEST_FILE):
    print("\nERROR: Test file not found.")
    raise SystemExit(1)

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
# 2. TARGET
# ================================================================

TARGET = "flood_event"

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
# 3. EXCLUDE CALENDAR + METADATA
# ================================================================

print("\n" + "=" * 70)
print("REMOVING CALENDAR FEATURES")
print("=" * 70)

CALENDAR_FEATURES = [
    "year",
    "month",
    "day",
    "day_of_year",
    "month_sin",
    "month_cos",
    "day_of_year_sin",
    "day_of_year_cos"
]

METADATA_FEATURES = [
    TARGET,
    "event_id",
    "city_normalized",
    "matched_station"
]

EXCLUDED_FEATURES = (
    CALENDAR_FEATURES +
    METADATA_FEATURES
)

feature_columns = [
    column
    for column in train_df.columns
    if column not in EXCLUDED_FEATURES
]

feature_columns = [
    column
    for column in feature_columns
    if column in test_df.columns
]

print(
    f"\nCalendar features removed: "
    f"{len(CALENDAR_FEATURES)}"
)

for column in CALENDAR_FEATURES:
    print(
        f"  - {column}"
    )

print(
    f"\nFinal model feature count: "
    f"{len(feature_columns)}"
)

print("\nEnvironmental / river features:")

for i, column in enumerate(
    feature_columns,
    start=1
):
    print(
        f"{i:2d}. {column}"
    )

# ================================================================
# 4. PREPARE X
# ================================================================

X_train = train_df[
    feature_columns
].copy()

X_test = test_df[
    feature_columns
].copy()

for column in feature_columns:

    X_train[column] = pd.to_numeric(
        X_train[column],
        errors="coerce"
    )

    X_test[column] = pd.to_numeric(
        X_test[column],
        errors="coerce"
    )

# ================================================================
# 5. HANDLE INFINITE VALUES
# ================================================================

print("\n" + "=" * 70)
print("CHECKING INFINITE VALUES")
print("=" * 70)

train_inf = np.isinf(
    X_train.select_dtypes(
        include=[np.number]
    )
).sum().sum()

test_inf = np.isinf(
    X_test.select_dtypes(
        include=[np.number]
    )
).sum().sum()

print(
    f"Training infinite values: "
    f"{train_inf:,}"
)

print(
    f"Testing infinite values:  "
    f"{test_inf:,}"
)

X_train = X_train.replace(
    [np.inf, -np.inf],
    np.nan
)

X_test = X_test.replace(
    [np.inf, -np.inf],
    np.nan
)

# ================================================================
# 6. MISSING VALUE REPORT
# ================================================================

print("\n" + "=" * 70)
print("MISSING VALUE REPORT")
print("=" * 70)

train_missing = (
    X_train.isna()
    .sum()
    .sort_values(
        ascending=False
    )
)

test_missing = (
    X_test.isna()
    .sum()
    .sort_values(
        ascending=False
    )
)

print("\nTraining missing values:")

print(
    train_missing[
        train_missing > 0
    ].to_string()
)

print("\nTesting missing values:")

print(
    test_missing[
        test_missing > 0
    ].to_string()
)

print(
    "\nMissing numeric values are retained "
    "for XGBoost to handle."
)

# ================================================================
# 7. CLASS WEIGHT
# ================================================================

print("\n" + "=" * 70)
print("CLASS IMBALANCE")
print("=" * 70)

negative_count = (
    y_train == 0
).sum()

positive_count = (
    y_train == 1
).sum()

scale_pos_weight = (
    negative_count /
    positive_count
)

print(
    f"\nNormal samples: "
    f"{negative_count:,}"
)

print(
    f"Flood samples:  "
    f"{positive_count:,}"
)

print(
    f"scale_pos_weight: "
    f"{scale_pos_weight:.4f}"
)

# ================================================================
# 8. TRAIN MODEL
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

print("\nStarting training...")

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
    "\nTraining completed."
)

# ================================================================
# 9. PREDICTIONS
# ================================================================

print("\n" + "=" * 70)
print("GENERATING TEST PREDICTIONS")
print("=" * 70)

probabilities = (
    model.predict_proba(
        X_test
    )[:, 1]
)

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
    f"\nAccuracy:           "
    f"{accuracy:.4f} "
    f"({accuracy * 100:.2f}%)"
)

print(
    f"Balanced Accuracy:  "
    f"{balanced_accuracy:.4f}"
)

print(
    f"Precision:          "
    f"{precision:.4f}"
)

print(
    f"Recall:             "
    f"{recall:.4f}"
)

print(
    f"F1 Score:           "
    f"{f1:.4f}"
)

print(
    f"ROC-AUC:            "
    f"{roc_auc:.4f}"
)

print(
    f"PR-AUC:             "
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

print("\nRows = Actual")
print("Columns = Predicted")

print(
    "\n                Predicted"
)

print(
    "              Normal  Flood"
)

print(
    f"Actual Normal "
    f"{cm[0,0]:8d} {cm[0,1]:6d}"
)

print(
    f"Actual Flood  "
    f"{cm[1,0]:8d} {cm[1,1]:6d}"
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

print("\nAll probabilities:")
print(
    pd.Series(
        probabilities
    ).describe()
)

print("\nFlood-event probabilities:")
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
    "feature": feature_columns,
    "importance":
        model.feature_importances_
})

importance_df = (
    importance_df
    .sort_values(
        "importance",
        ascending=False
    )
    .reset_index(drop=True)
)

print("\nTop 20 features:")

print(
    importance_df
    .head(20)
    .to_string(index=False)
)

# ================================================================
# 15. SAVE MODEL
# ================================================================

print("\n" + "=" * 70)
print("SAVING MODEL")
print("=" * 70)

os.makedirs(
    MODEL_DIR,
    exist_ok=True
)

model.save_model(
    MODEL_FILE
)

print(
    "\nModel saved:"
)

print(
    MODEL_FILE
)

# ================================================================
# 16. SAVE FEATURE LIST
# ================================================================

with open(
    FEATURE_FILE,
    "w",
    encoding="utf-8"
) as file:

    json.dump(
        feature_columns,
        file,
        indent=2
    )

print(
    "\nFeature list saved:"
)

print(
    FEATURE_FILE
)

# ================================================================
# 17. SAVE FEATURE IMPORTANCE
# ================================================================

importance_df.to_csv(
    IMPORTANCE_FILE,
    index=False
)

print(
    "\nFeature importance saved:"
)

print(
    IMPORTANCE_FILE
)

# ================================================================
# 18. SAVE METRICS
# ================================================================

metrics = {
    "accuracy": float(accuracy),
    "balanced_accuracy":
        float(balanced_accuracy),
    "precision": float(precision),
    "recall": float(recall),
    "f1": float(f1),
    "roc_auc": float(roc_auc),
    "pr_auc": float(pr_auc),
    "threshold": float(threshold),
    "train_rows": int(len(train_df)),
    "test_rows": int(len(test_df)),
    "train_flood_rows": int(
        (y_train == 1).sum()
    ),
    "train_normal_rows": int(
        (y_train == 0).sum()
    ),
    "test_flood_rows": int(
        (y_test == 1).sum()
    ),
    "test_normal_rows": int(
        (y_test == 0).sum()
    ),
    "num_features": int(
        len(feature_columns)
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
    "\nMetrics saved:"
)

print(
    METRICS_FILE
)

# ================================================================
# FINAL
# ================================================================

print("\n" + "=" * 70)
print("STEP 39 COMPLETE")
print("=" * 70)

print(
    "\nNo-calendar XGBoost training completed."
)

print(
    "\nIMPORTANT:"
)

print(
    "Compare this model with Step 37."
)

print(
    "Focus on ROC-AUC, PR-AUC, flood recall, "
    "flood F1 and feature importance."
)

print(
    "\nDo NOT select a production threshold yet."
)