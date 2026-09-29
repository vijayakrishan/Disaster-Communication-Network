import pandas as pd
import numpy as np
import os
import time
import sys

# ============================================================
# STEP 44
# TEMPORAL WEATHER FEATURE ENGINEERING
# ============================================================

INPUT_FILE = "data/processed/event_labeled_weather.csv"
OUTPUT_FILE = "data/processed/temporal_weather_training_data.csv"

print("=" * 80)
print("STEP 44 - TEMPORAL WEATHER FEATURE ENGINEERING")
print("=" * 80)

start_time = time.time()

# ============================================================
# 1. CHECK INPUT FILE
# ============================================================

if not os.path.exists(INPUT_FILE):
    print("\nERROR: Input file not found:")
    print(INPUT_FILE)
    sys.exit(1)

print("\n[1/8] Loading event-labeled weather data...")

df = pd.read_csv(INPUT_FILE)

print(f"Rows loaded    : {len(df):,}")
print(f"Columns loaded : {len(df.columns)}")

# ============================================================
# 2. CHECK REQUIRED COLUMNS
# ============================================================

required_columns = [
    "time",
    "city",
    "temperature_2m",
    "relative_humidity_2m",
    "dew_point_2m",
    "precipitation",
    "rain",
    "surface_pressure",
    "cloud_cover",
    "cloud_cover_low",
    "wind_speed_10m",
    "wind_direction_10m",
    "flood_event",
    "event_id"
]

missing_columns = [
    col for col in required_columns
    if col not in df.columns
]

if missing_columns:
    print("\nERROR: Missing required columns:")

    for col in missing_columns:
        print(" -", col)

    sys.exit(1)

print("All required columns are present.")

# ============================================================
# 3. CONVERT TIME
# ============================================================

print("\n[2/8] Parsing timestamps...")

df["time"] = pd.to_datetime(
    df["time"],
    errors="coerce"
)

invalid_time = df["time"].isna().sum()

print(f"Invalid timestamps: {invalid_time:,}")

if invalid_time > 0:
    print("Removing invalid timestamp rows...")
    df = df.dropna(subset=["time"]).copy()

# ============================================================
# 4. SORT BY CITY AND TIME
# ============================================================

print("\n[3/8] Sorting by city and time...")

df = df.sort_values(
    ["city", "time"]
).reset_index(drop=True)

print("Sorting completed.")

# ============================================================
# CREATE CITY GROUP
# ============================================================

grouped = df.groupby(
    "city",
    group_keys=False
)

# ============================================================
# 5. RAINFALL TEMPORAL FEATURES
# ============================================================

print("\n[4/8] Creating rainfall temporal features...")

# ------------------------------------------------------------
# Rain accumulation
# ------------------------------------------------------------

df["rain_3h"] = grouped["rain"].transform(
    lambda x: x.rolling(3, min_periods=1).sum()
)

df["rain_6h"] = grouped["rain"].transform(
    lambda x: x.rolling(6, min_periods=1).sum()
)

df["rain_12h"] = grouped["rain"].transform(
    lambda x: x.rolling(12, min_periods=1).sum()
)

df["rain_24h"] = grouped["rain"].transform(
    lambda x: x.rolling(24, min_periods=1).sum()
)

df["rain_48h"] = grouped["rain"].transform(
    lambda x: x.rolling(48, min_periods=1).sum()
)

# ------------------------------------------------------------
# Precipitation accumulation
# ------------------------------------------------------------

df["precip_3h"] = grouped["precipitation"].transform(
    lambda x: x.rolling(3, min_periods=1).sum()
)

df["precip_6h"] = grouped["precipitation"].transform(
    lambda x: x.rolling(6, min_periods=1).sum()
)

df["precip_12h"] = grouped["precipitation"].transform(
    lambda x: x.rolling(12, min_periods=1).sum()
)

df["precip_24h"] = grouped["precipitation"].transform(
    lambda x: x.rolling(24, min_periods=1).sum()
)

df["precip_48h"] = grouped["precipitation"].transform(
    lambda x: x.rolling(48, min_periods=1).sum()
)

