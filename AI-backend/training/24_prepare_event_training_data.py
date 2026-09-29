import pandas as pd
import numpy as np
from pathlib import Path

print("=" * 70)
print("RESQMESH - PREPARE EVENT TRAINING DATA")
print("=" * 70)

# ---------------------------------------------------------
# PATHS
# ---------------------------------------------------------
INPUT = Path("data/processed/event_labeled_weather.csv")
OUTPUT = Path("data/processed/event_training_dataset.csv")

# ---------------------------------------------------------
# LOAD DATA
# ---------------------------------------------------------
print("\nLoading dataset...")

df = pd.read_csv(INPUT, parse_dates=["time"])

print(f"Original rows: {len(df):,}")
print(f"Original columns: {len(df.columns)}")

# Sort correctly for time-based feature creation
df = df.sort_values(["city", "time"]).reset_index(drop=True)

# ---------------------------------------------------------
# BASIC WEATHER FEATURES
# ---------------------------------------------------------
print("\nCreating weather features...")

# Rainfall accumulation over recent periods
df["rain_3h"] = (
    df.groupby("city")["rain"]
    .transform(lambda x: x.rolling(3, min_periods=1).sum())
)

df["rain_6h"] = (
    df.groupby("city")["rain"]
    .transform(lambda x: x.rolling(6, min_periods=1).sum())
)

df["rain_12h"] = (
    df.groupby("city")["rain"]
    .transform(lambda x: x.rolling(12, min_periods=1).sum())
)

df["rain_24h"] = (
    df.groupby("city")["rain"]
    .transform(lambda x: x.rolling(24, min_periods=1).sum())
)

# Rainfall change
df["rain_change_1h"] = (
    df.groupby("city")["rain"]
    .diff()
)

# Temperature change
df["temperature_change_1h"] = (
    df.groupby("city")["temperature_2m"]
    .diff()
)

# Pressure change
df["pressure_change_1h"] = (
    df.groupby("city")["surface_pressure"]
    .diff()
)

# ---------------------------------------------------------
# TIME FEATURES
# ---------------------------------------------------------
print("Creating time features...")

df["hour"] = df["time"].dt.hour
df["month"] = df["time"].dt.month
df["day_of_year"] = df["time"].dt.dayofyear

# Cyclic hour
df["hour_sin"] = np.sin(2 * np.pi * df["hour"] / 24)
df["hour_cos"] = np.cos(2 * np.pi * df["hour"] / 24)

# Cyclic month
df["month_sin"] = np.sin(2 * np.pi * df["month"] / 12)
df["month_cos"] = np.cos(2 * np.pi * df["month"] / 12)

# ---------------------------------------------------------
# SELECT FEATURES
# ---------------------------------------------------------
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

target = "flood_event"

# ---------------------------------------------------------
# KEEP REQUIRED COLUMNS
# ---------------------------------------------------------
required_columns = (
    ["time", "city", "event_id", target] + features
)

df = df[required_columns].copy()

# ---------------------------------------------------------
# HANDLE MISSING VALUES
# ---------------------------------------------------------
print("\nChecking missing values...")

missing_before = df[features].isna().sum().sum()

print(f"Missing feature values before handling: {missing_before:,}")

# Replace infinite values
df[features] = df[features].replace(
    [np.inf, -np.inf],
    np.nan
)

# Drop rows where required model features are unavailable
df = df.dropna(subset=features + [target])

missing_after = df[features].isna().sum().sum()

print(f"Missing feature values after handling: {missing_after:,}")

# ---------------------------------------------------------
# REMOVE VERY EARLY ROWS
# ---------------------------------------------------------
# The first rows of each city do not have a full historical
# window for rainfall features.
#
# We keep them because min_periods=1 was used.
# Therefore no rows are removed here.
# ---------------------------------------------------------

# ---------------------------------------------------------
# FINAL SORT
# ---------------------------------------------------------
df = df.sort_values("time").reset_index(drop=True)

