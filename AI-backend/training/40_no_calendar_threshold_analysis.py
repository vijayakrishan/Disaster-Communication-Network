import pandas as pd
import numpy as np
import json
import os

from xgboost import XGBClassifier

from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    balanced_accuracy_score,
    confusion_matrix
)

print("=" * 70)
print("RESQMESH - NO-CALENDAR XGBOOST THRESHOLD ANALYSIS")
print("=" * 70)

TEST_FILE = "data/processed/test_event_aware.csv"

MODEL_FILE = "models/resqmesh_no_calendar_xgboost.json"

FEATURE_FILE = "models/resqmesh_no_calendar_features.json"

OUTPUT_FILE = (
    "data/processed/"
    "no_calendar_threshold_analysis.csv"
)

# ================================================================
# 1. LOAD TEST DATA
# ================================================================

print("\nLoading test data...")

test_df = pd.read_csv(
    TEST_FILE,
    low_memory=False
)

y_test = test_df["flood_event"].astype(int)

# ================================================================
# 2. LOAD FEATURES
# ================================================================

with open(
    FEATURE_FILE,
    "r",
    encoding="utf-8"
) as file:
    feature_columns = json.load(file)

print(
    f"Features loaded: {len(feature_columns)}"
)

# ================================================================
# 3. PREPARE TEST DATA
# ================================================================

X_test = test_df[
    feature_columns
].copy()

for column in feature_columns:

    X_test[column] = pd.to_numeric(
        X_test[column],
        errors="coerce"
    )

X_test = X_test.replace(
    [np.inf, -np.inf],
    np.nan
)

# ================================================================
# 4. LOAD MODEL
# ================================================================

print("\nLoading XGBoost model...")

model = XGBClassifier()

model.load_model(
    MODEL_FILE
)

# ================================================================
# 5. PREDICT PROBABILITIES
# ================================================================

probabilities = model.predict_proba(
    X_test
)[:, 1]

print(
    "\nProbability range:"
)

print(
    f"Minimum: {probabilities.min():.8f}"
)

print(
    f"Maximum: {probabilities.max():.8f}"
)

# ================================================================
# 6. THRESHOLD ANALYSIS
# ================================================================

thresholds = [
    0.00005,
    0.00010,
    0.00020,
    0.00050,
    0.00100,
    0.00200,
    0.00500,
    0.01000,
    0.02000,
    0.03000,
    0.05000,
    0.07500,
    0.10000,
    0.15000,
    0.20000,
    0.30000,
    0.50000
]

results = []

print("\n" + "=" * 70)
print("THRESHOLD ANALYSIS")
print("=" * 70)

for threshold in thresholds:

    predictions = (
        probabilities >= threshold
    ).astype(int)

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

    balanced_accuracy = (
        balanced_accuracy_score(
            y_test,
            predictions
        )
    )

    cm = confusion_matrix(
        y_test,
        predictions
    )

    tn, fp, fn, tp = cm.ravel()

    predicted_flood = (
        predictions == 1
    ).sum()

    results.append({
        "threshold": threshold,
        "precision": precision,
        "recall": recall,
        "f1": f1,
        "balanced_accuracy":
            balanced_accuracy,
        "true_negative": tn,
        "false_positive": fp,
        "false_negative": fn,
        "true_positive": tp,
        "predicted_flood": predicted_flood
    })

    print(
        f"\nThreshold: {threshold:.5f}"
    )

    print(
        f"Precision: {precision:.4f}"
    )

    print(
        f"Recall: {recall:.4f}"
    )

    print(
        f"F1: {f1:.4f}"
    )

    print(
        f"Balanced Accuracy: "
        f"{balanced_accuracy:.4f}"
    )

    print(
        f"TN={tn}, FP={fp}, "
        f"FN={fn}, TP={tp}"
    )

    print(
        f"Predicted Flood: "
        f"{predicted_flood}"
    )

# ================================================================
# 7. SAVE RESULTS
# ================================================================

results_df = pd.DataFrame(
    results
)

results_df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 70)
print("THRESHOLD ANALYSIS COMPLETE")
print("=" * 70)

print(
    f"\nSaved:"
)

print(
    OUTPUT_FILE
)

# ================================================================
# 8. BEST F1 - DIAGNOSTIC ONLY
# ================================================================

best_f1 = results_df.loc[
    results_df["f1"].idxmax()
]

best_balanced = results_df.loc[
    results_df["balanced_accuracy"].idxmax()
]

print("\nBest F1 threshold in THIS TEST SET:")

print(
    best_f1.to_string()
)

print(
    "\nBest balanced-accuracy threshold "
    "in THIS TEST SET:"
)

print(
    best_balanced.to_string()
)

print("\n" + "=" * 70)

print(
    "IMPORTANT:"
)

print(
    "These thresholds are diagnostic only."
)

print(
    "Do NOT use them as the final production "
    "threshold because this is the unseen test event."
)

print("=" * 70)