# ------------------------------------------------------------
# Maximum rainfall in recent windows
# ------------------------------------------------------------

df["rain_3h_max"] = grouped["rain"].transform(
    lambda x: x.rolling(3, min_periods=1).max()
)

df["rain_6h_max"] = grouped["rain"].transform(
    lambda x: x.rolling(6, min_periods=1).max()
)

df["rain_12h_max"] = grouped["rain"].transform(
    lambda x: x.rolling(12, min_periods=1).max()
)

df["rain_24h_max"] = grouped["rain"].transform(
    lambda x: x.rolling(24, min_periods=1).max()
)

# ============================================================
# 6. HUMIDITY FEATURES
# ============================================================

print("\n[5/8] Creating humidity features...")

df["humidity_6h_mean"] = grouped[
    "relative_humidity_2m"
].transform(
    lambda x: x.rolling(6, min_periods=1).mean()
)

df["humidity_12h_mean"] = grouped[
    "relative_humidity_2m"
].transform(
    lambda x: x.rolling(12, min_periods=1).mean()
)

df["humidity_24h_mean"] = grouped[
    "relative_humidity_2m"
].transform(
    lambda x: x.rolling(24, min_periods=1).mean()
)

df["humidity_24h_max"] = grouped[
    "relative_humidity_2m"
].transform(
    lambda x: x.rolling(24, min_periods=1).max()
)

# ============================================================
# 7. TEMPERATURE FEATURES
# ============================================================

print("\n[6/8] Creating temperature features...")

df["temperature_6h_mean"] = grouped[
    "temperature_2m"
].transform(
    lambda x: x.rolling(6, min_periods=1).mean()
)

df["temperature_24h_mean"] = grouped[
    "temperature_2m"
].transform(
    lambda x: x.rolling(24, min_periods=1).mean()
)

df["temperature_24h_min"] = grouped[
    "temperature_2m"
].transform(
    lambda x: x.rolling(24, min_periods=1).min()
)

df["temperature_24h_max"] = grouped[
    "temperature_2m"
].transform(
    lambda x: x.rolling(24, min_periods=1).max()
)

# ============================================================
# 8. CLOUD COVER FEATURES
# ============================================================

print("\nCreating cloud-cover features...")

df["cloud_6h_mean"] = grouped[
    "cloud_cover"
].transform(
    lambda x: x.rolling(6, min_periods=1).mean()
)

df["cloud_12h_mean"] = grouped[
    "cloud_cover"
].transform(
    lambda x: x.rolling(12, min_periods=1).mean()
)

df["cloud_24h_mean"] = grouped[
    "cloud_cover"
].transform(
    lambda x: x.rolling(24, min_periods=1).mean()
)

# ============================================================
# 9. PRESSURE CHANGE FEATURES
# ============================================================

print("\nCreating atmospheric pressure-change features...")

df["pressure_change_3h"] = grouped[
    "surface_pressure"
].transform(
    lambda x: x - x.shift(3)
)

df["pressure_change_6h"] = grouped[
    "surface_pressure"
].transform(
    lambda x: x - x.shift(6)
)

df["pressure_change_12h"] = grouped[
    "surface_pressure"
].transform(
    lambda x: x - x.shift(12)
)

df["pressure_change_24h"] = grouped[
    "surface_pressure"
].transform(
    lambda x: x - x.shift(24)
)

# ============================================================
# 10. RAINFALL CHANGE FEATURES
# ============================================================

print("\nCreating rainfall-change features...")

df["rain_change_1h"] = grouped[
    "rain"
].transform(
    lambda x: x - x.shift(1)
)

df["rain_change_3h"] = grouped[
    "rain"
].transform(
    lambda x: x - x.shift(3)
)

df["rain_change_6h"] = grouped[
    "rain"
].transform(
    lambda x: x - x.shift(6)
)

# ============================================================
# 11. RAINFALL RISK INDICATORS
# ============================================================

print("\nCreating rainfall risk indicators...")

df["is_heavy_rain_3h"] = (
    df["rain_3h"] >= 10
).astype(int)

df["is_heavy_rain_6h"] = (
    df["rain_6h"] >= 20
).astype(int)