# ---------------------------------------------------------
# CHECK LABEL DISTRIBUTION
# ---------------------------------------------------------
print("\n" + "=" * 70)
print("FINAL LABEL DISTRIBUTION")
print("=" * 70)

print(df[target].value_counts())

positive = int((df[target] == 1).sum())
negative = int((df[target] == 0).sum())

print(f"\nPositive flood samples : {positive:,}")
print(f"Negative samples       : {negative:,}")

if len(df) > 0:
    print(
        f"Flood percentage      : "
        f"{positive / len(df) * 100:.2f}%"
    )

# ---------------------------------------------------------
# TIME RANGE
# ---------------------------------------------------------
print("\n" + "=" * 70)
print("TIME RANGE")
print("=" * 70)

print(f"Start: {df['time'].min()}")
print(f"End  : {df['time'].max()}")

# ---------------------------------------------------------
# EVENT DISTRIBUTION
# ---------------------------------------------------------
print("\n" + "=" * 70)
print("EVENT DISTRIBUTION")
print("=" * 70)

print(df["event_id"].value_counts().sort_index())

# ---------------------------------------------------------
# CHRONOLOGICAL TRAIN / TEST SPLIT
# ---------------------------------------------------------
print("\n" + "=" * 70)
print("CHRONOLOGICAL TRAIN / TEST SPLIT")
print("=" * 70)

# Use the final portion of the timeline as unseen test data.
# 80% of the timeline for training, 20% for testing.

split_time = df["time"].quantile(0.80)

train_df = df[df["time"] <= split_time].copy()
test_df = df[df["time"] > split_time].copy()

print(f"Split time: {split_time}")

print(f"\nTraining rows: {len(train_df):,}")
print(f"Testing rows : {len(test_df):,}")

# ---------------------------------------------------------
# TRAIN LABEL DISTRIBUTION
# ---------------------------------------------------------
print("\nTraining labels:")
print(train_df[target].value_counts())

train_positive = int((train_df[target] == 1).sum())
train_negative = int((train_df[target] == 0).sum())

print(
    f"Training positive: {train_positive:,} "
    f"({train_positive / len(train_df) * 100:.2f}%)"
)

# ---------------------------------------------------------
# TEST LABEL DISTRIBUTION
# ---------------------------------------------------------
print("\nTesting labels:")
print(test_df[target].value_counts())

test_positive = int((test_df[target] == 1).sum())
test_negative = int((test_df[target] == 0).sum())

if len(test_df) > 0:
    print(
        f"Testing positive: {test_positive:,} "
        f"({test_positive / len(test_df) * 100:.2f}%)"
    )

# ---------------------------------------------------------
# IMPORTANT EVENT CHECK
# ---------------------------------------------------------
print("\n" + "=" * 70)
print("EVENTS IN TRAIN / TEST")
print("=" * 70)

print("\nTraining events:")
print(train_df["event_id"].value_counts().sort_index())

print("\nTesting events:")
print(test_df["event_id"].value_counts().sort_index())

# ---------------------------------------------------------
# SAVE TRAIN / TEST DATA
# ---------------------------------------------------------
TRAIN_OUTPUT = Path(
    "data/processed/event_train_dataset.csv"
)

TEST_OUTPUT = Path(
    "data/processed/event_test_dataset.csv"
)

train_df.to_csv(TRAIN_OUTPUT, index=False)
test_df.to_csv(TEST_OUTPUT, index=False)

# Also save the complete engineered dataset
df.to_csv(OUTPUT, index=False)

# ---------------------------------------------------------
# FINAL INFORMATION
# ---------------------------------------------------------
print("\n" + "=" * 70)
print("FILES SAVED")
print("=" * 70)

print(f"Complete dataset:")
print(f"  {OUTPUT.resolve()}")

print(f"\nTraining dataset:")
print(f"  {TRAIN_OUTPUT.resolve()}")

print(f"\nTesting dataset:")
print(f"  {TEST_OUTPUT.resolve()}")

print("\n" + "=" * 70)
print("STEP 24 COMPLETE")
print("=" * 70)