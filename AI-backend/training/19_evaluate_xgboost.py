import pandas as pd
import numpy as np
import joblib
from pathlib import Path

from xgboost import XGBClassifier

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

# ============================================================
# STEP 19: DETAILED XGBOOST EVALUATION
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

TEST_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "xgboost_test.csv"
)

print("=" * 70)
print("STEP 19: DETAILED XGBOOST EVALUATION")
print("=" * 70)

# ============================================================
# 1. LOAD MODEL INFORMATION
# ============================================================

info = joblib.load(INFO_FILE)

features = info["features"]

print("\nFeatures used by model:")

for feature in features:
    print(" -", feature)

# ============================================================
# 2. LOAD MODEL
# ============================================================

print("\nLoading trained XGBoost model...")

model = XGBClassifier()

model.load_model(
    MODEL_FILE
)

print("Model loaded successfully.")

# ============================================================
# 3. LOAD TEST DATA
# ============================================================

print("\nLoading test data...")

test = pd.read_csv(
    TEST_FILE
)

X_test = test[
    features
]

y_test = test[
    "future_risk_target"
]

print(
    "Test records:",
    len(test)
)

# ============================================================
# 4. PREDICT
# ============================================================

print("\nGenerating predictions...")

y_pred = model.predict(
    X_test
)

y_probability = model.predict_proba(
    X_test
)

# ============================================================
# 5. BASIC METRICS
# ============================================================

accuracy = accuracy_score(
    y_test,
    y_pred
)

balanced_accuracy = balanced_accuracy_score(
    y_test,
    y_pred
)

macro_precision = precision_score(
    y_test,
    y_pred,
    average="macro",
    zero_division=0
)

macro_recall = recall_score(
    y_test,
    y_pred,
    average="macro",
    zero_division=0
)

macro_f1 = f1_score(
    y_test,
    y_pred,
    average="macro",
    zero_division=0
)

weighted_f1 = f1_score(
    y_test,
    y_pred,
    average="weighted",
    zero_division=0
)

print("\n" + "=" * 70)
print("OVERALL METRICS")
print("=" * 70)

print(
    f"Accuracy          : {accuracy:.4f}"
)

print(
    f"Balanced Accuracy : {balanced_accuracy:.4f}"
)

print(
    f"Macro Precision   : {macro_precision:.4f}"
)

print(
    f"Macro Recall      : {macro_recall:.4f}"
)

print(
    f"Macro F1          : {macro_f1:.4f}"
)

print(
    f"Weighted F1       : {weighted_f1:.4f}"
)

# ============================================================
# 6. CLASSIFICATION REPORT
# ============================================================

print("\n" + "=" * 70)
print("CLASSIFICATION REPORT")
print("=" * 70)

report = classification_report(
    y_test,
    y_pred,
    labels=[0, 1, 2],
    target_names=[
        "SAFE",
        "WARNING",
        "DANGER"
    ],
    zero_division=0
)

print(report)

# ============================================================
# 7. DANGER PERFORMANCE
# ============================================================

danger_precision = precision_score(
    y_test,
    y_pred,
    labels=[2],
    average="macro",
    zero_division=0
)

danger_recall = recall_score(
    y_test,
    y_pred,
    labels=[2],
    average="macro",
    zero_division=0
)

danger_f1 = f1_score(
    y_test,
    y_pred,
    labels=[2],
    average="macro",
    zero_division=0
)

print("\n" + "=" * 70)
print("DANGER CLASS PERFORMANCE")
print("=" * 70)

print(
    f"DANGER Precision: {danger_precision:.4f}"
)

print(
    f"DANGER Recall   : {danger_recall:.4f}"
)

print(
    f"DANGER F1       : {danger_f1:.4f}"
)

# ============================================================
# 8. CONFUSION MATRIX
# ============================================================

cm = confusion_matrix(
    y_test,
    y_pred,
    labels=[0, 1, 2]
)

print("\n" + "=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)

print(
    "              Predicted"
)

print(
    "             SAFE WARNING DANGER"
)

print(
    f"Actual SAFE   {cm[0,0]:4d} {cm[0,1]:7d} {cm[0,2]:6d}"
)

print(
    f"Actual WARNING{cm[1,0]:4d} {cm[1,1]:7d} {cm[1,2]:6d}"
)

print(
    f"Actual DANGER {cm[2,0]:4d} {cm[2,1]:7d} {cm[2,2]:6d}"
)

# ============================================================
# 9. PREDICTED DISTRIBUTION
# ============================================================

print("\n" + "=" * 70)
print("PREDICTED CLASS DISTRIBUTION")
print("=" * 70)

predicted_names = pd.Series(
    y_pred
).map(
    {
        0: "SAFE",
        1: "WARNING",
        2: "DANGER"
    }
)

print(
    predicted_names
    .value_counts()
)

# ============================================================
# 10. PROBABILITY CONFIDENCE
# ============================================================

max_probability = (
    y_probability.max(axis=1)
)

print("\n" + "=" * 70)
print("MODEL CONFIDENCE")
print("=" * 70)

print(
    f"Mean confidence : {max_probability.mean():.4f}"
)

print(
    f"Min confidence  : {max_probability.min():.4f}"
)

print(
    f"Max confidence  : {max_probability.max():.4f}"
)

# ============================================================
# 11. FEATURE IMPORTANCE
# ============================================================

print("\n" + "=" * 70)
print("FEATURE IMPORTANCE")
print("=" * 70)

importance = pd.DataFrame(
    {
        "feature": features,
        "importance": model.feature_importances_
    }
)

importance = (
    importance
    .sort_values(
        "importance",
        ascending=False
    )
)

print(
    importance.to_string(
        index=False
    )
)

# ============================================================
# 12. SAVE EVALUATION
# ============================================================

evaluation_file = (
    BASE_DIR
    / "models"
    / "xgboost_evaluation.txt"
)

with open(
    evaluation_file,
    "w",
    encoding="utf-8"
) as f:

    f.write(
        "RESQMESH XGBOOST EVALUATION\n"
    )

    f.write(
        "=" * 60 + "\n\n"
    )

    f.write(
        f"Accuracy: {accuracy:.4f}\n"
    )

    f.write(
        f"Balanced Accuracy: "
        f"{balanced_accuracy:.4f}\n"
    )

    f.write(
        f"Macro Precision: "
        f"{macro_precision:.4f}\n"
    )

    f.write(
        f"Macro Recall: "
        f"{macro_recall:.4f}\n"
    )

    f.write(
        f"Macro F1: "
        f"{macro_f1:.4f}\n"
    )

    f.write(
        f"Weighted F1: "
        f"{weighted_f1:.4f}\n"
    )

    f.write(
        f"DANGER Precision: "
        f"{danger_precision:.4f}\n"
    )

    f.write(
        f"DANGER Recall: "
        f"{danger_recall:.4f}\n"
    )

    f.write(
        f"DANGER F1: "
        f"{danger_f1:.4f}\n"
    )

print("\n" + "=" * 70)
print("EVALUATION SAVED")
print("=" * 70)

print(
    evaluation_file
)

print("\n" + "=" * 70)
print("STEP 19 COMPLETED")
print("=" * 70)