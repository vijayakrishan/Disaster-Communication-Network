import pandas as pd
import os

print("=" * 70)
print("RESQMESH - FINALIZE RIVER DISCHARGE FEATURES")
print("=" * 70)

INPUT_FILE = r"data\processed\tn_river_discharge_features.csv"

OUTPUT_FILE = r"data\processed\tn_river_discharge_features_final.csv"

print("\nLoading discharge features...")

df = pd.read_csv(
    INPUT_FILE,
    low_memory=False
)

df["Data Acquisition Time"] = pd.to_datetime(
    df["Data Acquisition Time"],
    errors="coerce"
)

print(f"Rows loaded: {len(df):,}")

# ============================================================
# REMOVE PERCENTAGE CHANGE FEATURE
# ============================================================

if "discharge_pct_change_1d" in df.columns:

    print(
        "\nRemoving discharge_pct_change_1d "
        "because it is undefined for zero-flow transitions."
    )

    df = df.drop(
        columns=["discharge_pct_change_1d"]
    )

# ============================================================
# KEEP ONLY USEFUL FEATURES
# ============================================================

columns_to_keep = [
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

columns_to_keep = [
    col for col in columns_to_keep
    if col in df.columns
]

df = df[columns_to_keep].copy()

# ============================================================
# SORT
# ============================================================

df = df.sort_values(
    [
        "Station",
        "Data Acquisition Time"
    ]
).reset_index(drop=True)

# ============================================================
# SAVE
# ============================================================

os.makedirs(
    os.path.dirname(OUTPUT_FILE),
    exist_ok=True
)

df.to_csv(
    OUTPUT_FILE,
    index=False
)

# ============================================================
# SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("FINAL DISCHARGE DATASET")
print("=" * 70)

print(
    f"Rows: {len(df):,}"
)

print(
    f"Columns: {len(df.columns)}"
)

print(
    f"Stations: {df['Station'].nunique():,}"
)

print(
    f"Districts: {df['District'].nunique():,}"
)

print(
    f"Date range: "
    f"{df['Data Acquisition Time'].min()} "
    f"to "
    f"{df['Data Acquisition Time'].max()}"
)

print("\nColumns:")

for col in df.columns:
    print(" -", col)

print("\nRemaining missing values:")

for col in df.columns:

    missing = df[col].isna().sum()

    if missing > 0:

        print(
            f" - {col}: {missing:,}"
        )

print("\n" + "=" * 70)
print("FILE SAVED")
print("=" * 70)

print(OUTPUT_FILE)

print("\n" + "=" * 70)
print("STEP 32 COMPLETE")
print("=" * 70)