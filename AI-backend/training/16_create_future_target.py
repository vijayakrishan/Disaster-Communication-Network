import pandas as pd
import numpy as np
from pathlib import Path

# ============================================================
# STEP 16: CREATE FUTURE RISK TARGET
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "prototype_training_dataset.csv"
)

OUTPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "future_risk_dataset.csv"
)

print("=" * 70)
print("STEP 16: CREATE FUTURE RISK TARGET")
print("=" * 70)

# ============================================================
# 1. LOAD DATA
# ============================================================

print("\nLoading prototype dataset...")

df = pd.read_csv(INPUT_FILE)

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)

df = (
    df
    .dropna(
        subset=[
            "timestamp",
            "water_level"
        ]
    )
    .sort_values("timestamp")
    .reset_index(drop=True)
)

print("Records loaded:", len(df))

# ============================================================
# 2. CREATE FUTURE TIMESTAMP
# ============================================================

print("\nCreating 3-hour future target...")

df["target_time"] = (
    df["timestamp"] +
    pd.Timedelta(hours=3)
)

# ============================================================
# 3. PREPARE FUTURE WATER LEVEL DATA
# ============================================================

future = df[
    [
        "timestamp",
        "water_level"
    ]
].copy()

future = future.rename(
    columns={
        "timestamp": "future_timestamp",
        "water_level": "future_water_level"
    }
)

future = future.sort_values(
    "future_timestamp"
)

# ============================================================
# 4. MATCH CURRENT RECORD WITH FUTURE RECORD
# ============================================================

df = pd.merge_asof(
    df.sort_values("target_time"),
    future,
    left_on="target_time",
    right_on="future_timestamp",
    direction="nearest",
    tolerance=pd.Timedelta(minutes=90)
)

print(
    "Records with a usable future water-level observation:",
    df["future_water_level"].notna().sum()
)

# ============================================================
# 5. REMOVE RECORDS WITHOUT FUTURE TARGET
# ============================================================

df = df.dropna(
    subset=["future_water_level"]
).copy()

df = df.reset_index(
    drop=True
)

print(
    "Records remaining:",
    len(df)
)

# ============================================================
# 6. FUTURE RISK THRESHOLDS
# ============================================================

WARNING_THRESHOLD = 86.469
DANGER_THRESHOLD = 86.575

print("\nFuture-risk thresholds:")
print(
    f"WARNING >= {WARNING_THRESHOLD} m"
)
print(
    f"DANGER  >= {DANGER_THRESHOLD} m"
)

# ============================================================
# 7. CREATE FUTURE RISK LABEL
# ============================================================

def classify_future_risk(water_level):

    if water_level >= DANGER_THRESHOLD:
        return "DANGER"

    elif water_level >= WARNING_THRESHOLD:
        return "WARNING"

    else:
        return "SAFE"


df["future_risk_label"] = (
    df["future_water_level"]
    .apply(classify_future_risk)
)

# Numeric target

label_mapping = {
    "SAFE": 0,
    "WARNING": 1,
    "DANGER": 2
}

df["future_risk_target"] = (
    df["future_risk_label"]
    .map(label_mapping)
)

# ============================================================
# 8. TARGET DISTRIBUTION
# ============================================================

print("\n" + "=" * 70)
print("FUTURE TARGET DISTRIBUTION")
print("=" * 70)

counts = (
    df["future_risk_label"]
    .value_counts()
)

print(counts)

print("\nPercentages:")

percentages = (
    df["future_risk_label"]
    .value_counts(normalize=True)
    * 100
)

print(
    percentages.round(2)
)

# ============================================================
# 9. SHOW EXAMPLES
# ============================================================

print("\n" + "=" * 70)
print("SAMPLE FUTURE PREDICTION TARGETS")
print("=" * 70)

print(
    df[
        [
            "timestamp",
            "water_level",
            "future_timestamp",
            "future_water_level",
            "future_risk_label"
        ]
    ].head(10).to_string(index=False)
)

# ============================================================
# 10. SAVE DATASET
# ============================================================

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 70)
print("FUTURE RISK DATASET SAVED")
print("=" * 70)

print(OUTPUT_FILE)

print("\nDataset shape:")
print(df.shape)

print("\n" + "=" * 70)
print("STEP 16 COMPLETED")
print("=" * 70)