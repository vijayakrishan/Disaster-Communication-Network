import pandas as pd
import numpy as np
import os

print("=" * 70)
print("RESQMESH - PREPARE TAMIL NADU RIVER DISCHARGE FEATURES")
print("=" * 70)

# ============================================================
# PATHS
# ============================================================

INPUT_FILE = r"data\raw\river_discharge_manual_daily_cwc_tn_2001_2025.csv"

OUTPUT_FILE = r"data\processed\tn_river_discharge_features.csv"

# ============================================================
# LOAD DATA
# ============================================================

print("\nLoading Tamil Nadu river discharge dataset...")

df = pd.read_csv(
    INPUT_FILE,
    low_memory=False
)

print(f"Rows loaded: {len(df):,}")
print(f"Columns: {len(df.columns)}")

# ============================================================
# DISPLAY AVAILABLE COLUMNS
# ============================================================

print("\nAvailable columns:")

for col in df.columns:
    print(" -", col)

# ============================================================
# IMPORTANT COLUMNS
# ============================================================

discharge_col = "Manual Daily River Water Discharge (m3/sec)"
time_col = "Data Acquisition Time"

if discharge_col not in df.columns:
    raise ValueError(
        f"Discharge column not found: {discharge_col}"
    )

if time_col not in df.columns:
    raise ValueError(
        f"Timestamp column not found: {time_col}"
    )

# ============================================================
# TIMESTAMP CONVERSION
# ============================================================

print("\nConverting timestamps...")

# IMPORTANT:
# Dataset uses DD-MM-YYYY HH:MM format.
# dayfirst=True prevents valid dates such as
# 13-06-2017 from being incorrectly rejected.

df[time_col] = pd.to_datetime(
    df[time_col],
    dayfirst=True,
    errors="coerce"
)

# ============================================================
# DISCHARGE CONVERSION
# ============================================================

df[discharge_col] = pd.to_numeric(
    df[discharge_col],
    errors="coerce"
)

# ============================================================
# TIMESTAMP VALIDATION
# ============================================================

invalid_timestamp_count = df[time_col].isna().sum()

print(
    f"Invalid timestamps after DD-MM-YYYY parsing: "
    f"{invalid_timestamp_count:,}"
)

if invalid_timestamp_count > 0:

    print("\nExamples of remaining invalid timestamps:")

    # Reload original values only for displaying invalid examples
    raw_df = pd.read_csv(
        INPUT_FILE,
        low_memory=False,
        usecols=[time_col]
    )

    invalid_mask = df[time_col].isna()

    print(
        raw_df.loc[
            invalid_mask,
            time_col
        ].head(20).to_string(index=False)
    )

# Remove only genuinely invalid timestamps
before_timestamp_filter = len(df)

df = df.dropna(
    subset=[time_col]
).copy()

print(
    f"\nRows removed due to invalid timestamps: "
    f"{before_timestamp_filter - len(df):,}"
)

# ============================================================
# DISCHARGE QUALITY CHECK
# ============================================================

print("\n" + "=" * 70)
print("DISCHARGE QUALITY CHECK")
print("=" * 70)

print(
    f"Missing discharge values: "
    f"{df[discharge_col].isna().sum():,}"
)

print(
    f"Zero discharge values: "
    f"{(df[discharge_col] == 0).sum():,}"
)

print(
    f"Negative discharge values: "
    f"{(df[discharge_col] < 0).sum():,}"
)

# Negative discharge is treated as invalid.
df.loc[
    df[discharge_col] < 0,
    discharge_col
] = np.nan

# ============================================================
# SORT DATA
# ============================================================

print("\nSorting by station and timestamp...")

df = df.sort_values(
    ["Station", time_col]
).reset_index(drop=True)

# ============================================================
# CREATE STATION GROUP
# ============================================================

group = df.groupby(
    "Station",
    group_keys=False
)

# ============================================================
# CURRENT DISCHARGE
# ============================================================

print("\nCreating discharge features...")

df["river_discharge"] = df[discharge_col]

# ============================================================
# LAG FEATURES
# ============================================================

df["discharge_lag_1d"] = group[
    discharge_col
].shift(1)

df["discharge_lag_3d"] = group[
    discharge_col
].shift(3)

df["discharge_lag_7d"] = group[
    discharge_col
].shift(7)

# ============================================================
# CHANGE FEATURES
# ============================================================

df["discharge_change_1d"] = (
    df["river_discharge"]
    - df["discharge_lag_1d"]
)

df["discharge_change_3d"] = (
    df["river_discharge"]
    - df["discharge_lag_3d"]
)

df["discharge_change_7d"] = (
    df["river_discharge"]
    - df["discharge_lag_7d"]
)

# ============================================================
# PERCENTAGE CHANGE
# ============================================================

df["discharge_pct_change_1d"] = (
    group[discharge_col]
    .pct_change()
)

