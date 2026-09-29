import pandas as pd
import numpy as np
from pathlib import Path

# ============================================================
# STEP 12: FILTER WATER LEVEL DATA FOR PROTOTYPE TARGET
# ============================================================

BASE_DIR = Path(__file__).resolve().parents[1]

INPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "water_level_parthibanur.csv"
)

OUTPUT_FILE = (
    BASE_DIR
    / "data"
    / "processed"
    / "water_level_target_ready.csv"
)

print("=" * 70)
print("STEP 12: WATER-LEVEL TARGET DATA QUALITY FILTER")
print("=" * 70)

# ------------------------------------------------------------
# 1. LOAD
# ------------------------------------------------------------

df = pd.read_csv(INPUT_FILE)

df["timestamp"] = pd.to_datetime(
    df["timestamp"],
    errors="coerce"
)

df["water_level"] = pd.to_numeric(
    df["water_level"],
    errors="coerce"
)

df = df.sort_values("timestamp").reset_index(drop=True)

print("\nOriginal records:", len(df))

# ------------------------------------------------------------
# 2. FLAG MISSING VALUES
# ------------------------------------------------------------

df["target_missing"] = (
    df["water_level"].isna()
)

# ------------------------------------------------------------
# 3. FLAG EXTREME JUMPS
# ------------------------------------------------------------

df["large_jump"] = (
    df["water_level_change_1"]
    .abs()
    >= 5
)

# ------------------------------------------------------------
# 4. FLAG LONG PLATEAUS
# ------------------------------------------------------------

# A plateau means the exact same water level appears
# repeatedly for many consecutive observations.

df["same_as_previous"] = (
    df["water_level"]
    .eq(df["water_level"].shift(1))
)

# Create groups whenever the value changes
group_id = (
    df["same_as_previous"]
    .ne(df["same_as_previous"].shift())
    .cumsum()
)

df["plateau_group"] = group_id

plateau_lengths = (
    df.groupby("plateau_group")
    .size()
)

df["plateau_length"] = (
    df["plateau_group"]
    .map(plateau_lengths)
)

df["long_plateau"] = (
    df["plateau_length"] >= 24
)

# ------------------------------------------------------------
# 5. FLAG THE TWO STRONGEST SUSPICIOUS PLATEAUS
# ------------------------------------------------------------

df["known_plateau_value"] = (
    df["water_level"]
    .isin([58.2, 93.2])
)

# ------------------------------------------------------------
# 6. CREATE QUALITY FLAG
# ------------------------------------------------------------

df["quality_flag"] = "OK"

df.loc[
    df["target_missing"],
    "quality_flag"
] = "MISSING"

df.loc[
    df["large_jump"],
    "quality_flag"
] = "LARGE_JUMP"

df.loc[
    df["long_plateau"],
    "quality_flag"
] = "LONG_PLATEAU"

# Keep known plateau values visible
# but do not automatically delete them.

df.loc[
    df["known_plateau_value"] &
    (df["quality_flag"] == "OK"),
    "quality_flag"
] = "KNOWN_PLATEAU_VALUE"

# ------------------------------------------------------------
# 7. SUMMARY
# ------------------------------------------------------------

print("\n" + "=" * 70)
print("QUALITY SUMMARY")
print("=" * 70)

print(
    "\nMissing:",
    df["target_missing"].sum()
)

print(
    "Large jumps:",
    df["large_jump"].sum()
)

print(
    "Long plateaus:",
    df["long_plateau"].sum()
)

print(
    "Known plateau values (58.2 / 93.2):",
    df["known_plateau_value"].sum()
)

print("\nQuality flag counts:")

print(
    df["quality_flag"]
    .value_counts()
    .to_string()
)

# ------------------------------------------------------------
# 8. CREATE TARGET-READY DATA
# ------------------------------------------------------------

# For the prototype target we exclude:
# - missing measurements
# - extreme single-reading jumps
# - very long constant plateaus
#
# We keep the raw dataset unchanged.

target_ready = df[
    (~df["target_missing"]) &
    (~df["large_jump"]) &
    (~df["long_plateau"])
].copy()

print("\n" + "=" * 70)
print("TARGET-READY DATA")
print("=" * 70)

print(
    "Original records:",
    len(df)
)

print(
    "Target-ready records:",
    len(target_ready)
)

print(
    "Removed/flagged records:",
    len(df) - len(target_ready)
)

# ------------------------------------------------------------
# 9. TARGET-READY DISTRIBUTION
# ------------------------------------------------------------

print("\nTarget-ready water-level distribution:")

percentiles = [
    25,
    50,
    75,
    90,
    95,
    97,
    98,
    99
]

for p in percentiles:

    value = np.percentile(
        target_ready["water_level"],
        p
    )

    print(
        f"{p:>3}% percentile : {value:.3f} m"
    )

# ------------------------------------------------------------
# 10. SAVE
# ------------------------------------------------------------

target_ready.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\nSaved:")
print(OUTPUT_FILE)

print("\n" + "=" * 70)
print("STEP 12 COMPLETED")
print("=" * 70)