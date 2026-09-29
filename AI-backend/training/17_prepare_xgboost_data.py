import pandas as pd
from pathlib import Path

# ============================================================
# STEP 17: PREPARE DATA FOR XGBOOST
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "future_risk_dataset.csv"
)

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

print("=" * 70)
print("STEP 17: PREPARE DATA FOR XGBOOST")
print("=" * 70)

# ============================================================
# 1. LOAD DATA
# ============================================================

print("\nLoading future-risk dataset...")

df = pd.read_csv(INPUT_FILE)

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)

df = (
    df
    .dropna(subset=["timestamp"])
    .sort_values("timestamp")
    .reset_index(drop=True)
)

print("Total records:", len(df))

# ============================================================
# 2. REMOVE FUTURE INFORMATION
# ============================================================

future_columns = [
    "target_time",
    "future_timestamp",
    "future_water_level",
    "future_risk_label",
    "risk_label",
    "risk_target"
]

for column in future_columns:

    if column in df.columns:
        df = df.drop(columns=[column])

print("\nFuture/leakage columns removed.")

# ============================================================
# 3. MODEL FEATURES
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

missing_features = [
    column
    for column in features
    if column not in df.columns
]

if missing_features:

    print("\nERROR: Missing features:")
    print(missing_features)

    raise SystemExit(1)

if target not in df.columns:

    print("\nERROR: Target column missing.")

    raise SystemExit(1)

# ============================================================
# 4. CREATE MODEL DATA
# ============================================================

model_data = df[
    ["timestamp"] + features + [target]
].copy()

print("\nFeatures selected:")

for feature in features:
    print(" -", feature)

print("\nTarget:")
print(" -", target)

# ============================================================
# 5. HANDLE MISSING VALUES
# ============================================================

print("\n" + "=" * 70)
print("MISSING VALUES")
print("=" * 70)

print(
    model_data[features + [target]]
    .isna()
    .sum()
)

for column in features:

    if model_data[column].isna().any():

        median_value = (
            model_data[column]
            .median()
        )

        model_data[column] = (
            model_data[column]
            .fillna(median_value)
        )

model_data = (
    model_data
    .dropna(subset=[target])
    .reset_index(drop=True)
)

# ============================================================
# 6. TEMPORAL EVENT-AWARE SPLIT
# ============================================================
#
# We need all three classes in training.
#
# Danger begins on 2025-05-27.
# Warning begins on 2025-05-17.
#
# We therefore use:
#
# TRAIN:
#   2023-11-23 through 2025-06-15
#
# TEST:
#   2025-06-16 onward
#
# This gives the model historical examples of all classes
# while keeping the later period completely unseen.
# ============================================================

TRAIN_END = pd.Timestamp(
    "2025-06-15 23:59:59"
)

TEST_START = pd.Timestamp(
    "2025-06-16 00:00:00"
)

train_data = model_data[
    model_data["timestamp"] <= TRAIN_END
].copy()

test_data = model_data[
    model_data["timestamp"] >= TEST_START
].copy()

# ============================================================
# 7. REMOVE TIMESTAMP FROM MODEL INPUT
# ============================================================

train_data = train_data[
    features + [target]
].copy()

test_data = test_data[
    features + [target]
].copy()

# ============================================================
# 8. SHOW SPLIT
# ============================================================

print("\n" + "=" * 70)
print("TEMPORAL SPLIT")
print("=" * 70)

print(
    "Training records:",
    len(train_data)
)

print(
    "Testing records:",
    len(test_data)
)

# ============================================================
# 9. TARGET DISTRIBUTION
# ============================================================

print("\n" + "=" * 70)
print("TRAINING TARGET DISTRIBUTION")
print("=" * 70)

print(
    train_data[target]
    .value_counts()
    .sort_index()
)

print("\nTesting target distribution:")

print(
    test_data[target]
    .value_counts()
    .sort_index()
)

# ============================================================
# 10. VERIFY ALL CLASSES
# ============================================================

required_classes = [0, 1, 2]

training_classes = sorted(
    train_data[target]
    .unique()
)

testing_classes = sorted(
    test_data[target]
    .unique()
)

print("\nTraining classes:", training_classes)
print("Testing classes:", testing_classes)

missing_training = [
    c for c in required_classes
    if c not in training_classes
]

if missing_training:

    print(
        "\nERROR: Training is missing:",
        missing_training
    )

    raise SystemExit(1)

print(
    "\nAll three classes are present in training."
)

# ============================================================
# 11. SAVE
# ============================================================

train_data.to_csv(
    TRAIN_FILE,
    index=False
)

test_data.to_csv(
    TEST_FILE,
    index=False
)

print("\n" + "=" * 70)
print("FILES SAVED")
print("=" * 70)

print(
    "Training:",
    TRAIN_FILE
)

print(
    "Testing:",
    TEST_FILE
)

print("\n" + "=" * 70)
print("STEP 17 COMPLETED")
print("=" * 70)