# Infinite values can occur when previous discharge is zero.
df["discharge_pct_change_1d"] = (
    df["discharge_pct_change_1d"]
    .replace([np.inf, -np.inf], np.nan)
)

# ============================================================
# ROLLING FEATURES
# ============================================================

print("Creating rolling discharge features...")

# 3-day mean
df["discharge_3d_mean"] = group[
    discharge_col
].transform(
    lambda x: x.rolling(
        window=3,
        min_periods=1
    ).mean()
)

# 7-day mean
df["discharge_7d_mean"] = group[
    discharge_col
].transform(
    lambda x: x.rolling(
        window=7,
        min_periods=1
    ).mean()
)

# 7-day maximum
df["discharge_7d_max"] = group[
    discharge_col
].transform(
    lambda x: x.rolling(
        window=7,
        min_periods=1
    ).max()
)

# 7-day minimum
df["discharge_7d_min"] = group[
    discharge_col
].transform(
    lambda x: x.rolling(
        window=7,
        min_periods=1
    ).min()
)

# 30-day mean
df["discharge_30d_mean"] = group[
    discharge_col
].transform(
    lambda x: x.rolling(
        window=30,
        min_periods=1
    ).mean()
)

# ============================================================
# TIME FEATURES
# ============================================================

print("Creating time features...")

df["year"] = df[time_col].dt.year

df["month"] = df[time_col].dt.month

df["day"] = df[time_col].dt.day

df["day_of_year"] = df[
    time_col
].dt.dayofyear

# ============================================================
# LOCATION INFORMATION
# ============================================================

location_columns = [
    "Station",
    "District",
    "River",
    "Basin",
    "Latitude",
    "Longitude"
]

# ============================================================
# OUTPUT FEATURES
# ============================================================

feature_columns = [
    "Station",
    "District",
    "River",
    "Basin",
    "Latitude",
    "Longitude",

    "Data Acquisition Time",

    "river_discharge",

    "discharge_lag_1d",
    "discharge_lag_3d",
    "discharge_lag_7d",

    "discharge_change_1d",
    "discharge_change_3d",
    "discharge_change_7d",

    "discharge_pct_change_1d",

    "discharge_3d_mean",
    "discharge_7d_mean",
    "discharge_7d_max",
    "discharge_7d_min",
    "discharge_30d_mean",

    "year",
    "month",
    "day",
    "day_of_year"
]

# Keep only columns that exist
feature_columns = [
    col
    for col in feature_columns
    if col in df.columns
]

output = df[
    feature_columns
].copy()

# ============================================================
# CLEAN INFINITE VALUES
# ============================================================

output = output.replace(
    [np.inf, -np.inf],
    np.nan
)

# ============================================================
# FINAL SORT
# ============================================================

output = output.sort_values(
    ["Station", "Data Acquisition Time"]
).reset_index(drop=True)

# ============================================================
# SAVE OUTPUT
# ============================================================

os.makedirs(
    os.path.dirname(OUTPUT_FILE),
    exist_ok=True
)

output.to_csv(
    OUTPUT_FILE,
    index=False
)

# ============================================================
# SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("DISCHARGE FEATURE SUMMARY")
print("=" * 70)

print(
    f"Original rows: "
    f"{len(pd.read_csv(INPUT_FILE, usecols=['Station'])):,}"
)

print(
    f"Final rows: "
    f"{len(output):,}"
)

print(
    f"Stations: "
    f"{output['Station'].nunique():,}"
)

print(
    f"Districts: "
    f"{output['District'].nunique():,}"
)

print(
    f"Date range: "
    f"{output['Data Acquisition Time'].min()} "
    f"to "
    f"{output['Data Acquisition Time'].max()}"
)

print("\nMissing values in important features:")

important_features = [
    "river_discharge",
    "discharge_change_1d",
    "discharge_change_3d",
    "discharge_change_7d",
    "discharge_3d_mean",
    "discharge_7d_mean",
    "discharge_7d_max",
    "discharge_30d_mean"
]

for col in important_features:

    if col in output.columns:

        print(
            f" - {col}: "
            f"{output[col].isna().sum():,}"
        )

print("\nFeature columns created:")

for col in output.columns:
    print(" -", col)

print("\nSample:")

sample_columns = [
    "Station",
    "Data Acquisition Time",
    "river_discharge",
    "discharge_change_1d",
    "discharge_change_3d",
    "discharge_7d_mean",
    "discharge_7d_max"
]

print(
    output[
        sample_columns
    ].head(10).to_string(index=False)
)

# ============================================================
# SAVE MESSAGE
# ============================================================

print("\n" + "=" * 70)
print("FILE SAVED")
print("=" * 70)

print(
    OUTPUT_FILE
)

print("\n" + "=" * 70)
print("STEP 30 COMPLETE")
print("=" * 70)