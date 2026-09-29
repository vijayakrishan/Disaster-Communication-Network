import pandas as pd
import numpy as np
import os
import json

from xgboost import XGBClassifier

from sklearn.metrics import (
    precision_score,
    recall_score,
    f1_score,
    balanced_accuracy_score,
    confusion_matrix
)

print("=" * 70)
print("RESQMESH - ANALYZE XGBOOST PREDICTION THRESHOLDS")
print("=" * 70)

TRAIN_FILE = "data/processed/train_event_aware.csv"
TEST_FILE = "data/processed/test_event_aware.csv"

MODEL_FILE = "models/resqmesh_improved_event_xgboost.json"
FEATURE_FILE = "models/resqmesh_improved_features.json"

OUTPUT_FILE = (
    "data/processed/"
    "xgboost_threshold_analysis.csv"
)

# ================================================================
# 1. LOAD DATA
# ================================================================

print("\nLoading datasets...")

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
# 2. LOAD FEATURE LIST
# ================================================================

if not os.path.exists(FEATURE_FILE):

    print(
        "\nERROR: Feature file not found:"
    )

    print(FEATURE_FILE)

    raise SystemExit(1)

with open(
    FEATURE_FILE,
    "r",
    encoding="utf-8"
) as file:

    feature_columns = json.load(file)

print(
    f"\nFeatures loaded: "
    f"{len(feature_columns)}"
)

# ================================================================
# 3. PREPARE FEATURES
# ================================================================

X_test = test_df[
    feature_columns
].copy()

y_test = test_df[
    "flood_event"
].astype(int)

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

print("\nLoading trained XGBoost model...")

if not os.path.exists(MODEL_FILE):

    print(
        "\nERROR: Model file not found:"
    )

    print(MODEL_FILE)

    raise SystemExit(1)

model = XGBClassifier()

model.load_model(
    MODEL_FILE
)

print(
    "Model loaded successfully."
)

# ================================================================
# 5. GENERATE PROBABILITIES
# ================================================================

print("\nGenerating flood-risk probabilities...")

probabilities = model.predict_proba(
    X_test
)[:, 1]

print(
    f"Minimum probability: "
    f"{probabilities.min():.8f}"
)

print(
    f"Maximum probability: "
    f"{probabilities.max():.8f}"
)

# ================================================================
# 6. THRESHOLD ANALYSIS
# ================================================================

print("\n" + "=" * 70)
print("THRESHOLD ANALYSIS")
print("=" * 70)

thresholds = [
    0.00005,
    0.00010,
    0.00015,
    0.00020,
    0.00025,
    0.00030,
    0.00040,
    0.00050,
    0.00075,
    0.00100,
    0.00200,
    0.00500,
    0.01000,
    0.02000,
    0.05000,
    0.10000,
    0.20000,
    0.30000,
    0.50000
]

results = []

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

    tn = cm[0, 0]
    fp = cm[0, 1]
    fn = cm[1, 0]
    tp = cm[1, 1]

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
        "predicted_flood":
            int(predictions.sum())
    })

results_df = pd.DataFrame(
    results
)

print(
    "\n"
    + results_df.to_string(
        index=False,
        float_format=lambda x:
        f"{x:.6f}"
    )
)

# ================================================================
# 7. BEST THRESHOLDS BY DIFFERENT METRICS
# ================================================================

print("\n" + "=" * 70)
print("THRESHOLD SUMMARY")
print("=" * 70)

best_f1 = results_df.loc[
    results_df["f1"].idxmax()
]

best_balanced = results_df.loc[
    results_df[
        "balanced_accuracy"
    ].idxmax()
]

best_recall = results_df.loc[
    results_df["recall"].idxmax()
]

print("\nHighest F1 threshold:")
print(best_f1.to_string())

print("\nHighest balanced-accuracy threshold:")
print(best_balanced.to_string())

print("\nHighest recall threshold:")
print(best_recall.to_string())

# ================================================================
# 8. FLOOD PROBABILITY DISTRIBUTION
# ================================================================

print("\n" + "=" * 70)
print("FLOOD VS NORMAL PROBABILITY DISTRIBUTION")
print("=" * 70)

flood_probabilities = probabilities[
    y_test.values == 1
]

normal_probabilities = probabilities[
    y_test.values == 0
]

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
# 9. SAVE RESULTS
# ================================================================

results_df.to_csv(
    OUTPUT_FILE,
    index=False
)

print(
    f"\nThreshold analysis saved:"
)

print(
    OUTPUT_FILE
)

print("\n" + "=" * 70)
print("STEP 38 COMPLETE")
print("=" * 70)

print(
    "\nIMPORTANT:"
)

print(
    "These threshold results are diagnostic."
)

print(
    "Do not select the final production threshold "
    "using the test event alone."
)