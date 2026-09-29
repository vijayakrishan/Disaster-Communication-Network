import pandas as pd
import os

DATA_DIR = "data/raw"
OUTPUT_DIR = "data/processed"

os.makedirs(OUTPUT_DIR, exist_ok=True)

FILE = os.path.join(
    DATA_DIR,
    "rwl_tel_hr_tamil_nadu_sw_gw_27_2021_2025.csv"
)

print("\nLoading water-level dataset...")

df = pd.read_csv(FILE)

water_col = "River Water Level Telemetry Hourly (meter)"

# Convert timestamp
df["timestamp"] = pd.to_datetime(
    df["Data Acquisition Time"],
    format="%d-%m-%Y %H:%M",
    errors="coerce"
)

# Keep only Parthibanur Regulator
df = df[
    df["Station"] == "Parthibanur Regulator"
].copy()

print("\nParthibanur records:", len(df))

# Sort chronologically
df = df.sort_values("timestamp")

# Remove impossible negative values
df.loc[
    df[water_col] < 0,
    water_col
] = pd.NA

# Rename measurement
df["water_level"] = df[water_col]

# Create water-level change features
df["water_level_change_1"] = (
    df["water_level"] -
    df["water_level"].shift(1)
)

df["water_level_change_3"] = (
    df["water_level"] -
    df["water_level"].shift(3)
)

# Keep useful columns
output = df[
    [
        "Station",
        "District",
        "Latitude",
        "Longitude",
        "timestamp",
        "water_level",
        "water_level_change_1",
        "water_level_change_3"
    ]
].copy()

output_file = os.path.join(
    OUTPUT_DIR,
    "water_level_parthibanur.csv"
)

output.to_csv(
    output_file,
    index=False
)

print("\nSaved:")
print(output_file)

print("\nRows:", len(output))

print("\nMissing values:")
print(output.isna().sum())

print("\nWater-level statistics:")
print(output["water_level"].describe())

print("\nFirst 10 rows:")
print(output.head(10))

print("\n" + "=" * 70)
print("WATER LEVEL PREPARATION COMPLETED")
print("=" * 70)