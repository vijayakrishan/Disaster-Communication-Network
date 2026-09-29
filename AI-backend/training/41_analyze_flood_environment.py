import pandas as pd
import numpy as np

print("=" * 70)
print("RESQMESH - FLOOD VS NORMAL ENVIRONMENT ANALYSIS")
print("=" * 70)

FILE = "data/processed/train_event_aware.csv"

df = pd.read_csv(
    FILE,
    low_memory=False
)

print(
    f"\nRows: {len(df):,}"
)

# ================================================================
# FEATURES TO ANALYZE
# ================================================================

FEATURES = [
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
    "temperature_humidity_index",
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
    "station_distance_km"
]

# ================================================================
# FLOOD / NORMAL SPLIT
# ================================================================

normal = df[
    df["flood_event"] == 0
]

flood = df[
    df["flood_event"] == 1
]

print(
    f"\nNormal rows: {len(normal):,}"
)

print(
    f"Flood rows:  {len(flood):,}"
)

# ================================================================
# STATISTICAL COMPARISON
# ================================================================

results = []

for feature in FEATURES:

    if feature not in df.columns:
        continue

    normal_values = pd.to_numeric(
        normal[feature],
        errors="coerce"
    ).dropna()

    flood_values = pd.to_numeric(
        flood[feature],
        errors="coerce"
    ).dropna()

    if len(normal_values) == 0:
        continue

    if len(flood_values) == 0:
        continue

    normal_mean = normal_values.mean()
    flood_mean = flood_values.mean()

    normal_median = normal_values.median()
    flood_median = flood_values.median()

    normal_std = normal_values.std()
    flood_std = flood_values.std()

    mean_difference = (
        flood_mean -
        normal_mean
    )

    results.append({
        "feature": feature,
        "normal_mean": normal_mean,
        "flood_mean": flood_mean,
        "mean_difference":
            mean_difference,
        "normal_median":
            normal_median,
        "flood_median":
            flood_median,
        "normal_std":
            normal_std,
        "flood_std":
            flood_std,
        "normal_count":
            len(normal_values),
        "flood_count":
            len(flood_values)
    })

results_df = pd.DataFrame(
    results
)

# ================================================================
# SORT BY ABSOLUTE DIFFERENCE
# ================================================================

results_df[
    "absolute_difference"
] = results_df[
    "mean_difference"
].abs()

results_df = (
    results_df
    .sort_values(
        "absolute_difference",
        ascending=False
    )
    .reset_index(drop=True)
)

# ================================================================
# DISPLAY
# ================================================================

print("\n" + "=" * 70)
print("FLOOD VS NORMAL FEATURE COMPARISON")
print("=" * 70)

print(
    results_df[
        [
            "feature",
            "normal_mean",
            "flood_mean",
            "mean_difference",
            "normal_median",
            "flood_median"
        ]
    ].to_string(
        index=False
    )
)

# ================================================================
# EVENT INFORMATION
# ================================================================

print("\n" + "=" * 70)
print("TRAINING EVENT INFORMATION")
print("=" * 70)

if "event_id" in df.columns:

    print(
        df[
            df["flood_event"] == 1
        ][
            [
                "event_id"
            ]
        ]
        .value_counts()
        .sort_index()
    )

# ================================================================
# CITY INFORMATION
# ================================================================

if "city_normalized" in df.columns:

    print("\nFlood-event cities:")

    print(
        flood[
            "city_normalized"
        ]
        .value_counts()
        .to_string()
    )

# ================================================================
# SAVE
# ================================================================

OUTPUT = (
    "data/processed/"
    "flood_vs_normal_feature_analysis.csv"
)

results_df.to_csv(
    OUTPUT,
    index=False
)

print("\n" + "=" * 70)

print(
    "Analysis saved:"
)

print(
    OUTPUT
)

print("=" * 70)