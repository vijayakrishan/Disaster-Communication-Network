import pandas as pd
from pathlib import Path

# ============================================================
# STEP 6: PREPARE RAINFALL FEATURES
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

RAW_DIR = BASE_DIR / "data" / "raw"
PROCESSED_DIR = BASE_DIR / "data" / "processed"

INPUT_FILE = RAW_DIR / "rainfall_tel_hr_tamil_nadu_sw_gw_tn_2021_2025.csv"

OUTPUT_FILE = PROCESSED_DIR / "rainfall_parthibanur_features.csv"


print("=" * 70)
print("PREPARING RAINFALL FEATURES")
print("=" * 70)


# ============================================================
# 1. LOAD RAINFALL DATA
# ============================================================

print("\nLoading rainfall dataset...")

rainfall = pd.read_csv(INPUT_FILE)

print("Total rainfall rows:", len(rainfall))


# ============================================================
# 2. CONVERT TIMESTAMP
# ============================================================

print("\nConverting timestamps...")

rainfall["timestamp"] = pd.to_datetime(
    rainfall["Data Acquisition Time"],
    errors="coerce",
    dayfirst=True
)


# ============================================================
# 3. REMOVE INVALID TIMESTAMPS
# ============================================================

rainfall = rainfall.dropna(
    subset=["timestamp"]
).copy()


# ============================================================
# 4. FILTER PARTHIBANUR REGULATOR
# ============================================================

print("\nFiltering Parthibanur Regulator...")

rainfall = rainfall[
    rainfall["Station"]
    .astype(str)
    .str.strip()
    .str.lower()
    == "parthibanur regulator"
].copy()

print(
    "Parthibanur rainfall rows:",
    len(rainfall)
)


# ============================================================
# 5. KEEP REQUIRED COLUMNS
# ============================================================

rainfall = rainfall[
    [
        "Station",
        "District",
        "Latitude",
        "Longitude",
        "timestamp",
        "Telemetry Hourly Rainfall (mm)"
    ]
].copy()


rainfall.rename(
    columns={
        "Telemetry Hourly Rainfall (mm)": "rainfall"
    },
    inplace=True
)


# ============================================================
# 6. CONVERT RAINFALL TO NUMERIC
# ============================================================

rainfall["rainfall"] = pd.to_numeric(
    rainfall["rainfall"],
    errors="coerce"
)


# ============================================================
# 7. SORT BY TIME
# ============================================================

rainfall = rainfall.sort_values(
    "timestamp"
).reset_index(drop=True)


# ============================================================
# 8. REMOVE INVALID RAINFALL
# ============================================================

# Values outside the cleaning range identified earlier
# are treated as unavailable.

invalid_rainfall = (
    (rainfall["rainfall"] < 0)
    | (rainfall["rainfall"] > 300)
)

print(
    "\nInvalid rainfall values:",
    invalid_rainfall.sum()
)

rainfall.loc[
    invalid_rainfall,
    "rainfall"
] = pd.NA


# ============================================================
# 9. CREATE TIME-BASED RAINFALL FEATURES
# ============================================================

print("\nCreating rainfall features...")

rainfall = rainfall.set_index("timestamp")


# 1-hour rainfall
rainfall["rainfall_1h"] = (
    rainfall["rainfall"]
    .rolling("1h", min_periods=1)
    .sum()
)


# 6-hour accumulated rainfall
rainfall["rainfall_6h"] = (
    rainfall["rainfall"]
    .rolling("6h", min_periods=1)
    .sum()
)


# 24-hour accumulated rainfall
rainfall["rainfall_24h"] = (
    rainfall["rainfall"]
    .rolling("24h", min_periods=1)
    .sum()
)


# 72-hour accumulated rainfall
rainfall["rainfall_72h"] = (
    rainfall["rainfall"]
    .rolling("72h", min_periods=1)
    .sum()
)


rainfall = rainfall.reset_index()


# ============================================================
# 10. CHECK DATA
# ============================================================

print("\n" + "=" * 70)
print("RAINFALL DATA SUMMARY")
print("=" * 70)

print(
    "\nTimestamp range:"
)

print(
    rainfall["timestamp"].min(),
    "to",
    rainfall["timestamp"].max()
)

print(
    "\nTotal rows:",
    len(rainfall)
)

print(
    "\nMissing values:"
)

print(
    rainfall[
        [
            "rainfall",
            "rainfall_1h",
            "rainfall_6h",
            "rainfall_24h",
            "rainfall_72h"
        ]
    ].isna().sum()
)


# ============================================================
# 11. SAVE
# ============================================================

rainfall.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\nSaved:")
print(OUTPUT_FILE)


# ============================================================
# 12. DISPLAY FIRST ROWS
# ============================================================

print("\nFirst 10 rows:")

print(
    rainfall.head(10).to_string(index=False)
)


print("\n" + "=" * 70)
print("STEP 6 COMPLETED")
print("=" * 70)