import pandas as pd
from pathlib import Path

# ============================================================
# STEP 7: CHECK RAINFALL TIME INTERVALS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "rainfall_parthibanur_features.csv"
)

print("=" * 70)
print("RAINFALL TIME INTERVAL ANALYSIS")
print("=" * 70)

rainfall = pd.read_csv(INPUT_FILE)

rainfall["timestamp"] = pd.to_datetime(
    rainfall["timestamp"],
    errors="coerce"
)

rainfall = rainfall.dropna(
    subset=["timestamp"]
).sort_values("timestamp").reset_index(drop=True)

# Calculate time difference between consecutive readings
rainfall["time_gap_minutes"] = (
    rainfall["timestamp"]
    .diff()
    .dt.total_seconds()
    / 60
)

print("\nTotal rainfall records:", len(rainfall))

print("\nTimestamp range:")
print(
    rainfall["timestamp"].min(),
    "to",
    rainfall["timestamp"].max()
)

print("\nTime-gap statistics (minutes):")
print(
    rainfall["time_gap_minutes"].describe()
)

# ------------------------------------------------------------
# Categorize intervals
# ------------------------------------------------------------

gap = rainfall["time_gap_minutes"]

print("\n" + "=" * 70)
print("TIME INTERVAL COUNTS")
print("=" * 70)

print(
    "\n<= 10 minutes:",
    (gap <= 10).sum()
)

print(
    "10-30 minutes:",
    ((gap > 10) & (gap <= 30)).sum()
)

print(
    "30-60 minutes:",
    ((gap > 30) & (gap <= 60)).sum()
)

print(
    "1-2 hours:",
    ((gap > 60) & (gap <= 120)).sum()
)

print(
    "2-6 hours:",
    ((gap > 120) & (gap <= 360)).sum()
)

print(
    "6-24 hours:",
    ((gap > 360) & (gap <= 1440)).sum()
)

print(
    ">24 hours:",
    (gap > 1440).sum()
)

# ------------------------------------------------------------
# Common exact gaps
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("MOST COMMON TIME GAPS")
print("=" * 70)

gap_counts = (
    gap.dropna()
    .round(2)
    .value_counts()
    .head(20)
)

print(gap_counts)

# ------------------------------------------------------------
# Large rainfall values
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("LARGEST RAINFALL VALUES")
print("=" * 70)

print(
    rainfall[
        [
            "timestamp",
            "rainfall",
            "rainfall_6h",
            "rainfall_24h",
            "rainfall_72h"
        ]
    ]
    .sort_values("rainfall", ascending=False)
    .head(20)
    .to_string(index=False)
)

# ------------------------------------------------------------
# Largest gaps
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("LARGEST TIME GAPS")
print("=" * 70)

print(
    rainfall[
        [
            "timestamp",
            "time_gap_minutes",
            "rainfall"
        ]
    ]
    .sort_values(
        "time_gap_minutes",
        ascending=False
    )
    .head(20)
    .to_string(index=False)
)

print("\n" + "=" * 70)
print("STEP 7 COMPLETED")
print("=" * 70)
