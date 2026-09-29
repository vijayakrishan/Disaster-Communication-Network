import pandas as pd
import numpy as np
import os

print("=" * 70)
print("RESQMESH - TEMPORAL WEATHER FEATURE ENGINEERING")
print("=" * 70)

INPUT_FILE = "data/processed/final_ai_training_data.csv"

OUTPUT_FILE = (
    "data/processed/"
    "weather_temporal_training_data.csv"
)

# ================================================================
# 1. LOAD DATA
# ================================================================

print("\nLoading final AI dataset...")

df = pd.read_csv(
    INPUT_FILE,
    low_memory=False
)

print(
    f"Rows loaded: {len(df):,}"
)

print(
    f"Columns loaded: {len(df.columns)}"
)

# ================================================================
# 2. CHECK REQUIRED COLUMNS
# ================================================================

REQUIRED = [
    "city_normalized",
    "time",
    "precipitation",
    "rain",
    "relative_humidity_2m",
    "cloud_cover",
    "temperature_2m",
    "flood_event"
]

missing = [
    column
    for column in REQUIRED
    if column not in df.columns
]

if missing:

    print("\nERROR: Missing required columns:")

    for column in missing:
        print(
            f"  - {column}"
        )

    raise SystemExit(1)

# ================================================================
# 3. PARSE TIME
# ================================================================

print("\nParsing timestamps...")

df["time"] = pd.to_datetime(
    df["time"],
    errors="coerce"
)

invalid_time = (
    df["time"].isna()
).sum()

print(
    f"Invalid timestamps: "
    f"{invalid_time:,}"
)

if invalid_time > 0:

    print(
        "\nRemoving rows with invalid timestamps..."
    )

    df = df[
        df["time"].notna()
    ].copy()

# ================================================================
# 4. SORT BY LOCATION + TIME
# ================================================================

print(
    "\nSorting by city and timestamp..."
)

df = df.sort_values(
    [
        "city_normalized",
        "time"
    ]
).reset_index(
    drop=True
)

# ================================================================
# 5. CONVERT NUMERIC COLUMNS
# ================================================================

NUMERIC_COLUMNS = [
    "precipitation",
    "rain",
    "relative_humidity_2m",
    "cloud_cover",
    "temperature_2m"
]

for column in NUMERIC_COLUMNS:

    df[column] = pd.to_numeric(
        df[column],
        errors="coerce"
    )

# ================================================================
# 6. CREATE TEMPORAL FEATURES
# ================================================================

print(
    "\nCreating rolling weather features..."
)

grouped = df.groupby(
    "city_normalized",
    group_keys=False
)

# ------------------------------------------------
# Rainfall / precipitation accumulation
# ------------------------------------------------

df["rain_3h_sum"] = (
    grouped["rain"]
    .rolling(
        window=3,
        min_periods=1
    )
    .sum()
    .reset_index(
        level=0,
        drop=True
    )
)

df["rain_6h_sum"] = (
    grouped["rain"]
    .rolling(
        window=6,
        min_periods=1
    )
    .sum()
    .reset_index(
        level=0,
        drop=True
    )
)

df["rain_12h_sum"] = (
    grouped["rain"]
    .rolling(
        window=12,
        min_periods=1
    )
    .sum()
    .reset_index(
        level=0,
        drop=True
    )
)

df["rain_24h_sum"] = (
    grouped["rain"]
    .rolling(
        window=24,
        min_periods=1
    )
    .sum()
    .reset_index(
        level=0,
        drop=True
    )
)

df["rain_48h_sum"] = (
    grouped["rain"]
    .rolling(
        window=48,
        min_periods=1
    )
    .sum()
    .reset_index(
        level=0,
        drop=True
    )
)

# ------------------------------------------------
# Maximum rainfall
# ------------------------------------------------

df["rain_3h_max"] = (
    grouped["rain"]
    .rolling(
        window=3,
        min_periods=1
    )
    .max()
    .reset_index(
        level=0,
        drop=True
    )
)

