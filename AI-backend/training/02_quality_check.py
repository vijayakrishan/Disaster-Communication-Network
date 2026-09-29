import pandas as pd
import os

DATA_DIR = "data/raw"


def check_temperature():
    file = os.path.join(
        DATA_DIR,
        "temprature_tel_hr_tamil_nadu_sw_gw_tn_2021_2025.csv"
    )

    print("\n" + "=" * 80)
    print("TEMPERATURE QUALITY CHECK")
    print("=" * 80)

    df = pd.read_csv(file)

    col = "Air Temperature Telemetry Hourly (ºC)"

    print("Rows:", len(df))
    print("Minimum:", df[col].min())
    print("Maximum:", df[col].max())

    print("\nSuspicious temperature values:")

    suspicious = df[
        (df[col] < -20) |
        (df[col] > 60)
    ]

    print("Count:", len(suspicious))

    print("\nExamples:")
    print(
        suspicious[
            [
                "Station",
                "District",
                "Data Acquisition Time",
                col
            ]
        ].head(20)
    )


def check_rainfall():
    file = os.path.join(
        DATA_DIR,
        "rainfall_tel_hr_tamil_nadu_sw_gw_tn_2021_2025.csv"
    )

    print("\n" + "=" * 80)
    print("RAINFALL QUALITY CHECK")
    print("=" * 80)

    df = pd.read_csv(file)

    col = "Telemetry Hourly Rainfall (mm)"

    print("Rows:", len(df))
    print("Minimum:", df[col].min())
    print("Maximum:", df[col].max())

    print("\nSuspicious rainfall values:")

    suspicious = df[
        (df[col] < 0) |
        (df[col] > 300)
    ]

    print("Count:", len(suspicious))

    print("\nExamples:")
    print(
        suspicious[
            [
                "Station",
                "District",
                "Data Acquisition Time",
                col
            ]
        ].head(20)
    )


def check_pressure():
    file = os.path.join(
        DATA_DIR,
        "pressure_tel_hr_tamil_nadu_sw_gw_tn_2025_2025.csv"
    )

    print("\n" + "=" * 80)
    print("PRESSURE QUALITY CHECK")
    print("=" * 80)

    df = pd.read_csv(file)

    col = "Telemetry_Hourly_Atmospheric Pressure (mb)"

    print("Rows:", len(df))
    print("Minimum:", df[col].min())
    print("Maximum:", df[col].max())

    suspicious = df[
        (df[col] < 850) |
        (df[col] > 1100)
    ]

    print("\nSuspicious pressure values:")
    print("Count:", len(suspicious))

    print("\nExamples:")
    print(
        suspicious[
            [
                "Station",
                "District",
                "Data Acquisition Time",
                col
            ]
        ].head(20)
    )


def check_water_level():
    file = os.path.join(
        DATA_DIR,
        "rwl_tel_hr_tamil_nadu_sw_gw_27_2021_2025.csv"
    )

    print("\n" + "=" * 80)
    print("WATER LEVEL QUALITY CHECK")
    print("=" * 80)

    df = pd.read_csv(file)

    col = "River Water Level Telemetry Hourly (meter)"

    print("Rows:", len(df))
    print("Minimum:", df[col].min())
    print("Maximum:", df[col].max())

    print("\nWater level by station:")

    print(
        df.groupby("Station")[col]
        .agg(["count", "min", "max", "mean"])
    )


def check_station_overlap():

    print("\n" + "=" * 80)
    print("STATION OVERLAP CHECK")
    print("=" * 80)

    temperature = pd.read_csv(
        os.path.join(
            DATA_DIR,
            "temprature_tel_hr_tamil_nadu_sw_gw_tn_2021_2025.csv"
        ),
        usecols=["Station"]
    )

    rainfall = pd.read_csv(
        os.path.join(
            DATA_DIR,
            "rainfall_tel_hr_tamil_nadu_sw_gw_tn_2021_2025.csv"
        ),
        usecols=["Station"]
    )

    pressure = pd.read_csv(
        os.path.join(
            DATA_DIR,
            "pressure_tel_hr_tamil_nadu_sw_gw_tn_2025_2025.csv"
        ),
        usecols=["Station"]
    )

    water = pd.read_csv(
        os.path.join(
            DATA_DIR,
            "rwl_tel_hr_tamil_nadu_sw_gw_27_2021_2025.csv"
        ),
        usecols=["Station"]
    )

    temp_stations = set(temperature["Station"].unique())
    rain_stations = set(rainfall["Station"].unique())
    pressure_stations = set(pressure["Station"].unique())
    water_stations = set(water["Station"].unique())

    print("\nTemperature stations:", len(temp_stations))
    print("Rainfall stations:", len(rain_stations))
    print("Pressure stations:", len(pressure_stations))
    print("Water-level stations:", len(water_stations))

    print("\nWater-level stations:")
    print(sorted(water_stations))

    print("\nStations common to ALL FOUR datasets:")

    common = (
        temp_stations
        & rain_stations
        & pressure_stations
        & water_stations
    )

    print("Count:", len(common))
    print(sorted(common))


print("\nSTARTING DATA QUALITY CHECK")

check_temperature()
check_rainfall()
check_pressure()
check_water_level()
check_station_overlap()

print("\n" + "=" * 80)
print("QUALITY CHECK COMPLETED")
print("=" * 80)