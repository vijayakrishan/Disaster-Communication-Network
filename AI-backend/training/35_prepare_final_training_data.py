import pandas as pd
import numpy as np
import os

print("=" * 70)
print("RESQMESH - PREPARE FINAL AI TRAINING DATA")
print("=" * 70)

INPUT_FILE = "data/processed/event_weather_discharge.csv"
OUTPUT_FILE = "data/processed/final_ai_training_data.csv"

# ================================================================
# 1. LOAD DATA
# ================================================================

if not os.path.exists(INPUT_FILE):
    print("\nERROR: Input file not found:")
    print(INPUT_FILE)
    raise SystemExit(1)

print("\nLoading event + weather + discharge dataset...")

df = pd.read_csv(
    INPUT_FILE,
    low_memory=False
)

print(f"Rows loaded: {len(df):,}")
print(f"Columns loaded: {len(df.columns)}")

# ================================================================
# 2. CHECK REQUIRED LABEL
# ================================================================

print("\n" + "=" * 70)
print("CHECKING TARGET LABEL")
print("=" * 70)

if "flood_event" not in df.columns:
    print("\nERROR: flood_event column not found.")
    raise SystemExit(1)

print("\nFlood-event distribution:")

print(
    df["flood_event"]
    .value_counts(dropna=False)
    .sort_index()
)

# ================================================================
# 3. CONVERT NUMERIC WEATHER FEATURES
# ================================================================

print("\n" + "=" * 70)
print("PREPARING WEATHER FEATURES")
print("=" * 70)

numeric_candidates = [
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
    "river_discharge",
    "discharge_change_1d",
    "discharge_change_3d",
    "discharge_change_7d",
    "discharge_3d_mean",
    "discharge_7d_mean",
    "discharge_7d_max",
    "discharge_7d_min",
    "discharge_30d_mean",
    "station_distance_km"
]

available_numeric = []

for column in numeric_candidates:

    if column in df.columns:

        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

        available_numeric.append(column)

print("\nAvailable numeric features:")

for column in available_numeric:
    print(f"  {column}")

# ================================================================
# 4. TIME FEATURES
# ================================================================

print("\n" + "=" * 70)
print("CREATING TIME FEATURES")
print("=" * 70)

date_column = None

for candidate in [
    "date",
    "time",
    "weather_date"
]:

    if candidate in df.columns:
        date_column = candidate
        break

if date_column is None:

    print("\nERROR: No date/time column found.")

    print("\nAvailable columns:")
    print(df.columns.tolist())

    raise SystemExit(1)

print(
    f"\nUsing date column: {date_column}"
)

df[date_column] = pd.to_datetime(
    df[date_column],
    errors="coerce"
)

invalid_dates = df[date_column].isna().sum()

print(
    f"Invalid dates: {invalid_dates:,}"
)

# Remove rows without valid date
df = df[
    df[date_column].notna()
].copy()

df["year"] = df[date_column].dt.year
df["month"] = df[date_column].dt.month
df["day"] = df[date_column].dt.day
df["day_of_year"] = df[date_column].dt.dayofyear

# Cyclic seasonal representation
df["month_sin"] = np.sin(
    2 * np.pi * df["month"] / 12
)

df["month_cos"] = np.cos(
    2 * np.pi * df["month"] / 12
)

df["day_of_year_sin"] = np.sin(
    2 * np.pi * df["day_of_year"] / 365.25
)

df["day_of_year_cos"] = np.cos(
    2 * np.pi * df["day_of_year"] / 365.25
)

print("\nTime features created:")
print(
    "year, month, day, day_of_year, "
    "month_sin, month_cos, "
    "day_of_year_sin, day_of_year_cos"
)

# ================================================================
# 5. ADD WEATHER DERIVED FEATURES
# ================================================================

print("\n" + "=" * 70)
print("CREATING WEATHER-DERIVED FEATURES")
print("=" * 70)

# Rainfall indicators
if "rain" in df.columns:

    df["rain_binary"] = (
        df["rain"] > 0
    ).astype(int)

# Humidity-temperature interaction
if (
    "relative_humidity_2m" in df.columns
    and "temperature_2m" in df.columns
):

    df["temperature_humidity_index"] = (
        df["temperature_2m"]
        *
        df["relative_humidity_2m"]
        / 100.0
    )

