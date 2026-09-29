import pandas as pd
import numpy as np
import xgboost as xgb
import joblib

from pathlib import Path

from sklearn.metrics import (
    accuracy_score,
    balanced_accuracy_score,
    precision_score,
    recall_score,
    f1_score,
    roc_auc_score,
    confusion_matrix,
    classification_report
)

print("=" * 70)
print("RESQMESH - EVENT-BASED XGBOOST TRAINING")
print("=" * 70)

# =========================================================
# PATHS
# =========================================================

TRAIN_FILE = Path(
    "data/processed/event_aware_train.csv"
)

TEST_FILE = Path(
    "data/processed/event_aware_test.csv"
)

MODEL_DIR = Path("models")
MODEL_DIR.mkdir(exist_ok=True)

MODEL_FILE = MODEL_DIR / "resqmesh_event_xgboost.json"
FEATURE_FILE = MODEL_DIR / "resqmesh_event_features.joblib"

# =========================================================
# LOAD DATA
# =========================================================

print("\nLoading training data...")

train_df = pd.read_csv(
    TRAIN_FILE,
    parse_dates=["time"]
)

print(f"Training rows: {len(train_df):,}")

print("\nLoading testing data...")

test_df = pd.read_csv(
    TEST_FILE,
    parse_dates=["time"]
)

print(f"Testing rows: {len(test_df):,}")

# =========================================================
# FEATURES
# =========================================================

features = [
    "temperature_2m",
    "relative_humidity_2m",
    "dew_point_2m",
    "precipitation",
    "rain",
    "rain_3h",
    "rain_6h",
    "rain_12h",
    "rain_24h",
    "rain_change_1h",
    "surface_pressure",
    "pressure_change_1h",
    "cloud_cover",
    "cloud_cover_low",
    "wind_speed_10m",
    "wind_direction_10m",
    "temperature_change_1h",
    "hour",
    "month",
    "day_of_year",
    "hour_sin",
    "hour_cos",
    "month_sin",
    "month_cos"
]

TARGET = "flood_event"

print("\nNumber of features:", len(features))

# =========================================================
# PREPARE X / y
# =========================================================

X_train = train_df[features].copy()
y_train = train_df[TARGET].copy()

X_test = test_df[features].copy()
y_test = test_df[TARGET].copy()

# =========================================================
# CHECK LABELS
# =========================================================

print("\n" + "=" * 70)
print("TRAIN LABEL DISTRIBUTION")
print("=" * 70)

print(y_train.value_counts())

print("\n" + "=" * 70)
print("TEST LABEL DISTRIBUTION")
print("=" * 70)

print(y_test.value_counts())

# =========================================================
# CLASS WEIGHT
# =========================================================

negative_count = int((y_train == 0).sum())
positive_count = int((y_train == 1).sum())

scale_pos_weight = negative_count / positive_count

print("\n" + "=" * 70)
print("CLASS WEIGHT")
print("=" * 70)

print(f"Negative samples : {negative_count:,}")
print(f"Positive samples : {positive_count:,}")
print(f"scale_pos_weight : {scale_pos_weight:.4f}")

# =========================================================
# TRAIN XGBOOST
# =========================================================

print("\n" + "=" * 70)
print("TRAINING XGBOOST")
print("=" * 70)

model = xgb.XGBClassifier(
    n_estimators=400,
    max_depth=6,
    learning_rate=0.05,
    subsample=0.85,
    colsample_bytree=0.85,
    min_child_weight=3,
    gamma=0.1,
    reg_alpha=0.1,
    reg_lambda=1.0,
    objective="binary:logistic",
    eval_metric="logloss",
    scale_pos_weight=scale_pos_weight,
    random_state=42,
    n_jobs=-1
)

print("\nStarting training...")

model.fit(
    X_train,
    y_train,
    eval_set=[(X_test, y_test)],
    verbose=False
)

print("Training complete.")

# =========================================================
# PREDICTION
# =========================================================

print("\nGenerating predictions...")

y_probability = model.predict_proba(X_test)[:, 1]

