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
    "flood_weather_matched.csv"
)

print("=" * 70)
print("RESQMESH - FLOOD EVENT / WEATHER MATCHING")
print("=" * 70)

# ---------------------------------------------------------
# LOAD FLOOD EVENTS
# ---------------------------------------------------------

events = pd.read_csv(EVENT_FILE)

print("\nFlood event records:", len(events))

# Keep only events inside weather dataset period
events = events[
    (events["Start Year"] >= 2020) &
    (events["Start Year"] <= 2025)
].copy()

print("Events within 2020-2025:", len(events))

# ---------------------------------------------------------
# CREATE EVENT DATES
# ---------------------------------------------------------

def make_date(row, year_col, month_col, day_col):
    year = row[year_col]
    month = row[month_col]
    day = row[day_col]

    if pd.isna(year) or pd.isna(month):
        return pd.NaT

    if pd.isna(day):
        day = 1

    try:
        return pd.Timestamp(
            year=int(year),
            month=int(month),
            day=int(day)
        )
    except:
        return pd.NaT


events["start_date"] = events.apply(
    lambda row: make_date(
        row,
        "Start Year",
        "Start Month",
        "Start Day"
    ),
    axis=1
)

events["end_date"] = events.apply(
    lambda row: make_date(
        row,
        "End Year",
        "End Month",
        "End Day"
    ),
    axis=1
)

# If end date is unavailable, use start date
events["end_date"] = events["end_date"].fillna(
    events["start_date"]
)

print("\nEvents used for matching:")

for _, row in events.iterrows():
    print(
        f"{row['start_date'].date()} -> "
        f"{row['end_date'].date()} | "
        f"{row['Location']}"
    )

# ---------------------------------------------------------
# LOAD WEATHER DATA
# ---------------------------------------------------------

print("\nLoading weather dataset...")

weather = pd.read_csv(
    WEATHER_FILE,
    low_memory=False
)

print("Weather rows:", len(weather))

print("\nWeather columns:")
print(weather.columns.tolist())

# ---------------------------------------------------------
# CONVERT TIME
# ---------------------------------------------------------

weather["time"] = pd.to_datetime(
    weather["time"],
    errors="coerce"
)

weather = weather.dropna(
    subset=["time"]
).copy()

# ---------------------------------------------------------
# MATCH FLOOD PERIODS
# ---------------------------------------------------------

matched_parts = []

for event_id, (_, event) in enumerate(events.iterrows(), start=1):

    start = event["start_date"]
    end = event["end_date"] + pd.Timedelta(days=1) - pd.Timedelta(seconds=1)

    mask = (
        (weather["time"] >= start) &
        (weather["time"] <= end)
    )

    matched = weather.loc[mask].copy()

    if len(matched) == 0:
        continue

    matched["flood_event"] = 1
    matched["event_id"] = event_id
    matched["event_start"] = start
    matched["event_end"] = event["end_date"]
    matched["event_location"] = event["Location"]

    matched_parts.append(matched)

    print(
        f"\nEvent {event_id}: "
        f"{start.date()} -> {event['end_date'].date()}"
    )

    print("Matched weather rows:", len(matched))

# ---------------------------------------------------------
# COMBINE
# ---------------------------------------------------------

if matched_parts:

    result = pd.concat(
        matched_parts,
        ignore_index=True
    )

else:

    result = pd.DataFrame()

print("\n" + "=" * 70)
print("MATCHING RESULT")
print("=" * 70)

print("Total matched weather rows:", len(result))

if len(result) > 0:

    print("\nWeather rows by city:")

    print(
        result["city"]
        .value_counts()
        .head(20)
    )

    print("\nWeather rows by event:")

    print(
        result["event_id"]
        .value_counts()
        .sort_index()
    )

    result.to_csv(
        OUTPUT_FILE,
        index=False
    )

    print("\nSaved:")
    print(OUTPUT_FILE)

else:

    print("\nNo weather records matched the flood periods.")

print("\nInspection complete.")