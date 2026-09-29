import pandas as pd
from pathlib import Path

# ============================================================
# STEP 10: CHECK RAINFALL ↔ WATER-LEVEL RELATIONSHIP
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

RAIN_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "rainfall_parthibanur_features.csv"
)

WATER_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "water_level_parthibanur.csv"
)

print("=" * 70)
print("RAINFALL ↔ WATER-LEVEL RELATIONSHIP")
print("=" * 70)

# ------------------------------------------------------------
# 1. LOAD DATA
# ------------------------------------------------------------

print("\nLoading rainfall...")
rain = pd.read_csv(RAIN_FILE)

print("Rainfall rows:", len(rain))

print("\nLoading water level...")
water = pd.read_csv(WATER_FILE)

print("Water-level rows:", len(water))


# ------------------------------------------------------------
# 2. CONVERT TIMESTAMPS
# ------------------------------------------------------------

rain["timestamp"] = pd.to_datetime(
    rain["timestamp"],
    errors="coerce"
)

water["timestamp"] = pd.to_datetime(
    water["timestamp"],
    errors="coerce"
)

rain = rain.dropna(
    subset=["timestamp"]
).sort_values("timestamp")

water = water.dropna(
    subset=["timestamp"]
).sort_values("timestamp")


# ------------------------------------------------------------
# 3. MERGE NEARBY OBSERVATIONS
# ------------------------------------------------------------

print("\nMatching rainfall with water-level observations...")

merged = pd.merge_asof(
    water,
    rain[
        [
            "timestamp",
            "rainfall",
            "rainfall_6h",
            "rainfall_24h",
            "rainfall_72h"
        ]
    ],
    on="timestamp",
    direction="nearest",
    tolerance=pd.Timedelta("6 hours")
)

print(
    "\nTotal water-level records:",
    len(merged)
)

print(
    "Water-level records with nearby rainfall:",
    merged["rainfall"].notna().sum()
)

print(
    "Water-level records without nearby rainfall:",
    merged["rainfall"].isna().sum()
)


# ------------------------------------------------------------
# 4. CORRELATION
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("CORRELATION WITH WATER-LEVEL CHANGE")
print("=" * 70)

columns = [
    "rainfall",
    "rainfall_6h",
    "rainfall_24h",
    "rainfall_72h"
]

for column in columns:

    valid = merged[
        [
            column,
            "water_level_change_1",
            "water_level_change_3"
        ]
    ].dropna()

    if len(valid) >= 5:

        corr_1 = valid[
            column
        ].corr(
            valid["water_level_change_1"]
        )

        corr_3 = valid[
            column
        ].corr(
            valid["water_level_change_3"]
        )

        print(
            f"\n{column}:"
        )

        print(
            "  Records:",
            len(valid)
        )

        print(
            "  Correlation with 1-reading change:",
            round(corr_1, 4)
        )

        print(
            "  Correlation with 3-reading change:",
            round(corr_3, 4)
        )

    else:

        print(
            f"\n{column}: insufficient data"
        )


# ------------------------------------------------------------
# 5. SHOW RAINFALL + WATER LEVEL EVENTS
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("LARGEST RAINFALL OBSERVATIONS")
print("=" * 70)

print(
    merged[
        [
            "timestamp",
            "rainfall",
            "rainfall_6h",
            "rainfall_24h",
            "water_level",
            "water_level_change_1"
        ]
    ]
    .dropna(subset=["rainfall"])
    .sort_values(
        "rainfall",
        ascending=False
    )
    .head(30)
    .to_string(index=False)
)


# ------------------------------------------------------------
# 6. STRONG WATER-LEVEL INCREASES
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("WATER-LEVEL INCREASES WITH NEARBY RAINFALL")
print("=" * 70)

print(
    merged[
        [
            "timestamp",
            "rainfall",
            "rainfall_6h",
            "rainfall_24h",
            "water_level",
            "water_level_change_1",
            "water_level_change_3"
        ]
    ]
    .dropna(
        subset=[
            "rainfall",
            "water_level_change_1"
        ]
    )
    .sort_values(
        "water_level_change_1",
        ascending=False
    )
    .head(30)
    .to_string(index=False)
)


print("\n" + "=" * 70)
print("STEP 10 COMPLETED")
print("=" * 70)