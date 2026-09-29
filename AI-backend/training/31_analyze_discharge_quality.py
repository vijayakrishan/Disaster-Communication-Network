import pandas as pd
import numpy as np

print("=" * 70)
print("RESQMESH - ANALYZE RIVER DISCHARGE QUALITY")
print("=" * 70)

FILE = r"data\processed\tn_river_discharge_features.csv"

# ============================================================
# LOAD
# ============================================================

print("\nLoading processed discharge data...")

df = pd.read_csv(
    FILE,
    low_memory=False
)

df["Data Acquisition Time"] = pd.to_datetime(
    df["Data Acquisition Time"],
    errors="coerce"
)

print(f"Rows: {len(df):,}")
print(f"Stations: {df['Station'].nunique():,}")

# ============================================================
# BASIC STATISTICS
# ============================================================

print("\n" + "=" * 70)
print("BASIC DISCHARGE STATISTICS")
print("=" * 70)

print(
    df["river_discharge"].describe()
)

# ============================================================
# STATION SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("STATION SUMMARY")
print("=" * 70)

station_summary = (
    df.groupby("Station")
    .agg(
        records=("river_discharge", "size"),
        mean_discharge=("river_discharge", "mean"),
        max_discharge=("river_discharge", "max"),
        zero_count=(
            "river_discharge",
            lambda x: (x == 0).sum()
        ),
        latitude=("Latitude", "first"),
        longitude=("Longitude", "first")
    )
    .sort_values(
        "max_discharge",
        ascending=False
    )
)

print(
    station_summary.head(20).to_string()
)

# ============================================================
# ZERO DISCHARGE ANALYSIS
# ============================================================

print("\n" + "=" * 70)
print("ZERO DISCHARGE ANALYSIS")
print("=" * 70)

zero_percentage = (
    (df["river_discharge"] == 0).mean() * 100
)

print(
    f"Zero discharge records: "
    f"{(df['river_discharge'] == 0).sum():,}"
)

print(
    f"Percentage of records with zero discharge: "
    f"{zero_percentage:.2f}%"
)

# ============================================================
# EXTREME VALUES
# ============================================================

print("\n" + "=" * 70)
print("TOP 20 HIGHEST DISCHARGE OBSERVATIONS")
print("=" * 70)

top_discharge = df.nlargest(
    20,
    "river_discharge"
)[
    [
        "Station",
        "District",
        "River",
        "Data Acquisition Time",
        "river_discharge",
        "Latitude",
        "Longitude"
    ]
]

print(
    top_discharge.to_string(index=False)
)

# ============================================================
# LARGE DAILY CHANGES
# ============================================================

print("\n" + "=" * 70)
print("LARGEST 1-DAY DISCHARGE CHANGES")
print("=" * 70)

largest_changes = df.copy()

largest_changes["abs_change_1d"] = (
    largest_changes["discharge_change_1d"]
    .abs()
)

largest_changes = largest_changes.nlargest(
    20,
    "abs_change_1d"
)

print(
    largest_changes[
        [
            "Station",
            "District",
            "River",
            "Data Acquisition Time",
            "river_discharge",
            "discharge_change_1d"
        ]
    ].to_string(index=False)
)

# ============================================================
# STATION COVERAGE
# ============================================================

print("\n" + "=" * 70)
print("STATION DATE COVERAGE")
print("=" * 70)

coverage = (
    df.groupby("Station")
    .agg(
        first_date=(
            "Data Acquisition Time",
            "min"
        ),
        last_date=(
            "Data Acquisition Time",
            "max"
        ),
        records=("river_discharge", "size")
    )
    .sort_values("first_date")
)

print(
    coverage.to_string()
)

# ============================================================
# MISSING FEATURE CHECK
# ============================================================

print("\n" + "=" * 70)
print("FEATURE MISSING VALUES")
print("=" * 70)

feature_columns = [
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
    "discharge_30d_mean"
]

for col in feature_columns:

    if col in df.columns:

        missing = df[col].isna().sum()

        print(
            f"{col:35s}: {missing:,}"
        )

# ============================================================
# FINAL
# ============================================================

print("\n" + "=" * 70)
print("STEP 31 COMPLETE")
print("=" * 70)