# Default classification threshold
threshold = 0.50

y_pred = (
    y_probability >= threshold
).astype(int)

# =========================================================
# METRICS
# =========================================================

accuracy = accuracy_score(
    y_test,
    y_pred
)

balanced_accuracy = balanced_accuracy_score(
    y_test,
    y_pred
)

precision = precision_score(
    y_test,
    y_pred,
    zero_division=0
)

recall = recall_score(
    y_test,
    y_pred,
    zero_division=0
)

f1 = f1_score(
    y_test,
    y_pred,
    zero_division=0
)

roc_auc = roc_auc_score(
    y_test,
    y_probability
)

# =========================================================
# RESULTS
# =========================================================

print("\n" + "=" * 70)
print("MODEL EVALUATION")
print("=" * 70)

print(f"\nAccuracy           : {accuracy:.4f}")
print(f"Accuracy (%)       : {accuracy * 100:.2f}%")

print(f"\nBalanced Accuracy  : {balanced_accuracy:.4f}")
print(f"Precision          : {precision:.4f}")
print(f"Recall             : {recall:.4f}")
print(f"F1 Score           : {f1:.4f}")
print(f"ROC-AUC            : {roc_auc:.4f}")

# =========================================================
# CONFUSION MATRIX
# =========================================================

cm = confusion_matrix(
    y_test,
    y_pred
)

print("\n" + "=" * 70)
print("CONFUSION MATRIX")
print("=" * 70)

print("\n              Predicted")
print("              Normal  Flood")
print(f"Actual Normal {cm[0][0]:7d} {cm[0][1]:6d}")
print(f"Actual Flood  {cm[1][0]:7d} {cm[1][1]:6d}")

# =========================================================
# CLASSIFICATION REPORT
# =========================================================

print("\n" + "=" * 70)
print("CLASSIFICATION REPORT")
print("=" * 70)

print(
    classification_report(
        y_test,
        y_pred,
        target_names=["Normal", "Flood"],
        zero_division=0
    )
)

# =========================================================
# PREDICTION DISTRIBUTION
# =========================================================

print("=" * 70)
print("PREDICTION DISTRIBUTION")
print("=" * 70)

print(
    pd.Series(
        y_pred
    ).value_counts().rename(
        index={
            0: "Normal",
            1: "Flood"
        }
    )
)

# =========================================================
# PROBABILITY SUMMARY
# =========================================================

print("\n" + "=" * 70)
print("RISK SCORE SUMMARY")
print("=" * 70)

print(
    f"Minimum risk score : {y_probability.min():.4f}"
)

print(
    f"Maximum risk score : {y_probability.max():.4f}"
)

print(
    f"Mean risk score    : {y_probability.mean():.4f}"
)

# Probability on actual flood samples
flood_probability = y_probability[
    y_test.values == 1
]

normal_probability = y_probability[
    y_test.values == 0
]

print(
    f"\nMean score - actual flood : "
    f"{flood_probability.mean():.4f}"
)

print(
    f"Mean score - normal       : "
    f"{normal_probability.mean():.4f}"
)

# =========================================================
# FEATURE IMPORTANCE
# =========================================================

print("\n" + "=" * 70)
print("FEATURE IMPORTANCE")
print("=" * 70)

importance = pd.DataFrame({
    "feature": features,
    "importance": model.feature_importances_
})

importance = importance.sort_values(
    "importance",
    ascending=False
)

print(
    importance.to_string(
        index=False
    )
)

# =========================================================
# SAVE MODEL
# =========================================================

print("\n" + "=" * 70)
print("SAVING MODEL")
print("=" * 70)

model.save_model(
    MODEL_FILE
)

joblib.dump(
    features,
    FEATURE_FILE
)

print(
    f"\nModel saved:"
    f"\n{MODEL_FILE.resolve()}"
)

print(
    f"\nFeatures saved:"
    f"\n{FEATURE_FILE.resolve()}"
)

# =========================================================
# FINAL
# =========================================================

print("\n" + "=" * 70)
print("STEP 26 COMPLETE")
print("=" * 70)