import pandas as pd
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[1]
PROCESSED_DIR = BASE_DIR / "data" / "processed"

TEMP_FILE = PROCESSED_DIR / "temperature_clean.csv"
RAIN_FILE = PROCESSED_DIR / "rainfall_clean.csv"
PRESSURE_FILE = PROCESSED_DIR / "pressure_clean.csv"
WATER_FILE = PROCESSED_DIR / "water_level_parthibanur.csv"

OUTPUT_FILE = PROCESSED_DIR / "environmental_combined.csv"

print("=" * 70)
print("COMBINING ENVIRONMENTAL DATA")
print("=" * 70)

print("\nLoading temperature...")
temperature = pd.read_csv(TEMP_FILE)
print("Temperature rows:", len(temperature))

print("\nLoading rainfall...")
rainfall = pd.read_csv(RAIN_FILE)
print("Rainfall rows:", len(rainfall))

print("\nLoading pressure...")
pressure = pd.read_csv(PRESSURE_FILE)
print("Pressure rows:", len(pressure))

print("\nLoading water level...")
water = pd.read_csv(WATER_FILE)
print("Water-level rows:", len(water))

print("\nConverting timestamps...")

temperature["timestamp"] = pd.to_datetime(
    temperature["timestamp"],
    errors="coerce"
)

rainfall["timestamp"] = pd.to_datetime(
    rainfall["timestamp"],
    errors="coerce"
)

pressure["timestamp"] = pd.to_datetime(
    pressure["timestamp"],
    errors="coerce"
)

water["timestamp"] = pd.to_datetime(
    water["timestamp"],
    errors="coerce"
)

temperature = temperature.dropna(subset=["timestamp"]).copy()
rainfall = rainfall.dropna(subset=["timestamp"]).copy()
pressure = pressure.dropna(subset=["timestamp"]).copy()
water = water.dropna(subset=["timestamp"]).copy()

print("\nFiltering Parthibanur Regulator...")

station_name = "parthibanur regulator"

temperature = temperature[
    temperature["Station"].astype(str).str.strip().str.lower()
    == station_name
].copy()

rainfall = rainfall[
    rainfall["Station"].astype(str).str.strip().str.lower()
    == station_name
].copy()

pressure = pressure[
    pressure["Station"].astype(str).str.strip().str.lower()
    == station_name
].copy()

water = water[
    water["Station"].astype(str).str.strip().str.lower()
    == station_name
].copy()

print("Temperature Parthibanur rows:", len(temperature))
print("Rainfall Parthibanur rows:", len(rainfall))
print("Pressure Parthibanur rows:", len(pressure))
print("Water-level Parthibanur rows:", len(water))

temperature = temperature[
    ["timestamp", "temperature"]
].copy()

rainfall = rainfall[
    ["timestamp", "rainfall"]
].copy()

pressure = pressure[
    ["timestamp", "pressure"]
].copy()

water = water[
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

temperature = temperature.sort_values("timestamp")
rainfall = rainfall.sort_values("timestamp")
pressure = pressure.sort_values("timestamp")
water = water.sort_values("timestamp")

print("\n" + "=" * 70)
print("TIMESTAMP RANGES")
print("=" * 70)

print(
    "\nTemperature:",
    temperature["timestamp"].min(),
    "to",
    temperature["timestamp"].max()
)

print(
    "Rainfall:",
    rainfall["timestamp"].min(),
    "to",
    rainfall["timestamp"].max()
)

print(
    "Pressure:",
    pressure["timestamp"].min(),
    "to",
    pressure["timestamp"].max()
)

print(
    "Water level:",
    water["timestamp"].min(),
    "to",
    water["timestamp"].max()
)

print("\n" + "=" * 70)
print("EXACT TIMESTAMP OVERLAP")
print("=" * 70)

temp_times = set(temperature["timestamp"])
rain_times = set(rainfall["timestamp"])
pressure_times = set(pressure["timestamp"])
water_times = set(water["timestamp"])

common_times = (
    temp_times
    & rain_times
    & pressure_times
    & water_times
)

print(
    "\nExact timestamps available in all four datasets:",
    len(common_times)
)

print("\nCombining datasets...")

combined = water.copy()

combined = pd.merge_asof(
    combined.sort_values("timestamp"),
    temperature.sort_values("timestamp"),
    on="timestamp",
    direction="nearest",
    tolerance=pd.Timedelta("1 hour")
)

combined = pd.merge_asof(
    combined.sort_values("timestamp"),
    rainfall.sort_values("timestamp"),
    on="timestamp",
    direction="nearest",
    tolerance=pd.Timedelta("1 hour")
)

combined = pd.merge_asof(
    combined.sort_values("timestamp"),
    pressure.sort_values("timestamp"),
    on="timestamp",
    direction="nearest",
    tolerance=pd.Timedelta("1 hour")
)

print("\nCreating rainfall features...")

combined = combined.sort_values("timestamp").reset_index(drop=True)

combined["rainfall"] = pd.to_numeric(
    combined["rainfall"],
    errors="coerce"
)

combined["rainfall_6h"] = (
    combined["rainfall"]
    .rolling(window=6, min_periods=1)
    .sum()
)

combined["rainfall_24h"] = (
    combined["rainfall"]
    .rolling(window=24, min_periods=1)
    .sum()
)

print("\n" + "=" * 70)
print("MISSING VALUES AFTER COMBINATION")
print("=" * 70)

important_columns = [
    "temperature",
    "rainfall",
    "pressure",
    "water_level",
    "water_level_change_1",
    "water_level_change_3",
    "rainfall_6h",
    "rainfall_24h"
]

print(
    combined[important_columns].isna().sum()
)

combined.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 70)
print("COMBINED DATASET SAVED")
print("=" * 70)

print("\nFile:")
print(OUTPUT_FILE)

print("\nRows:", len(combined))

print("\nColumns:")

for column in combined.columns:
    print(" -", column)

print("\n" + "=" * 70)
print("FIRST 10 ROWS")
print("=" * 70)

print(
    combined.head(10).to_string(index=False)
)

print("\n" + "=" * 70)
print("STEP 5 COMPLETED")
print("=" * 70)