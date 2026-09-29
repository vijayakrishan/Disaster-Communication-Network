import pandas as pd
import numpy as np
from pathlib import Path

# ============================================================
# STEP 13: ANALYZE TARGET-READY WATER EVENTS
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "water_level_target_ready.csv"
)

OUTPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "water_high_events.csv"
)

print("=" * 70)
print("STEP 13: TARGET-READY WATER EVENT ANALYSIS")
print("=" * 70)

# ------------------------------------------------------------
# 1. LOAD DATA
# ------------------------------------------------------------

print("\nLoading target-ready water-level data...")

df = pd.read_csv(INPUT_FILE)

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)

df["water_level"] = pd.to_numeric(
    df["water_level"],
    errors="coerce"
)

df = (
    df
    .dropna(
        subset=[
            "timestamp",
            "water_level"
        ]
    )
    .sort_values("timestamp")
    .reset_index(drop=True)
)

print(
    "Target-ready records:",
    len(df)
)

print(
    "Date range:",
    df["timestamp"].min(),
    "to",
    df["timestamp"].max()
)

# ------------------------------------------------------------
# 2. WATER-LEVEL DISTRIBUTION
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("WATER-LEVEL DISTRIBUTION")
print("=" * 70)

percentiles = [
    50,
    75,
    80,
    85,
    90,
    95,
    97,
    98,
    99
]

for p in percentiles:

    value = np.percentile(
        df["water_level"],
        p
    )

    print(
        f"{p:>3}% percentile : {value:.3f} m"
    )

# ------------------------------------------------------------
# 3. MOST COMMON VALUES
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("MOST COMMON TARGET-READY WATER LEVELS")
print("=" * 70)

common_values = (
    df["water_level"]
    .round(3)
    .value_counts()
    .head(20)
)

print(
    common_values.to_string()
)

# ------------------------------------------------------------
# 4. CALCULATE HIGH-WATER THRESHOLDS
# ------------------------------------------------------------

p90 = np.percentile(
    df["water_level"],
    90
)

p95 = np.percentile(
    df["water_level"],
    95
)

p97 = np.percentile(
    df["water_level"],
    97
)

print("\n" + "=" * 70)
print("HIGH-WATER THRESHOLDS")
print("=" * 70)

print(
    f"90th percentile : {p90:.3f} m"
)

print(
    f"95th percentile : {p95:.3f} m"
)

print(
    f"97th percentile : {p97:.3f} m"
)

print(
    "\nThese thresholds are statistical prototype thresholds."
)

print(
    "They are NOT official flood thresholds."
)

# ------------------------------------------------------------
# 5. COUNT HIGH-WATER RECORDS
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("HIGH-WATER RECORD COUNTS")
print("=" * 70)

thresholds = [
    ("90th percentile", p90),
    ("95th percentile", p95),
    ("97th percentile", p97)
]

for name, threshold in thresholds:

    count = (
        df["water_level"]
        >= threshold
    ).sum()

    percentage = (
        count / len(df)
    ) * 100

    print(
        f"\n{name}"
    )

    print(
        f"Threshold : {threshold:.3f} m"
    )

    print(
        f"Records   : {count}"
    )

    print(
        f"Percentage: {percentage:.2f}%"
    )

# ------------------------------------------------------------
# 6. IDENTIFY HIGH-WATER STATE
# ------------------------------------------------------------

# For event analysis we use the 90th percentile.
#
# This does NOT mean 90th percentile = flood.
# It simply identifies unusually high observations
# for statistical event analysis.

df["high_water"] = (
    df["water_level"]
    >= p90
)

# ------------------------------------------------------------
# 7. CREATE EVENT GROUPS
# ------------------------------------------------------------

# A new group is created whenever the high-water
# state changes.

df["event_group"] = (
    df["high_water"]
    .ne(
        df["high_water"].shift()
    )
    .cumsum()
)

events = []

for group_id, group in df.groupby(
    "event_group"
):

    # Ignore normal-water groups
    if not bool(
        group["high_water"].iloc[0]
    ):
        continue

    events.append(
        {
            "event_id": len(events) + 1,

            "start":
                group["timestamp"].min(),

            "end":
                group["timestamp"].max(),

            "records":
                len(group),

            "max_water_level":
                group["water_level"].max(),

            "mean_water_level":
                group["water_level"].mean(),

            "min_water_level":
                group["water_level"].min()
        }
    )

events_df = pd.DataFrame(events)

# ------------------------------------------------------------
# 8. HIGH-WATER EVENTS
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("HIGH-WATER EVENTS")
print("=" * 70)

print(
    "Number of high-water events:",
    len(events_df)
)

if len(events_df) > 0:

    print(
        "\nLargest events by maximum water level:"
    )

    print(
        events_df
        .sort_values(
            "max_water_level",
            ascending=False
        )
        .head(30)
        .to_string(
            index=False
        )
    )

# ------------------------------------------------------------
# 9. LONGEST EVENTS
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("LONGEST HIGH-WATER EVENTS")
print("=" * 70)

if len(events_df) > 0:

    print(
        events_df
        .sort_values(
            "records",
            ascending=False
        )
        .head(20)
        .to_string(
            index=False
        )

    )

# ------------------------------------------------------------
# 10. SAVE EVENT SUMMARY
# ------------------------------------------------------------

events_df.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 70)
print("EVENT SUMMARY SAVED")
print("=" * 70)

print(
    OUTPUT_FILE
)

print("\n" + "=" * 70)
print("STEP 13 COMPLETED")
print("=" * 70)