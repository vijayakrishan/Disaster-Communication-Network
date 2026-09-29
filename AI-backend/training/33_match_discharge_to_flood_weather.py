import pandas as pd
import numpy as np
import os

print("=" * 70)
print("RESQMESH - MATCH RIVER DISCHARGE WITH FLOOD WEATHER DATA")
print("=" * 70)

# ============================================================
# FILES
# ============================================================

WEATHER_FILE = r"data\processed\event_labeled_weather.csv"

DISCHARGE_FILE = (
    r"data\processed\tn_river_discharge_features_final.csv"
)

OUTPUT_FILE = (
    r"data\processed\event_weather_discharge.csv"
)

# ============================================================
# LOAD WEATHER / FLOOD DATA
# ============================================================

print("\nLoading event-labeled weather data...")

weather = pd.read_csv(
    WEATHER_FILE,
    low_memory=False
)

weather["time"] = pd.to_datetime(
    weather["time"],
    errors="coerce"
)

print(
    f"Weather rows: {len(weather):,}"
)

print(
    f"Weather cities: {weather['city'].nunique():,}"
)

# ============================================================
# LOAD DISCHARGE
# ============================================================

print("\nLoading river discharge features...")

discharge = pd.read_csv(
    DISCHARGE_FILE,
    low_memory=False
)

discharge["Data Acquisition Time"] = pd.to_datetime(
    discharge["Data Acquisition Time"],
    errors="coerce"
)

print(
    f"Discharge rows: {len(discharge):,}"
)

print(
    f"Discharge stations: "
    f"{discharge['Station'].nunique():,}"
)

# ============================================================
# REMOVE INVALID DATES
# ============================================================

weather = weather.dropna(
    subset=["time"]
).copy()

discharge = discharge.dropna(
    subset=["Data Acquisition Time"]
).copy()

# ============================================================
# CREATE DATE COLUMNS
# ============================================================

weather["date"] = weather[
    "time"
].dt.normalize()

discharge["date"] = discharge[
    "Data Acquisition Time"
].dt.normalize()

# ============================================================
# FLOOD EVENT SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("FLOOD EVENT DISTRIBUTION")
print("=" * 70)

print(
    weather[
        "flood_event"
    ]
    .value_counts(
        dropna=False
    )
    .sort_index()
)

print("\nEvent IDs:")

# event_labeled_weather.csv does not contain
# event_start/event_end/event_location.
# Therefore only use columns actually present.

event_columns = [
    col
    for col in [
        "event_id",
        "flood_event"
    ]
    if col in weather.columns
]

print(
    weather[
        event_columns
    ]
    .drop_duplicates()
    .sort_values(
        event_columns
    )
    .to_string(index=False)
)

# ============================================================
# DISCHARGE DAILY AGGREGATION
# ============================================================

print("\n" + "=" * 70)
print("AGGREGATING DISCHARGE BY STATION AND DAY")
print("=" * 70)

daily_discharge = (
    discharge
    .groupby(
        [
            "Station",
            "District",
            "River",
            "Basin",
            "Latitude",
            "Longitude",
            "date"
        ],
        as_index=False
    )
    .agg(
        river_discharge=(
            "river_discharge",
            "mean"
        ),
        discharge_change_1d=(
            "discharge_change_1d",
            "mean"
        ),
        discharge_change_3d=(
            "discharge_change_3d",
            "mean"
        ),
        discharge_change_7d=(
            "discharge_change_7d",
            "mean"
        ),
        discharge_3d_mean=(
            "discharge_3d_mean",
            "mean"
        ),
        discharge_7d_mean=(
            "discharge_7d_mean",
            "mean"
        ),
        discharge_7d_max=(
            "discharge_7d_max",
            "max"
        ),
        discharge_7d_min=(
            "discharge_7d_min",
            "min"
        ),
        discharge_30d_mean=(
            "discharge_30d_mean",
            "mean"
        )
    )
)

print(
    f"Daily discharge records: "
    f"{len(daily_discharge):,}"
)

# ============================================================
# CITY COORDINATES
# ============================================================

print("\n" + "=" * 70)
print("LOCATION MATCHING")
print("=" * 70)

