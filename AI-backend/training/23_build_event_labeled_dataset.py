import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

WEATHER_FILE = os.path.join(
    BASE_DIR,
    "data",
    "raw",
    "TNweather_1.8M.csv"
)

EVENT_FILE = os.path.join(
    BASE_DIR,
    "data",
    "processed",
    "tamil_nadu_flood_events.csv"
)

OUTPUT_FILE = os.path.join(
    BASE_DIR,
    "data",
    "processed",
    "event_labeled_weather.csv"
)

print("=" * 70)
print("RESQMESH - BUILD EVENT-LABELED WEATHER DATASET")
print("=" * 70)

# ---------------------------------------------------------
# LOAD DATA
# ---------------------------------------------------------

weather = pd.read_csv(
    WEATHER_FILE,
    low_memory=False
)

events = pd.read_csv(EVENT_FILE)

weather["time"] = pd.to_datetime(
    weather["time"],
    errors="coerce"
)

weather = weather.dropna(
    subset=["time"]
).copy()

print("\nWeather rows:", len(weather))
print("Cities:", weather["city"].nunique())

# ---------------------------------------------------------
# CLEAN WEATHER FEATURES
# ---------------------------------------------------------

numeric_features = [
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

for col in numeric_features:
    weather[col] = pd.to_numeric(
        weather[col],
        errors="coerce"
    )

# ---------------------------------------------------------
# QUALITY FILTERS
# ---------------------------------------------------------

# Physically reasonable prototype ranges.
# Values outside these ranges are marked missing,
# not automatically deleted.

weather.loc[
    (weather["relative_humidity_2m"] < 0) |
    (weather["relative_humidity_2m"] > 100),
    "relative_humidity_2m"
] = pd.NA

weather.loc[
    (weather["cloud_cover"] < 0) |
    (weather["cloud_cover"] > 100),
    "cloud_cover"
] = pd.NA

weather.loc[
    (weather["cloud_cover_low"] < 0) |
    (weather["cloud_cover_low"] > 100),
    "cloud_cover_low"
] = pd.NA

weather.loc[
    (weather["rain"] < 0),
    "rain"
] = pd.NA

weather.loc[
    (weather["precipitation"] < 0),
    "precipitation"
] = pd.NA

weather.loc[
    (weather["wind_speed_10m"] < 0),
    "wind_speed_10m"
] = pd.NA

# ---------------------------------------------------------
# EVENT LABELING
# ---------------------------------------------------------

weather["flood_event"] = 0
weather["event_id"] = 0

# ---------------------------------------------------------
# EVENT 1
# 2021-11-06 to 2021-11-08
#
# Source says Tamil Nadu statewide.
# We mark this as an event-period label,
# but retain event_id separately.
# ---------------------------------------------------------

mask_2021 = (
    (weather["time"] >= "2021-11-06 00:00:00") &
    (weather["time"] <= "2021-11-08 23:00:00")
)

weather.loc[
    mask_2021,
    "flood_event"
] = 1

weather.loc[
    mask_2021,
    "event_id"
] = 1

# ---------------------------------------------------------
# EVENT 2
# 2023-12-18 to 2023-12-20
#
# Source explicitly identifies:
# Thoothukudi
# Tirunelveli
# Kanniyakumari
# Tenkasi
# ---------------------------------------------------------

affected_2023 = [
    "Thoothukudi",
    "Tirunelveli",
    "Kanyakumari",
    "Tenkasi"
]

mask_2023_time = (
    (weather["time"] >= "2023-12-18 00:00:00") &
    (weather["time"] <= "2023-12-20 23:00:00")
)

mask_2023_city = weather["city"].isin(
    affected_2023
)

mask_2023 = (
    mask_2023_time &
    mask_2023_city
)

weather.loc[
    mask_2023,
    "flood_event"
] = 1

weather.loc[
    mask_2023,
    "event_id"
] = 2

# ---------------------------------------------------------
# IMPORTANT: REMOVE THE 2023 NON-AFFECTED CITIES
# FROM THE NEGATIVE CLASS DURING THE EVENT WINDOW.
#
# We don't know whether those cities were truly
# unaffected; therefore they should not become
# automatic NO_FLOOD examples.
# ---------------------------------------------------------

uncertain_2023 = (
    mask_2023_time &
    (~mask_2023_city)
)

weather.loc[
    uncertain_2023,
    "flood_event"
] = -1
weather.loc[
    uncertain_2023,
    "event_id"
] = -1

# ---------------------------------------------------------
# REMOVE UNCERTAIN RECORDS
# ---------------------------------------------------------

dataset = weather[
    weather["flood_event"] >= 0
].copy()

print("\n" + "=" * 70)
print("LABEL DISTRIBUTION")
print("=" * 70)

print(
    dataset["flood_event"]
    .value_counts()
    .sort_index()
)

print("\nEvent distribution:")

print(
    dataset["event_id"]
    .value_counts()
    .sort_index()
)

# ---------------------------------------------------------
# POSITIVE / NEGATIVE COUNTS
# ---------------------------------------------------------

positive = dataset[
    dataset["flood_event"] == 1
]

negative = dataset[
    dataset["flood_event"] == 0
]

print("\nPositive flood samples:", len(positive))
print("Negative non-flood samples:", len(negative))

print(
    "Positive percentage:",
    round(
        len(positive) / len(dataset) * 100,
        2
    )
)

# ---------------------------------------------------------
# CHECK POSITIVE CITIES
# ---------------------------------------------------------

print("\nCities containing positive samples:")

print(
    positive["city"]
    .value_counts()
)

# ---------------------------------------------------------
# ADD TIME FEATURES
# ---------------------------------------------------------

dataset["hour"] = dataset["time"].dt.hour
dataset["month"] = dataset["time"].dt.month
dataset["day_of_year"] = dataset["time"].dt.dayofyear

dataset["hour_sin"] = (
    __import__("numpy").sin(
        2 * __import__("numpy").pi *
        dataset["hour"] / 24
    )
)

dataset["hour_cos"] = (
    __import__("numpy").cos(
        2 * __import__("numpy").pi *
        dataset["hour"] / 24
    )
)

dataset["month_sin"] = (
    __import__("numpy").sin(
        2 * __import__("numpy").pi *
        dataset["month"] / 12
    )
)

dataset["month_cos"] = (
    __import__("numpy").cos(
        2 * __import__("numpy").pi *
        dataset["month"] / 12
    )
)

# ---------------------------------------------------------
# SAVE
# ---------------------------------------------------------

dataset.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\nSaved:")
print(OUTPUT_FILE)

print("\nFinal shape:", dataset.shape)

print("\nFirst rows:")
print(
    dataset[
        [
            "time",
            "city",
            "temperature_2m",
            "relative_humidity_2m",
            "rain",
            "surface_pressure",
            "wind_speed_10m",
            "flood_event",
            "event_id"
        ]
    ]
    .head(20)
    .to_string(index=False)
)

print("\nDataset creation complete.")