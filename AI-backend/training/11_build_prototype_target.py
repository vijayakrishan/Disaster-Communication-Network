import pandas as pd
import numpy as np
from pathlib import Path

# ============================================================
# STEP 11: BUILD PROTOTYPE TARGET
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

WATER_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "water_level_parthibanur.csv"
)

print("=" * 70)
print("STEP 11: PROTOTYPE WATER-RISK TARGET ANALYSIS")
print("=" * 70)

# ------------------------------------------------------------
# 1. LOAD DATA
# ------------------------------------------------------------

print("\nLoading water-level data...")

df = pd.read_csv(WATER_FILE)

print("Total records:", len(df))

# ------------------------------------------------------------
# 2. CONVERT TIMESTAMP
# ------------------------------------------------------------

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)

df["water_level"] = pd.to_numeric(
    df["water_level"],
    errors="coerce"
)

# Remove records where the main value is unavailable
df = df.dropna(
    subset=["timestamp", "water_level"]
).sort_values("timestamp")

print("Usable records:", len(df))

# ------------------------------------------------------------
# 3. BASIC STATISTICS
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("WATER-LEVEL DISTRIBUTION")
print("=" * 70)

percentiles = [
    1,
    5,
    10,
    25,
    50,
    75,
    90,
    95,
    97,
    98,
    99,
    99.5,
    100
]

for p in percentiles:

    value = np.percentile(
        df["water_level"],
        p
    )

    print(
        f"{p:>5}% percentile : {value:.3f} m"
    )

# ------------------------------------------------------------
# 4. UNIQUE VALUES
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("MOST COMMON WATER-LEVEL VALUES")
print("=" * 70)

value_counts = (
    df["water_level"]
    .round(3)
    .value_counts()
    .head(20)
)

print(value_counts.to_string())

# ------------------------------------------------------------
# 5. POSSIBLE RISK BOUNDARIES
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("POSSIBLE PROTOTYPE RISK BOUNDARIES")
print("=" * 70)

p75 = np.percentile(df["water_level"], 75)
p90 = np.percentile(df["water_level"], 90)
p95 = np.percentile(df["water_level"], 95)
p99 = np.percentile(df["water_level"], 99)

print(f"\n75th percentile : {p75:.3f} m")
print(f"90th percentile : {p90:.3f} m")
print(f"95th percentile : {p95:.3f} m")
print(f"99th percentile : {p99:.3f} m")

print("\nThese are statistical boundaries only.")
print("They are NOT official flood thresholds.")

# ------------------------------------------------------------
# 6. COUNT RECORDS IN DIFFERENT RANGES
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("RECORD DISTRIBUTION")
print("=" * 70)

ranges = [
    ("Below 75th percentile", df["water_level"] < p75),
    ("75th - 90th percentile",
     (df["water_level"] >= p75) &
     (df["water_level"] < p90)),
    ("90th - 95th percentile",
     (df["water_level"] >= p90) &
     (df["water_level"] < p95)),
    ("95th - 99th percentile",
     (df["water_level"] >= p95) &
     (df["water_level"] < p99)),
    ("Above 99th percentile",
     df["water_level"] >= p99)
]

for name, condition in ranges:

    count = condition.sum()

    percentage = (
        count / len(df)
    ) * 100

    print(
        f"{name:<30} "
        f"{count:>5} records "
        f"({percentage:.2f}%)"
    )

# ------------------------------------------------------------
# 7. CHECK HIGH WATER LEVEL RECORDS
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("HIGHEST WATER-LEVEL RECORDS")
print("=" * 70)

high = (
    df[
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
    .head(30)
)

print(
    high.to_string(index=False)
)

# ------------------------------------------------------------
# 8. CHECK EXACT HIGH VALUES
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("RECORDS ABOVE 95th PERCENTILE")
print("=" * 70)

above_95 = df[
    df["water_level"] >= p95
]

print(
    "Number of records:",
    len(above_95)
)

print(
    "\nDate range:"
)

print(
    "First:",
    above_95["timestamp"].min()
)

print(
    "Last:",
    above_95["timestamp"].max()
)

# ------------------------------------------------------------
# 9. PROVISIONAL TARGET EXPLANATION
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("TARGET DESIGN")
print("=" * 70)

print("""
For the prototype:

SAFE     = normal historical water-level range
WARNING  = unusually high historical water-level range
DANGER   = extremely high historical water-level range

Important:
These categories are statistical prototype labels.
They are NOT official flood declarations.

We will choose the final boundaries after examining
the output of this script.
""")

print("=" * 70)
print("STEP 11 ANALYSIS COMPLETED")
print("=" * 70)