df["rain_6h_max"] = (
    grouped["rain"]
    .rolling(
        window=6,
        min_periods=1
    )
    .max()
    .reset_index(
        level=0,
        drop=True
    )
)

df["rain_12h_max"] = (
    grouped["rain"]
    .rolling(
        window=12,
        min_periods=1
    )
    .max()
    .reset_index(
        level=0,
        drop=True
    )
)

df["rain_24h_max"] = (
    grouped["rain"]
    .rolling(
        window=24,
        min_periods=1
    )
    .max()
    .reset_index(
        level=0,
        drop=True
    )
)

# ------------------------------------------------
# Precipitation accumulation
# ------------------------------------------------

df["precipitation_3h_sum"] = (
    grouped["precipitation"]
    .rolling(
        window=3,
        min_periods=1
    )
    .sum()
    .reset_index(
        level=0,
        drop=True
    )
)

df["precipitation_6h_sum"] = (
    grouped["precipitation"]
    .rolling(
        window=6,
        min_periods=1
    )
    .sum()
    .reset_index(
        level=0,
        drop=True
    )
)

df["precipitation_12h_sum"] = (
    grouped["precipitation"]
    .rolling(
        window=12,
        min_periods=1
    )
    .sum()
    .reset_index(
        level=0,
        drop=True
    )
)

df["precipitation_24h_sum"] = (
    grouped["precipitation"]
    .rolling(
        window=24,
        min_periods=1
    )
    .sum()
    .reset_index(
        level=0,
        drop=True
    )
)

# ------------------------------------------------
# Humidity rolling means
# ------------------------------------------------

df["humidity_3h_mean"] = (
    grouped["relative_humidity_2m"]
    .rolling(
        window=3,
        min_periods=1
    )
    .mean()
    .reset_index(
        level=0,
        drop=True
    )
)

df["humidity_6h_mean"] = (
    grouped["relative_humidity_2m"]
    .rolling(
        window=6,
        min_periods=1
    )
    .mean()
    .reset_index(
        level=0,
        drop=True
    )
)

df["humidity_24h_mean"] = (
    grouped["relative_humidity_2m"]
    .rolling(
        window=24,
        min_periods=1
    )
    .mean()
    .reset_index(
        level=0,
        drop=True
    )
)

# ------------------------------------------------
# Cloud-cover rolling means
# ------------------------------------------------

df["cloud_3h_mean"] = (
    grouped["cloud_cover"]
    .rolling(
        window=3,
        min_periods=1
    )
    .mean()
    .reset_index(
        level=0,
        drop=True
    )
)

df["cloud_6h_mean"] = (
    grouped["cloud_cover"]
    .rolling(
        window=6,
        min_periods=1
    )
    .mean()
    .reset_index(
        level=0,
        drop=True
    )
)

df["cloud_24h_mean"] = (
    grouped["cloud_cover"]
    .rolling(
        window=24,
        min_periods=1
    )
    .mean()
    .reset_index(
        level=0,
        drop=True
    )
)

# ------------------------------------------------
# Temperature rolling means
# ------------------------------------------------

df["temperature_3h_mean"] = (
    grouped["temperature_2m"]
    .rolling(
        window=3,
        min_periods=1
    )
    .mean()
    .reset_index(
        level=0,
        drop=True
    )
)

df["temperature_24h_mean"] = (
    grouped["temperature_2m"]
    .rolling(
        window=24,
        min_periods=1
    )
    .mean()
    .reset_index(
        level=0,
        drop=True
    )
)

# ================================================================
# 7. CREATE RAINFALL INTENSITY FEATURES
# ================================================================

print(
    "\nCreating rainfall intensity features..."
)

df["rain_intensity_3h"] = (
    df["rain_3h_sum"] / 3.0
)

df["rain_intensity_6h"] = (
    df["rain_6h_sum"] / 6.0
)

df["rain_intensity_12h"] = (
    df["rain_12h_sum"] / 12.0
)

df["rain_intensity_24h"] = (
    df["rain_24h_sum"] / 24.0
)

# ================================================================
# 8. CREATE RAIN TREND
# ================================================================

