import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

INPUT_FILE = os.path.join(
    BASE_DIR,
    "data",
    "processed",
    "flood_weather_matched.csv"
)

print("=" * 70)
print("RESQMESH - FLOOD WEATHER ANALYSIS")
print("=" * 70)

df = pd.read_csv(INPUT_FILE)

print("\nDataset shape:")
print(df.shape)

print("\nColumns:")
print(df.columns.tolist())

# ---------------------------------------------------------
# BASIC INFORMATION
# ---------------------------------------------------------

print("\nMissing values:")
print(
    df.isnull()
    .sum()
    .sort_values(ascending=False)
)

print("\nCities:")
print(
    df["city"]
    .nunique()
)

print(
    df["city"]
    .value_counts()
)

# ---------------------------------------------------------
# DATE RANGE
# ---------------------------------------------------------

df["time"] = pd.to_datetime(
    df["time"],
    errors="coerce"
)

print("\nTime range:")
print("Start:", df["time"].min())
print("End  :", df["time"].max())

# ---------------------------------------------------------
# FLOOD EVENTS
# ---------------------------------------------------------

print("\nEvent distribution:")
print(
    df["event_id"]
    .value_counts()
    .sort_index()
)

print("\nEvent dates:")

for event_id, group in df.groupby("event_id"):

    print(
        f"Event {event_id}: "
        f"{group['time'].min()} -> "
        f"{group['time'].max()}"
    )

# ---------------------------------------------------------
# WEATHER STATISTICS
# ---------------------------------------------------------

numeric_columns = [
    "temperature_2m",
    "relative_humidity_2m",
    "dew_point_2m",
    "precipitation",
    "rain",
    "surface_pressure",
    "cloud_cover",
    "cloud_cover_low",
    "wind_speed_10m",
    "wind_direction_10m"
]

print("\n" + "=" * 70)
print("FLOOD-PERIOD WEATHER STATISTICS")
print("=" * 70)

available_numeric = [
    c for c in numeric_columns
    if c in df.columns
]

print(
    df[available_numeric]
    .describe()
    .T
    .to_string()
)

# ---------------------------------------------------------
# CITY-LEVEL STATISTICS
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("CITY-LEVEL FLOOD PERIOD STATISTICS")
print("=" * 70)

city_stats = (
    df.groupby("city")
    .agg(
        records=("city", "size"),
        avg_temperature=("temperature_2m", "mean"),
        max_temperature=("temperature_2m", "max"),
        avg_humidity=("relative_humidity_2m", "mean"),
        max_rain=("rain", "max"),
        total_precipitation=("precipitation", "sum"),
        avg_pressure=("surface_pressure", "mean"),
        max_wind=("wind_speed_10m", "max")
    )
    .sort_values(
        "total_precipitation",
        ascending=False
    )
)

print(city_stats.to_string())

# ---------------------------------------------------------
# RAINFALL EXTREMES
# ---------------------------------------------------------

print("\n" + "=" * 70)
print("HIGHEST RAINFALL OBSERVATIONS")
print("=" * 70)

print(
    df[
        [
            "time",
            "city",
            "rain",
            "precipitation",
            "relative_humidity_2m"
        ]
    ]
    .sort_values("rain", ascending=False)
    .head(30)
    .to_string(index=False)
)

# ---------------------------------------------------------
# SAVE CITY STATISTICS
# ---------------------------------------------------------

output_file = os.path.join(
    BASE_DIR,
    "data",
    "processed",
    "flood_weather_city_statistics.csv"
)

city_stats.to_csv(output_file)

print("\nSaved:")
print(output_file)

print("\nAnalysis complete.")