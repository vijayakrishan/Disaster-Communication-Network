import pandas as pd
from pathlib import Path

print("=" * 70)
print("RESQMESH - PREPARE HISTORICAL RAINFALL FEATURES")
print("=" * 70)

RAW = Path("data/raw")
PROCESSED = Path("data/processed")

# =========================================================
# 1. DISTRICT RAINFALL NORMAL
# =========================================================

print("\nLoading district rainfall normals...")

district_file = RAW / "district wise rainfall normal.csv"

district = pd.read_csv(
    district_file,
    encoding_errors="replace"
)

# Keep Tamil Nadu only
district_tn = district[
    district["STATE_UT_NAME"]
    .astype(str)
    .str.upper()
    .str.strip()
    == "TAMIL NADU"
].copy()

print("Tamil Nadu districts:", len(district_tn))

# =========================================================
# CLEAN DISTRICT NAMES
# =========================================================

district_tn["DISTRICT"] = (
    district_tn["DISTRICT"]
    .astype(str)
    .str.upper()
    .str.strip()
)

# =========================================================
# SELECT USEFUL FEATURES
# =========================================================

normal_columns = [
    "DISTRICT",
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
    "ANNUAL",
    "Jan-Feb",
    "Mar-May",
    "Jun-Sep",
    "Oct-Dec"
]

district_features = district_tn[normal_columns].copy()

# Rename columns
district_features = district_features.rename(
    columns={
        "DISTRICT": "district",
        "JAN": "normal_rain_jan",
        "FEB": "normal_rain_feb",
        "MAR": "normal_rain_mar",
        "APR": "normal_rain_apr",
        "MAY": "normal_rain_may",
        "JUN": "normal_rain_jun",
        "JUL": "normal_rain_jul",
        "AUG": "normal_rain_aug",
        "SEP": "normal_rain_sep",
        "OCT": "normal_rain_oct",
        "NOV": "normal_rain_nov",
        "DEC": "normal_rain_dec",
        "ANNUAL": "normal_rain_annual",
        "Jan-Feb": "normal_rain_jan_feb",
        "Mar-May": "normal_rain_mar_may",
        "Jun-Sep": "normal_rain_jun_sep",
        "Oct-Dec": "normal_rain_oct_dec"
    }
)

# =========================================================
# 2. HISTORICAL TAMIL NADU RAINFALL
# =========================================================

print("\nLoading historical rainfall...")

historical_file = RAW / "rainfall in india 1901-2015.csv"

historical = pd.read_csv(
    historical_file,
    encoding_errors="replace"
)

historical_tn = historical[
    historical["SUBDIVISION"]
    .astype(str)
    .str.upper()
    .str.strip()
    == "TAMIL NADU"
].copy()

print("Tamil Nadu historical rows:", len(historical_tn))

# =========================================================
# CREATE LONG-TERM STATISTICS
# =========================================================

monthly_columns = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC"
]

# Convert to numeric
for col in monthly_columns + ["ANNUAL"]:
    historical_tn[col] = pd.to_numeric(
        historical_tn[col],
        errors="coerce"
    )

# Calculate long-term statistics
historical_summary = pd.DataFrame({
    "historical_rain_mean_annual":
        [historical_tn["ANNUAL"].mean()],

    "historical_rain_std_annual":
        [historical_tn["ANNUAL"].std()],

    "historical_rain_min_annual":
        [historical_tn["ANNUAL"].min()],

    "historical_rain_max_annual":
        [historical_tn["ANNUAL"].max()],

    "historical_rain_mean_oct_dec":
        [historical_tn[["OCT", "NOV", "DEC"]].mean().mean()],

    "historical_rain_mean_jun_sep":
        [historical_tn[["JUN", "JUL", "AUG", "SEP"]].mean().mean()]
})

# =========================================================
# SAVE DISTRICT FEATURES
# =========================================================

district_output = (
    PROCESSED /
    "tamil_nadu_district_rainfall_normals.csv"
)

district_features.to_csv(
    district_output,
    index=False
)

# =========================================================
# SAVE HISTORICAL SUMMARY
# =========================================================

historical_output = (
    PROCESSED /
    "tamil_nadu_historical_rainfall_summary.csv"
)

historical_summary.to_csv(
    historical_output,
    index=False
)

# =========================================================
# DISPLAY
# =========================================================

print("\n" + "=" * 70)
print("DISTRICT RAINFALL FEATURES")
print("=" * 70)

print(district_features.head())

print("\n" + "=" * 70)
print("HISTORICAL RAINFALL SUMMARY")
print("=" * 70)

print(historical_summary.T)

print("\n" + "=" * 70)
print("FILES SAVED")
print("=" * 70)

print(district_output)
print(historical_output)

print("\n" + "=" * 70)
print("STEP 29 COMPLETE")
print("=" * 70)