print(
    "\nCreating rainfall trend features..."
)

df["rain_change_3h"] = (
    df["rain"]
    -
    df.groupby(
        "city_normalized"
    )["rain"]
    .shift(3)
)

df["rain_change_6h"] = (
    df["rain"]
    -
    df.groupby(
        "city_normalized"
    )["rain"]
    .shift(6)
)

df["rain_change_24h"] = (
    df["rain"]
    -
    df.groupby(
        "city_normalized"
    )["rain"]
    .shift(24)
)

# ================================================================
# 9. RAIN EVENT INDICATORS
# ================================================================

df["rain_24h_positive"] = (
    df["rain_24h_sum"] > 0
).astype(int)

df["rain_48h_positive"] = (
    df["rain_48h_sum"] > 0
).astype(int)

# ================================================================
# 10. CHECK DATA
# ================================================================

print("\n" + "=" * 70)
print("TEMPORAL FEATURE SUMMARY")
print("=" * 70)

TEMPORAL_FEATURES = [

    "rain_3h_sum",
    "rain_6h_sum",
    "rain_12h_sum",
    "rain_24h_sum",
    "rain_48h_sum",

    "rain_3h_max",
    "rain_6h_max",
    "rain_12h_max",
    "rain_24h_max",

    "precipitation_3h_sum",
    "precipitation_6h_sum",
    "precipitation_12h_sum",
    "precipitation_24h_sum",

    "humidity_3h_mean",
    "humidity_6h_mean",
    "humidity_24h_mean",

    "cloud_3h_mean",
    "cloud_6h_mean",
    "cloud_24h_mean",

    "temperature_3h_mean",
    "temperature_24h_mean",

    "rain_intensity_3h",
    "rain_intensity_6h",
    "rain_intensity_12h",
    "rain_intensity_24h",

    "rain_change_3h",
    "rain_change_6h",
    "rain_change_24h",

    "rain_24h_positive",
    "rain_48h_positive"
]

print(
    f"New temporal features: "
    f"{len(TEMPORAL_FEATURES)}"
)

print(
    f"Total columns now: "
    f"{len(df.columns)}"
)

print("\nNew features:")

for feature in TEMPORAL_FEATURES:
    print(
        f"  - {feature}"
    )

# ================================================================
# 11. CHECK MISSING VALUES
# ================================================================

print("\nMissing values in new features:")

missing = (
    df[TEMPORAL_FEATURES]
    .isna()
    .sum()
)

print(
    missing[
        missing > 0
    ].to_string()
)

# ================================================================
# 12. CHECK FLOOD VS NORMAL
# ================================================================

print("\n" + "=" * 70)
print("RAINFALL COMPARISON")
print("=" * 70)

normal = df[
    df["flood_event"] == 0
]

flood = df[
    df["flood_event"] == 1
]

comparison = []

for feature in [
    "rain_3h_sum",
    "rain_6h_sum",
    "rain_12h_sum",
    "rain_24h_sum",
    "rain_48h_sum",
    "rain_24h_max",
    "precipitation_24h_sum",
    "humidity_24h_mean",
    "cloud_24h_mean"
]:

    comparison.append({

        "feature": feature,

        "normal_mean":
            normal[feature].mean(),

        "flood_mean":
            flood[feature].mean(),

        "normal_median":
            normal[feature].median(),

        "flood_median":
            flood[feature].median()
    })

comparison_df = pd.DataFrame(
    comparison
)

print(
    comparison_df.to_string(
        index=False
    )
)

# ================================================================
# 13. SAVE
# ================================================================

print("\n" + "=" * 70)
print("SAVING TEMPORAL DATASET")
print("=" * 70)

df.to_csv(
    OUTPUT_FILE,
    index=False
)

print(
    f"\nSaved:"
)

print(
    OUTPUT_FILE
)

print(
    f"\nRows saved: "
    f"{len(df):,}"
)

print(
    f"Columns saved: "
    f"{len(df.columns)}"
)

print("\n" + "=" * 70)
print("STEP 44 COMPLETE")
print("=" * 70)