df["is_heavy_rain_24h"] = (
    df["rain_24h"] >= 50
).astype(int)

df["is_extreme_rain_24h"] = (
    df["rain_24h"] >= 100
).astype(int)

# ============================================================
# 12. RAINFALL ACCELERATION
# ============================================================

df["rain_acceleration"] = (
    df["rain_3h"] -
    (df["rain_6h"] / 2.0)
)

# ============================================================
# 13. HUMIDITY + PRESSURE INTERACTION
# ============================================================

df["humidity_pressure_risk"] = (
    df["humidity_24h_mean"] *
    (-df["pressure_change_6h"])
)

# ============================================================
# 14. CLEAN TEMPORAL FEATURES
# ============================================================

print("\n[7/8] Cleaning temporal features...")

new_features = [
    "rain_3h",
    "rain_6h",
    "rain_12h",
    "rain_24h",
    "rain_48h",

    "precip_3h",
    "precip_6h",
    "precip_12h",
    "precip_24h",
    "precip_48h",

    "rain_3h_max",
    "rain_6h_max",
    "rain_12h_max",
    "rain_24h_max",

    "humidity_6h_mean",
    "humidity_12h_mean",
    "humidity_24h_mean",
    "humidity_24h_max",

    "temperature_6h_mean",
    "temperature_24h_mean",
    "temperature_24h_min",
    "temperature_24h_max",

    "cloud_6h_mean",
    "cloud_12h_mean",
    "cloud_24h_mean",

    "pressure_change_3h",
    "pressure_change_6h",
    "pressure_change_12h",
    "pressure_change_24h",

    "rain_change_1h",
    "rain_change_3h",
    "rain_change_6h",

    "is_heavy_rain_3h",
    "is_heavy_rain_6h",
    "is_heavy_rain_24h",
    "is_extreme_rain_24h",

    "rain_acceleration",
    "humidity_pressure_risk"
]

# Replace infinity
for col in new_features:

    df[col] = df[col].replace(
        [np.inf, -np.inf],
        np.nan
    )

# ------------------------------------------------------------
# Change features are undefined at the beginning of each city.
# Set those initial changes to 0.
# ------------------------------------------------------------

change_features = [
    "pressure_change_3h",
    "pressure_change_6h",
    "pressure_change_12h",
    "pressure_change_24h",
    "rain_change_1h",
    "rain_change_3h",
    "rain_change_6h",
    "rain_acceleration",
    "humidity_pressure_risk"
]

for col in change_features:

    df[col] = df[col].fillna(0)

# Remaining temporal NaN values
# Use median rather than dropping thousands of rows.

for col in new_features:

    if df[col].isna().sum() > 0:

        median_value = df[col].median()

        df[col] = df[col].fillna(median_value)

# ============================================================
# 15. VERIFY
# ============================================================

print("\n[8/8] Verifying dataset...")

print("\nTemporal feature count:")
print(len(new_features))

print("\nNew temporal features:")

for col in new_features:
    print("  ", col)

print("\nRemaining missing values:")

remaining_missing = (
    df[new_features]
    .isna()
    .sum()
    .sum()
)

print(
    f"Total missing temporal values: "
    f"{remaining_missing:,}"
)

print("\nFlood event distribution:")

print(
    df["flood_event"]
    .value_counts()
    .sort_index()
)

print("\nEvent distribution:")

print(
    df["event_id"]
    .value_counts()
    .sort_index()
)

print("\nDataset information:")

print(f"Rows       : {len(df):,}")
print(f"Columns    : {len(df.columns)}")
print(f"Cities     : {df['city'].nunique()}")
print(f"Start time : {df['time'].min()}")
print(f"End time   : {df['time'].max()}")

# ============================================================
# 16. SAVE
# ============================================================

print("\nSaving output...")

os.makedirs(
    os.path.dirname(OUTPUT_FILE),
    exist_ok=True
)

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 80)
print("STEP 44 COMPLETED SUCCESSFULLY")
print("=" * 80)

print("\nOutput:")
print(OUTPUT_FILE)

print(
    f"\nExecution time: "
    f"{time.time() - start_time:.2f} seconds"
)

print("=" * 80)