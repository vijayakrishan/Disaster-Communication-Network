import pandas as pd
import os

DATA_DIR = "data/raw"
OUTPUT_DIR = "data/processed"

os.makedirs(OUTPUT_DIR, exist_ok=True)


# ============================================================
# TEMPERATURE
# ============================================================

print("\nLoading temperature...")

temperature = pd.read_csv(
    os.path.join(
        DATA_DIR,
        "temprature_tel_hr_tamil_nadu_sw_gw_tn_2021_2025.csv"
    )
)

temp_col = "Air Temperature Telemetry Hourly (ºC)"

temperature["timestamp"] = pd.to_datetime(
    temperature["Data Acquisition Time"],
    format="%d-%m-%Y %H:%M",
    errors="coerce"
)

temperature["temperature_raw"] = temperature[temp_col]

# Prototype physical validity range
temperature.loc[
    (temperature[temp_col] < -20) |
    (temperature[temp_col] > 60),
    temp_col
] = pd.NA

temperature["temperature"] = temperature[temp_col]

temperature_clean = temperature[
    [
        "Station",
        "District",
        "Latitude",
        "Longitude",
        "timestamp",
        "temperature_raw",
        "temperature"
    ]
].copy()

temperature_clean.to_csv(
    os.path.join(
        OUTPUT_DIR,
        "temperature_clean.csv"
    ),
    index=False
)

print(
    "Temperature rows:",
    len(temperature_clean)
)

print(
    "Invalid temperature values:",
    temperature_clean["temperature"].isna().sum()
)


# ============================================================
# RAINFALL
# ============================================================

print("\nLoading rainfall...")

rainfall = pd.read_csv(
    os.path.join(
        DATA_DIR,
        "rainfall_tel_hr_tamil_nadu_sw_gw_tn_2021_2025.csv"
    )
)

rain_col = "Telemetry Hourly Rainfall (mm)"

rainfall["timestamp"] = pd.to_datetime(
    rainfall["Data Acquisition Time"],
    format="%d-%m-%Y %H:%M",
    errors="coerce"
)

rainfall["rainfall_raw"] = rainfall[rain_col]

# Prototype validity check
rainfall.loc[
    (rainfall[rain_col] < 0) |
    (rainfall[rain_col] > 300),
    rain_col
] = pd.NA

rainfall["rainfall"] = rainfall[rain_col]

rainfall_clean = rainfall[
    [
        "Station",
        "District",
        "Latitude",
        "Longitude",
        "timestamp",
        "rainfall_raw",
        "rainfall"
    ]
].copy()

rainfall_clean.to_csv(
    os.path.join(
        OUTPUT_DIR,
        "rainfall_clean.csv"
    ),
    index=False
)

print(
    "Rainfall rows:",
    len(rainfall_clean)
)

print(
    "Invalid rainfall values:",
    rainfall_clean["rainfall"].isna().sum()
)


# ============================================================
# PRESSURE
# ============================================================

print("\nLoading pressure...")

pressure = pd.read_csv(
    os.path.join(
        DATA_DIR,
        "pressure_tel_hr_tamil_nadu_sw_gw_tn_2025_2025.csv"
    )
)

pressure_col = "Telemetry_Hourly_Atmospheric Pressure (mb)"

pressure["timestamp"] = pd.to_datetime(
    pressure["Data Acquisition Time"],
    format="%d-%m-%Y %H:%M",
    errors="coerce"
)

pressure["pressure_raw"] = pressure[pressure_col]

# Keep values within the quality-check range
pressure.loc[
    (pressure[pressure_col] < 850) |
    (pressure[pressure_col] > 1100),
    pressure_col
] = pd.NA

pressure["pressure"] = pressure[pressure_col]

pressure_clean = pressure[
    [
        "Station",
        "District",
        "Latitude",
        "Longitude",
        "timestamp",
        "pressure_raw",
        "pressure"
    ]
].copy()

pressure_clean.to_csv(
    os.path.join(
        OUTPUT_DIR,
        "pressure_clean.csv"
    ),
    index=False
)

print(
    "Pressure rows:",
    len(pressure_clean)
)

print(
    "Invalid pressure values:",
    pressure_clean["pressure"].isna().sum()
)


print("\n" + "=" * 70)
print("ENVIRONMENTAL CLEANING COMPLETED")
print("=" * 70)