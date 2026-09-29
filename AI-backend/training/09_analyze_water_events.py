import pandas as pd
from pathlib import Path

# ============================================================
# STEP 9: ANALYZE WATER-LEVEL EVENTS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "water_level_parthibanur.csv"
)

water = pd.read_csv(INPUT_FILE)

water["timestamp"] = pd.to_datetime(
    water["timestamp"],
    errors="coerce"
)

water = water.sort_values("timestamp").reset_index(drop=True)

print("=" * 70)
print("WATER-LEVEL EVENT ANALYSIS")
print("=" * 70)

# ------------------------------------------------------------
# 1. MOST COMMON WATER LEVELS
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("MOST COMMON WATER-LEVEL VALUES")
print("=" * 70)

print(
    water["water_level"]
    .value_counts()
    .head(20)
)

# ------------------------------------------------------------
# 2. EXACT 93.2 RECORDS
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("93.2 m RECORDS")
print("=" * 70)

high_932 = water[
    water["water_level"] == 93.2
].copy()

print(
    "Number of 93.2 m records:",
    len(high_932)
)

if len(high_932) > 0:
    print(
        "\nFirst 20:"
    )

    print(
        high_932[
            [
                "timestamp",
                "water_level",
                "water_level_change_1"
            ]
        ]
        .head(20)
        .to_string(index=False)
    )

    print(
        "\nLast 20:"
    )

    print(
        high_932[
            [
                "timestamp",
                "water_level",
                "water_level_change_1"
            ]
        ]
        .tail(20)
        .to_string(index=False)
    )

# ------------------------------------------------------------
# 3. VERY HIGH WATER LEVEL
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("RECORDS ABOVE 90 m")
print("=" * 70)

above_90 = water[
    water["water_level"] >= 90
]

print(
    "Records >= 90 m:",
    len(above_90)
)

print(
    above_90[
        [
            "timestamp",
            "water_level",
            "water_level_change_1"
        ]
    ]
    .head(30)
    .to_string(index=False)
)

# ------------------------------------------------------------
# 4. LARGE POSITIVE JUMPS
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("LARGE POSITIVE WATER-LEVEL JUMPS")
print("=" * 70)

large_jumps = water[
    water["water_level_change_1"] >= 5
]

print(
    "Number of jumps >= 5 m:",
    len(large_jumps)
)

print(
    large_jumps[
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
    .head(30)
    .to_string(index=False)
)

# ------------------------------------------------------------
# 5. LARGE NEGATIVE JUMPS
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("LARGE NEGATIVE WATER-LEVEL JUMPS")
print("=" * 70)

large_drops = water[
    water["water_level_change_1"] <= -5
]

print(
    "Number of drops <= -5 m:",
    len(large_drops)
)

print(
    large_drops[
        [
            "timestamp",
            "water_level",
            "water_level_change_1",
            "water_level_change_3"
        ]
    ]
    .sort_values(
        "water_level_change_1"
    )
    .head(30)
    .to_string(index=False)
)

# ------------------------------------------------------------
# 6. LONG CONSTANT PERIODS
# ------------------------------------------------------------

water["same_as_previous"] = (
    water["water_level"]
    == water["water_level"].shift(1)
)

# Count consecutive equal readings
groups = (
    water["same_as_previous"]
    != water["same_as_previous"].shift()
).cumsum()

constant_groups = (
    water.groupby(groups)
    .agg(
        start=("timestamp", "min"),
        end=("timestamp", "max"),
        records=("water_level", "size"),
        water_level=("water_level", "first")
    )
)

constant_groups = constant_groups[
    constant_groups["records"] >= 10
]

print("\n" + "=" * 70)
print("LONG CONSTANT WATER-LEVEL PERIODS")
print("=" * 70)

print(
    constant_groups
    .sort_values("records", ascending=False)
    .head(30)
    .to_string(index=False)
)

print("\n" + "=" * 70)
print("STEP 9 COMPLETED")
print("=" * 70)