CITY_COORDS = {
    "Chennai": (13.0827, 80.2707),
    "Coimbatore": (11.0168, 76.9558),
    "Cuddalore": (11.7480, 79.7714),
    "Dharmapuri": (12.1211, 78.1582),
    "Dindigul": (10.3673, 77.9803),
    "Erode": (11.3410, 77.7172),
    "Kanchipuram": (12.8342, 79.7036),
    "Kanyakumari": (8.0883, 77.5385),
    "Karur": (10.9601, 78.0766),
    "Krishnagiri": (12.5186, 78.2137),
    "Madurai": (9.9252, 78.1198),
    "Nagapattinam": (10.7672, 79.8449),
    "Namakkal": (11.2194, 78.1677),
    "Perambalur": (11.2320, 78.8801),
    "Pudukkottai": (10.3833, 78.8001),
    "Ramanathapuram": (9.3639, 78.8395),
    "Salem": (11.6643, 78.1460),
    "Sivaganga": (9.8433, 78.4809),
    "Thanjavur": (10.7867, 79.1378),
    "Theni": (10.0104, 77.4768),
    "Thoothukudi": (8.7642, 78.1348),
    "Tiruchirappalli": (10.7905, 78.7047),
    "Tirunelveli": (8.7139, 77.7567),
    "Tiruppur": (11.1085, 77.3411),
    "Tiruvallur": (13.1439, 79.9080),
    "Tiruvannamalai": (12.2253, 79.0747),
    "Tiruvarur": (10.7661, 79.6393),
    "Vellore": (12.9165, 79.1325),
    "Viluppuram": (11.9401, 79.4861),
    "Virudhunagar": (9.5680, 77.9624),
    "Nilgiris": (11.4102, 76.6950),
    "Tenkasi": (8.9591, 77.3152)
}

# ============================================================
# NORMALIZE CITY NAMES
# ============================================================

def normalize_city(name):

    if pd.isna(name):
        return None

    name = str(name).strip()

    aliases = {
        "Tirupur": "Tiruppur",
        "Tiruchirapalli": "Tiruchirappalli",
        "Tuticorin": "Thoothukudi",
        "Thoothukkudi": "Thoothukudi",
        "Pudukottai": "Pudukkottai"
    }

    return aliases.get(
        name,
        name
    )


weather["city_normalized"] = (
    weather["city"]
    .apply(normalize_city)
)

# ============================================================
# WEATHER COORDINATES
# ============================================================

weather["weather_latitude"] = (
    weather["city_normalized"]
    .map(
        lambda x:
        CITY_COORDS[x][0]
        if x in CITY_COORDS
        else np.nan
    )
)

weather["weather_longitude"] = (
    weather["city_normalized"]
    .map(
        lambda x:
        CITY_COORDS[x][1]
        if x in CITY_COORDS
        else np.nan
    )
)

missing_coordinates = weather[
    "weather_latitude"
].isna().sum()

print(
    f"\nWeather rows without city coordinates: "
    f"{missing_coordinates:,}"
)

if missing_coordinates > 0:

    print("\nCities without coordinates:")

    print(
        weather.loc[
            weather["weather_latitude"].isna(),
            "city"
        ]
        .drop_duplicates()
        .to_string(index=False)
    )

# ============================================================
# STATION COORDINATES
# ============================================================

stations = (
    daily_discharge[
        [
            "Station",
            "District",
            "River",
            "Basin",
            "Latitude",
            "Longitude"
        ]
    ]
    .drop_duplicates(
        subset=["Station"]
    )
    .dropna(
        subset=[
            "Latitude",
            "Longitude"
        ]
    )
    .reset_index(drop=True)
)

print(
    f"\nStations with coordinates: "
    f"{len(stations):,}"
)

# ============================================================
# HAVERSINE DISTANCE
# ============================================================

def haversine_km(
    lat1,
    lon1,
    lat2,
    lon2
):

    lat1 = np.radians(lat1)
    lon1 = np.radians(lon1)

    lat2 = np.radians(lat2)
    lon2 = np.radians(lon2)

    dlat = lat2 - lat1
    dlon = lon2 - lon1

    a = (
        np.sin(dlat / 2) ** 2
        +
        np.cos(lat1)
        * np.cos(lat2)
        * np.sin(dlon / 2) ** 2
    )

    return (
        6371
        * 2
        * np.arcsin(
            np.sqrt(a)
        )
    )

