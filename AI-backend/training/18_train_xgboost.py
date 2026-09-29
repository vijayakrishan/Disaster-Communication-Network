import pandas as pd
import numpy as np
import joblib
from pathlib import Path

from xgboost import XGBClassifier

from sklearn.metrics import (
    accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    classification_report,
    confusion_matrix
)

# ============================================================
# STEP 18: TRAIN XGBOOST
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

TRAIN_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "xgboost_train.csv"
)

TEST_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "xgboost_test.csv"
)

MODEL_DIR = (
    BASE_DIR
    / "models"
)

MODEL_FILE = (
    MODEL_DIR
    / "resqmesh_xgboost_model.json"
)

INFO_FILE = (
    MODEL_DIR
    / "resqmesh_xgboost_features.joblib"
)

print("=" * 70)
print("STEP 18: TRAIN XGBOOST")
print("=" * 70)

# ============================================================
# 1. LOAD DATA
# ============================================================

print("\nLoading training data...")

train = pd.read_csv(TRAIN_FILE)
test = pd.read_csv(TEST_FILE)

print("Training records:", len(train))
print("Testing records:", len(test))

# ============================================================
# 2. DEFINE FEATURES
# ============================================================

features = [
    "water_level",
    "water_level_change_1",
    "water_level_change_3",
    "temperature",
    "pressure",
    "hour",
    "month",
    "day_of_year",
    "hour_sin",
    "hour_cos",
    "month_sin",
    "month_cos"
]

target = "future_risk_target"

X_train = train[features]
y_train = train[target]

X_test = test[features]
y_test = test[target]

print("\nNumber of features:", len(features))

# ============================================================
# 3. CLASS DISTRIBUTION
# ============================================================

print("\n" + "=" * 70)
print("TRAINING CLASS DISTRIBUTION")
print("=" * 70)

print(
    y_train.value_counts()
    .sort_index()
)

# ============================================================
# 4. CALCULATE CLASS WEIGHTS
# ============================================================

# DANGER and WARNING are minority classes.
# We give them more importance during training.

class_counts = (
    y_train
    .value_counts()
    .sort_index()
)

total = len(y_train)
number_of_classes = 3

class_weights = {}

for class_id in range(number_of_classes):

    count = class_counts.get(
        class_id,
        1
    )

    class_weights[class_id] = (
        total /
        (
            number_of_classes
            * count
        )
    )

print("\nClass weights:")

for class_id, weight in class_weights.items():

    print(
        f"Class {class_id}: {weight:.4f}"
    )

# ============================================================
# 5. SAMPLE WEIGHTS
# ============================================================

sample_weights = (
    y_train
    .map(class_weights)
    .values
)

# ============================================================
# 6. CREATE XGBOOST MODEL
# ============================================================

print("\nCreating XGBoost model...")

model = XGBClassifier(
    objective="multi:softprob",
    num_class=3,

    n_estimators=300,
    max_depth=5,
    learning_rate=0.05,

    subsample=0.8,
    colsample_bytree=0.8,

    min_child_weight=3,
    gamma=0.1,

    reg_alpha=0.1,
    reg_lambda=1.0,

    eval_metric="mlogloss",

    random_state=42,
    n_jobs=-1
)

# ============================================================
# 7. TRAIN
# ============================================================

print("\nTraining XGBoost...")

model.fit(
    X_train,
    y_train,
    sample_weight=sample_weights,
    eval_set=[
        (X_test, y_test)
    ],
    verbose=False
)

print("Training completed.")

# ============================================================
# 8. PREDICTIONS
# ============================================================

print("\nGenerating predictions...")

y_pred = model.predict(
    X_test
)

y_probability = model.predict_proba(
    X_test
)

# ============================================================
# 9. EVALUATION
# ============================================================

accuracy = accuracy_score(
    y_test,
    y_pred
)

precision = precision_score(
    y_test,
    y_pred,
    average="weighted",
    zero_division=0
)

recall = recall_score(
    y_test,
    y_pred,
    average="weighted",
    zero_division=0
)

f1 = f1_score(
    y_test,
    y_pred,
    average="weighted",
    zero_division=0
)

print("\n" + "=" * 70)
print("XGBOOST RESULTS")
print("=" * 70)

print(
    f"Accuracy : {accuracy:.4f}"
)

print(
    f"Precision: {precision:.4f}"
)

print(
    f"Recall   : {recall:.4f}"
)

print(
    f"F1 Score : {f1:.4f}"
)

# ============================================================
# 10. CLASSIFICATION REPORT
# ============================================================

print("\n" + "=" * 70)
print("CLASSIFICATION REPORT")
print("=" * 70)

print(
    classification_report(
        y_test,
        y_pred,
        target_names=[
            "SAFE",
            "WARNING",
            "DANGER"
        ],
        zero_division=0
    )
)

# ============================================================
# 11. CONFUSION MATRIX
# ============================================================

print("\n" + "=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)

cm = confusion_matrix(
    y_test,
    y_pred,
    labels=[0, 1, 2]
)

print(
    "Rows = Actual"
)

print(
    "Columns = Predicted"
)

print(
    "\n",
    cm
)

# ============================================================
# 12. FEATURE IMPORTANCE
# ============================================================

print("\n" + "=" * 70)
print("FEATURE IMPORTANCE")
print("=" * 70)

importance = (
    model.feature_importances_
)

feature_importance = (
    pd.DataFrame({
        "feature": features,
        "importance": importance
    })
    .sort_values(
        "importance",
        ascending=False
    )
)

print(
    feature_importance
    .to_string(index=False)
)

# ============================================================
# 13. SAVE MODEL
# ============================================================

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

model.save_model(
    MODEL_FILE
)

# Save feature information
joblib.dump(
    {
        "features": features,
        "target": target,
        "class_names": {
            0: "SAFE",
            1: "WARNING",
            2: "DANGER"
        }
    },
    INFO_FILE
)

print("\n" + "=" * 70)
print("MODEL SAVED")
print("=" * 70)

print(
    "Model:",
    MODEL_FILE
)

print(
    "Feature information:",
    INFO_FILE
)

print("\n" + "=" * 70)
print("STEP 18 COMPLETED")
print("=" * 70)