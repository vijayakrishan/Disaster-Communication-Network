import pandas as pd
from pathlib import Path

# ============================================================
# STEP 8: ANALYZE WATER-LEVEL BEHAVIOR
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "water_level_parthibanur.csv"
)

print("=" * 70)
print("WATER-LEVEL ANALYSIS")
print("=" * 70)

water = pd.read_csv(INPUT_FILE)

water["timestamp"] = pd.to_datetime(
    water["timestamp"],
    errors="coerce"
)

water = water.sort_values("timestamp").reset_index(drop=True)

# ------------------------------------------------------------
# Basic information
# ------------------------------------------------------------

print("\nTotal records:", len(water))

print("\nTimestamp range:")
print(
    water["timestamp"].min(),
    "to",
    water["timestamp"].max()
)

# ------------------------------------------------------------
# Water-level statistics
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("WATER-LEVEL STATISTICS")
print("=" * 70)

print(
    water["water_level"].describe(
        percentiles=[
            0.50,
            0.75,
            0.90,
            0.95,
            0.99
        ]
    )
)

# ------------------------------------------------------------
# Water-level change statistics
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("WATER-LEVEL CHANGE STATISTICS")
print("=" * 70)

print("\n1-reading change:")
print(
    water["water_level_change_1"].describe()
)

print("\n3-reading change:")
print(
    water["water_level_change_3"].describe()
)

# ------------------------------------------------------------
# Highest water levels
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("HIGHEST WATER-LEVEL RECORDS")
print("=" * 70)

print(
    water[
        [
            "timestamp",
            "water_level",
            "water_level_change_1",
            "water_level_change_3"
        ]
    ]
    .sort_values(
        "water_level",
        ascending=False
    )
    .head(20)
    .to_string(index=False)
)

# ------------------------------------------------------------
# Largest increases
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("LARGEST WATER-LEVEL INCREASES")
print("=" * 70)

print(
    water[
        [
            "timestamp",
            "water_level",
            "water_level_change_1",
            "water_level_change_3"
        ]
    ]
    .sort_values(
        "water_level_change_1",
        ascending=False
    )
    .head(20)
    .to_string(index=False)
)

# ------------------------------------------------------------
# Percentile counts
# ------------------------------------------------------------

q90 = water["water_level"].quantile(0.90)
q95 = water["water_level"].quantile(0.95)
q99 = water["water_level"].quantile(0.99)

print("\n" + "=" * 70)
print("PERCENTILE THRESHOLDS")
print("=" * 70)

print(f"\n90th percentile: {q90:.3f} m")
print(f"95th percentile: {q95:.3f} m")
print(f"99th percentile: {q99:.3f} m")

print("\nRecords above 90th percentile:")
print(
    (water["water_level"] >= q90).sum()
)

print("\nRecords above 95th percentile:")
print(
    (water["water_level"] >= q95).sum()
)

print("\nRecords above 99th percentile:")
print(
    (water["water_level"] >= q99).sum()
)

# ------------------------------------------------------------
# Missing values
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("MISSING VALUES")
print("=" * 70)

print(
    water[
        [
            "water_level",
            "water_level_change_1",
            "water_level_change_3"
        ]
    ].isna().sum()
)

print("\n" + "=" * 70)
print("STEP 8 COMPLETED")
print("=" * 70)