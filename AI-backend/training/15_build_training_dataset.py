import pandas as pd
import numpy as np
from pathlib import Path
import pandas as pd
import numpy as np
from pathlib import Path

# ============================================================
# STEP 15: BUILD FINAL PROTOTYPE TRAINING DATASET
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

WATER_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "water_level_labeled.csv"
)

TEMP_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "temperature_clean.csv"
)

PRESSURE_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "pressure_clean.csv"
)

RAIN_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "rainfall_parthibanur_features.csv"
)

OUTPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "prototype_training_dataset.csv"
)

print("=" * 70)
print("STEP 15: BUILD PROTOTYPE TRAINING DATASET")
print("=" * 70)

# ============================================================
# 1. LOAD WATER DATA
# ============================================================

print("\nLoading water-level data...")

water = pd.read_csv(WATER_FILE)

water["timestamp"] = pd.to_datetime(
    water["timestamp"],
    errors="coerce"
)

water = (
    water
    .dropna(
        subset=[
            "timestamp",
            "water_level",
            "risk_target"
        ]
    )
    .sort_values("timestamp")
    .reset_index(drop=True)
)

print("Water records:", len(water))

# ============================================================
# 2. LOAD TEMPERATURE
# ============================================================

print("\nLoading temperature data...")

temp = pd.read_csv(TEMP_FILE)

temp["timestamp"] = pd.to_datetime(
    temp["timestamp"],
    errors="coerce"
)

# Keep only Parthibanur
temp = temp[
    temp["Station"].astype(str).str.strip()
    == "Parthibanur Regulator"
].copy()

temp = temp[
    [
        "timestamp",
        "temperature"
    ]
].dropna(
    subset=["timestamp"]
).sort_values("timestamp")

print(
    "Parthibanur temperature records:",
    len(temp)
)

# ============================================================
# 3. LOAD PRESSURE
# ============================================================

print("\nLoading pressure data...")

pressure = pd.read_csv(PRESSURE_FILE)

pressure["timestamp"] = pd.to_datetime(
    pressure["timestamp"],
    errors="coerce"
)

# Keep only Parthibanur
pressure = pressure[
    pressure["Station"].astype(str).str.strip()
    == "Parthibanur Regulator"
].copy()

pressure = pressure[
    [
        "timestamp",
        "pressure"
    ]
].dropna(
    subset=["timestamp"]
).sort_values("timestamp")

print(
    "Parthibanur pressure records:",
    len(pressure)
)

# ============================================================
# 4. LOAD RAINFALL
# ============================================================

print("\nLoading rainfall data...")

rain = pd.read_csv(RAIN_FILE)

rain["timestamp"] = pd.to_datetime(
    rain["timestamp"],
    errors="coerce"
)

rain = (
    rain
    .dropna(
        subset=["timestamp"]
    )
    .sort_values("timestamp")
)

print(
    "Parthibanur rainfall records:",
    len(rain)
)

# ============================================================
# 5. MERGE TEMPERATURE
# ============================================================

print("\nMerging temperature...")

water = pd.merge_asof(
    water.sort_values("timestamp"),
    temp,
    on="timestamp",
    direction="nearest",
    tolerance=pd.Timedelta("1 hour")
)

# ============================================================
# 6. MERGE PRESSURE
# ============================================================

print("Merging pressure...")

water = pd.merge_asof(
    water.sort_values("timestamp"),
    pressure,
    on="timestamp",
    direction="nearest",
    tolerance=pd.Timedelta("1 hour")
)

# ============================================================
# 7. MERGE RAINFALL
# ============================================================

print("Merging rainfall...")

water = pd.merge_asof(
    water.sort_values("timestamp"),
    rain[
        [
            "timestamp",
            "rainfall",
            "rainfall_1h",
            "rainfall_6h",
            "rainfall_24h",
            "rainfall_72h"
        ]
    ],
    on="timestamp",
    direction="nearest",
    tolerance=pd.Timedelta("1 hour")
)

# ============================================================
# 8. CREATE TIME FEATURES
# ============================================================

water["hour"] = (
    water["timestamp"].dt.hour
)

water["month"] = (
    water["timestamp"].dt.month
)

water["day_of_year"] = (
    water["timestamp"].dt.dayofyear
)

# Cyclic hour features
water["hour_sin"] = np.sin(
    2 * np.pi * water["hour"] / 24
)

water["hour_cos"] = np.cos(
    2 * np.pi * water["hour"] / 24
)

# Cyclic month features
water["month_sin"] = np.sin(
    2 * np.pi * water["month"] / 12
)

water["month_cos"] = np.cos(
    2 * np.pi * water["month"] / 12
)

# ============================================================
# 9. FEATURE AVAILABILITY
# ============================================================

print("\n" + "=" * 70)
print("FEATURE AVAILABILITY")
print("=" * 70)

feature_columns = [
    "water_level",
    "water_level_change_1",
    "water_level_change_3",
    "temperature",
    "pressure",
    "rainfall",
    "rainfall_1h",
    "rainfall_6h",
    "rainfall_24h",
    "rainfall_72h"
]

for column in feature_columns:

    if column in water.columns:

        available = (
            water[column]
            .notna()
            .sum()
        )

        percentage = (
            available / len(water)
        ) * 100

        print(
            f"{column:<25}"
            f"{available:>6} / {len(water)} "
            f"({percentage:.2f}%)"
        )

# ============================================================
# 10. FINAL FEATURE COLUMNS
# ============================================================

final_features = [
    "timestamp",
    "water_level",
    "water_level_change_1",
    "water_level_change_3",
    "temperature",
    "pressure",
    "rainfall",
    "rainfall_1h",
    "rainfall_6h",
    "rainfall_24h",
    "rainfall_72h",
    "hour",
    "month",
    "day_of_year",
    "hour_sin",
    "hour_cos",
    "month_sin",
    "month_cos",
    "risk_label",
    "risk_target"
]

# Keep only columns that actually exist
final_features = [
    column
    for column in final_features
    if column in water.columns
]

training = water[
    final_features
].copy()

# ============================================================
# 11. DATASET SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("FINAL TRAINING DATASET")
print("=" * 70)

print(
    "Rows:",
    len(training)
)

print(
    "Columns:",
    len(training.columns)
)

print(
    "\nColumns:"
)

for column in training.columns:
    print(
        " -",
        column
    )

# ============================================================
# 12. TARGET DISTRIBUTION
# ============================================================

print("\n" + "=" * 70)
print("TARGET DISTRIBUTION")
print("=" * 70)

print(
    training["risk_label"]
    .value_counts()
    .to_string()
)

# ============================================================
# 13. SAVE
# ============================================================

training.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 70)
print("TRAINING DATASET SAVED")
print("=" * 70)

print(
    OUTPUT_FILE
)

print("\n" + "=" * 70)
print("STEP 15 COMPLETED")
print("=" * 70)