# Wind vector components
if "wind_speed_10m" in df.columns and \
   "wind_direction_10m" in df.columns:

    wind_direction_rad = (
        np.deg2rad(
            df["wind_direction_10m"]
        )
    )

    df["wind_u"] = (
        df["wind_speed_10m"]
        *
        np.cos(wind_direction_rad)
    )

    df["wind_v"] = (
        df["wind_speed_10m"]
        *
        np.sin(wind_direction_rad)
    )

# ================================================================
# 6. RIVER DISCHARGE MISSINGNESS INDICATOR
# ================================================================

print("\n" + "=" * 70)
print("HANDLING MISSING RIVER DISCHARGE")
print("=" * 70)

if "river_discharge" in df.columns:

    df["river_discharge_available"] = (
        df["river_discharge"]
        .notna()
        .astype(int)
    )

    available_count = (
        df["river_discharge_available"]
        .sum()
    )

    unavailable_count = (
        len(df) - available_count
    )

    print(
        f"\nDischarge available:   "
        f"{available_count:,}"
    )

    print(
        f"Discharge unavailable: "
        f"{unavailable_count:,}"
    )

    print(
        "\nMissing discharge values "
        "will NOT be converted to zero."
    )

else:

    print(
        "\nWARNING: river_discharge column "
        "not found."
    )

# ================================================================
# 7. DISCHARGE TREND FEATURES
# ================================================================

print("\n" + "=" * 70)
print("CREATING DISCHARGE TREND FEATURES")
print("=" * 70)

if "river_discharge" in df.columns:

    # Ratio to recent 7-day mean
    if "discharge_7d_mean" in df.columns:

        denominator = (
            df["discharge_7d_mean"]
            .abs()
            .replace(0, np.nan)
        )

        df["discharge_vs_7d_mean"] = (
            df["river_discharge"]
            / denominator
        )

    # Ratio to recent 30-day mean
    if "discharge_30d_mean" in df.columns:

        denominator = (
            df["discharge_30d_mean"]
            .abs()
            .replace(0, np.nan)
        )

        df["discharge_vs_30d_mean"] = (
            df["river_discharge"]
            / denominator
        )

    print(
        "\nDischarge trend features created "
        "where source columns are available."
    )

# ================================================================
# 8. CHECK FOR IMPOSSIBLE VALUES
# ================================================================

print("\n" + "=" * 70)
print("QUALITY CHECK")
print("=" * 70)

# These are conservative sanity checks.
# We flag values but do not blindly delete them.

quality_rules = {
    "temperature_2m": (-50, 60),
    "relative_humidity_2m": (0, 100),
    "surface_pressure": (850, 1100),
    "wind_speed_10m": (0, 150),
    "cloud_cover": (0, 100),
    "cloud_cover_low": (0, 100)
}

for column, (lower, upper) in quality_rules.items():

    if column not in df.columns:
        continue

    invalid = (
        (df[column] < lower)
        |
        (df[column] > upper)
    )

    count = invalid.sum()

    print(
        f"{column:30s}: "
        f"{count:,} outside [{lower}, {upper}]"
    )

# ================================================================
# 9. SELECT FINAL FEATURES
# ================================================================

print("\n" + "=" * 70)
print("SELECTING FINAL AI FEATURES")
print("=" * 70)

feature_candidates = [
    # Weather
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

    # Weather-derived
    "rain_binary",
    "temperature_humidity_index",
    "wind_u",
    "wind_v",

    # River
    "river_discharge",
    "discharge_change_1d",
    "discharge_change_3d",
    "discharge_change_7d",
    "discharge_3d_mean",
    "discharge_7d_mean",
    "discharge_7d_max",
    "discharge_7d_min",
    "discharge_30d_mean",
    "discharge_vs_7d_mean",
    "discharge_vs_30d_mean",
    "river_discharge_available",

    # Geography / matching quality
    "station_distance_km",

    # Time
    "year",
    "month",
    "day",
    "day_of_year",
    "month_sin",
    "month_cos",
    "day_of_year_sin",
    "day_of_year_cos"
]