# ============================================================
# FIND NEAREST STATION
# ============================================================

print(
    "\nFinding nearest CWC station "
    "for every weather city..."
)

city_station_matches = []

for city in weather[
    "city_normalized"
].dropna().unique():

    if city not in CITY_COORDS:
        continue

    city_lat, city_lon = CITY_COORDS[city]

    distances = haversine_km(
        city_lat,
        city_lon,
        stations["Latitude"].values,
        stations["Longitude"].values
    )

    nearest_index = np.argmin(
        distances
    )

    nearest_station = stations.iloc[
        nearest_index
    ]

    nearest_distance = distances[
        nearest_index
    ]

    city_station_matches.append(
        {
            "city_normalized": city,
            "weather_latitude": city_lat,
            "weather_longitude": city_lon,
            "matched_station": nearest_station[
                "Station"
            ],
            "matched_station_district":
                nearest_station[
                    "District"
                ],
            "matched_station_river":
                nearest_station[
                    "River"
                ],
            "matched_station_latitude":
                nearest_station[
                    "Latitude"
                ],
            "matched_station_longitude":
                nearest_station[
                    "Longitude"
                ],
            "station_distance_km":
                nearest_distance
        }
    )

city_matches = pd.DataFrame(
    city_station_matches
)

print(
    f"Cities matched: "
    f"{len(city_matches):,}"
)

print("\nNearest station mapping:")

print(
    city_matches.to_string(
        index=False
    )
)

# ============================================================
# DISTANCE SUMMARY
# ============================================================

print("\n" + "=" * 70)
print("MATCH DISTANCE SUMMARY")
print("=" * 70)

print(
    city_matches[
        "station_distance_km"
    ].describe()
)

# ============================================================
# MERGE CITY → STATION
# ============================================================

weather = weather.merge(
    city_matches[
        [
            "city_normalized",
            "matched_station",
            "station_distance_km"
        ]
    ],
    on="city_normalized",
    how="left"
)

# ============================================================
# PREPARE DAILY DISCHARGE
# ============================================================

daily_discharge = daily_discharge.rename(
    columns={
        "Station": "matched_station"
    }
)

# ============================================================
# MERGE WEATHER + DISCHARGE
# ============================================================

print("\n" + "=" * 70)
print("MATCHING DAILY DISCHARGE")
print("=" * 70)

weather_discharge = weather.merge(
    daily_discharge,
    on=[
        "matched_station",
        "date"
    ],
    how="left",
    suffixes=(
        "",
        "_discharge"
    )
)

# ============================================================
# MATCH STATISTICS
# ============================================================

print(
    f"\nWeather rows after merge: "
    f"{len(weather_discharge):,}"
)

matched_count = (
    weather_discharge[
        "river_discharge"
    ]
    .notna()
    .sum()
)

print(
    f"Rows with matched discharge: "
    f"{matched_count:,}"
)

print(
    f"Rows without matched discharge: "
    f"{len(weather_discharge) - matched_count:,}"
)

print(
    f"Discharge match rate: "
    f"{matched_count / len(weather_discharge) * 100:.2f}%"
)

# ============================================================
# FLOOD EVENT COVERAGE
# ============================================================

print("\n" + "=" * 70)
print("FLOOD EVENT DISCHARGE COVERAGE")
print("=" * 70)

event_rows = weather_discharge[
    weather_discharge["flood_event"] == 1
].copy()

print(
    f"Flood-event rows: "
    f"{len(event_rows):,}"
)

if len(event_rows) > 0:

    event_matched = (
        event_rows[
            "river_discharge"
        ]
        .notna()
        .sum()
    )

    print(
        f"Flood-event rows with discharge: "
        f"{event_matched:,}"
    )

    print(
        f"Flood-event discharge coverage: "
        f"{event_matched / len(event_rows) * 100:.2f}%"
    )

# ============================================================
# SAVE
# ============================================================

os.makedirs(
    os.path.dirname(OUTPUT_FILE),
    exist_ok=True
)

weather_discharge.to_csv(
    OUTPUT_FILE,
    index=False
)

print("\n" + "=" * 70)
print("FILE SAVED")
print("=" * 70)

print(
    OUTPUT_FILE
)

print("\n" + "=" * 70)
print("STEP 33 COMPLETE")
print("=" * 70)