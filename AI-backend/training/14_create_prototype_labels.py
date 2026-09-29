import pandas as pd
import numpy as np
from pathlib import Path

# ============================================================
# STEP 14: CREATE PROTOTYPE SAFE / WARNING / DANGER LABELS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "water_level_target_ready.csv"
)

OUTPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "water_level_labeled.csv"
)

print("=" * 70)
print("STEP 14: CREATE PROTOTYPE RISK LABELS")
print("=" * 70)

# ------------------------------------------------------------
# 1. LOAD TARGET-READY DATA
# ------------------------------------------------------------

df = pd.read_csv(INPUT_FILE)

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)

df["water_level"] = pd.to_numeric(
    df["water_level"],
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

print("\nInput records:", len(df))

# ------------------------------------------------------------
# 2. CALCULATE STATISTICAL THRESHOLDS
# ------------------------------------------------------------

warning_threshold = np.percentile(
    df["water_level"],
    90
)

danger_threshold = np.percentile(
    df["water_level"],
    97
)

print("\n" + "=" * 70)
print("PROTOTYPE THRESHOLDS")
print("=" * 70)

print(
    f"Warning threshold (90th percentile): "
    f"{warning_threshold:.3f} m"
)

print(
    f"Danger threshold (97th percentile): "
    f"{danger_threshold:.3f} m"
)

print(
    "\nThese are statistical prototype thresholds."
)

print(
    "They are NOT official flood thresholds."
)

# ------------------------------------------------------------
# 3. CREATE RISK LABEL
# ------------------------------------------------------------

def create_risk_label(water_level):

    if water_level >= danger_threshold:
        return "DANGER"

    elif water_level >= warning_threshold:
        return "WARNING"

    else:
        return "SAFE"


df["risk_label"] = (
    df["water_level"]
    .apply(create_risk_label)
)

# ------------------------------------------------------------
# 4. CREATE NUMERIC TARGET
# ------------------------------------------------------------

label_mapping = {
    "SAFE": 0,
    "WARNING": 1,
    "DANGER": 2
}

df["risk_target"] = (
    df["risk_label"]
    .map(label_mapping)
)

# ------------------------------------------------------------
# 5. DISPLAY LABEL COUNTS
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("RISK LABEL DISTRIBUTION")
print("=" * 70)

counts = (
    df["risk_label"]
    .value_counts()
)

for label in [
    "SAFE",
    "WARNING",
    "DANGER"
]:

    count = counts.get(
        label,
        0
    )

    percentage = (
        count / len(df)
    ) * 100

    print(
        f"{label:<10} "
        f"{count:>5} records "
        f"({percentage:.2f}%)"
    )

# ------------------------------------------------------------
# 6. SHOW EXAMPLES
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("SAMPLE LABELED RECORDS")
print("=" * 70)

print(
    df[
        [
            "timestamp",
            "water_level",
            "water_level_change_1",
            "water_level_change_3",
            "risk_label",
            "risk_target"
        ]
    ]
    .head(30)
    .to_string(index=False)
)

# ------------------------------------------------------------
# 7. SHOW DANGER RECORDS
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("DANGER RECORDS")
print("=" * 70)

danger = df[
    df["risk_label"] == "DANGER"
]

print(
    danger[
        [
            "timestamp",
            "water_level",
            "water_level_change_1",
            "water_level_change_3",
            "risk_label"
        ]
    ]
    .head(30)
    .to_string(index=False)
)

# ------------------------------------------------------------
# 8. SAVE
# ------------------------------------------------------------

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 70)
print("LABELED DATASET SAVED")
print("=" * 70)

print(
    OUTPUT_FILE
)

print("\n" + "=" * 70)
print("STEP 14 COMPLETED")
print("=" * 70)