final_features = [
    column
    for column in feature_candidates
    if column in df.columns
]

print(
    f"\nFinal feature count: "
    f"{len(final_features)}"
)

for i, column in enumerate(
    final_features,
    start=1
):

    print(
        f"{i:2d}. {column}"
    )

# ================================================================
# 10. CREATE FINAL DATASET
# ================================================================

required_columns = (
    final_features
    +
    ["flood_event"]
)

final_df = df[
    required_columns
].copy()

# Keep event information if available.
# These are useful for later event-aware splitting,
# but are NOT used as model features.
metadata_columns = [
    "event_id",
    "city_normalized",
    "matched_station"
]

for column in metadata_columns:

    if column in df.columns:

        final_df[column] = df[column]

# ================================================================
# 11. REMOVE COMPLETELY EMPTY FEATURE COLUMNS
# ================================================================

empty_features = []

for column in final_features:

    if final_df[column].notna().sum() == 0:

        empty_features.append(column)

if len(empty_features) > 0:

    print(
        "\nRemoving completely empty features:"
    )

    for column in empty_features:
        print(
            f"  {column}"
        )

    final_features = [
        column
        for column in final_features
        if column not in empty_features
    ]

    keep_columns = (
        final_features
        +
        ["flood_event"]
        +
        [
            c
            for c in metadata_columns
            if c in final_df.columns
        ]
    )

    final_df = final_df[
        keep_columns
    ]

# ================================================================
# 12. FINAL MISSINGNESS REPORT
# ================================================================

print("\n" + "=" * 70)
print("FINAL FEATURE MISSINGNESS")
print("=" * 70)

missing_report = []

for column in final_features:

    missing = final_df[column].isna().sum()

    percentage = (
        missing /
        len(final_df) *
        100
    )

    missing_report.append({
        "feature": column,
        "missing": missing,
        "missing_percent": round(
            percentage,
            2
        )
    })

missing_report_df = (
    pd.DataFrame(missing_report)
    .sort_values(
        "missing_percent",
        ascending=False
    )
)

print(
    missing_report_df
    .to_string(index=False)
)

# ================================================================
# 13. TARGET VALIDATION
# ================================================================

print("\n" + "=" * 70)
print("TARGET VALIDATION")
print("=" * 70)

print(
    "\nTarget: flood_event"
)

print(
    final_df["flood_event"]
    .value_counts(dropna=False)
    .sort_index()
)

print(
    "\nTarget missing values:",
    final_df["flood_event"].isna().sum()
)

# Remove rows where target is missing.
final_df = final_df[
    final_df["flood_event"].notna()
].copy()

final_df["flood_event"] = (
    final_df["flood_event"]
    .astype(int)
)

# ================================================================
# 14. SORT BY EVENT/TIME INFORMATION
# ================================================================

sort_columns = []

if "event_id" in final_df.columns:
    sort_columns.append("event_id")

if "city_normalized" in final_df.columns:
    sort_columns.append("city_normalized")

if "date" in df.columns:
    # date is not in final_df unless explicitly selected,
    # so no action here.
    pass

if len(sort_columns) > 0:

    final_df = final_df.sort_values(
        sort_columns
    ).reset_index(drop=True)

# ================================================================
# 15. SAVE
# ================================================================

os.makedirs(
    os.path.dirname(OUTPUT_FILE),
    exist_ok=True
)

final_df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 70)
print("FINAL DATASET SAVED")
print("=" * 70)

print(
    f"\nFile:"
)

print(
    OUTPUT_FILE
)

print(
    f"\nRows: "
    f"{len(final_df):,}"
)

print(
    f"Columns: "
    f"{len(final_df.columns)}"
)

print(
    f"Model features: "
    f"{len(final_features)}"
)

print("\nFinal columns:")

for column in final_df.columns:

    print(
        f"  {column}"
    )

print("\n" + "=" * 70)
print("STEP 35 COMPLETE")
print("=" * 70)

print(
    "\nThe dataset is prepared for the next "
    "event-aware training step."
)

print(
    "\nIMPORTANT:"
)

print(
    "Do NOT fill missing river discharge with zero."
)

print(
    "Do NOT train yet."
)