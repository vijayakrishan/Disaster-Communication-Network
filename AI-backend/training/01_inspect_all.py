import pandas as pd
import os

DATA_DIR = "data/raw"

files = {
    "temperature": "temprature_tel_hr_tamil_nadu_sw_gw_tn_2021_2025.csv",
    "rainfall": "rainfall_tel_hr_tamil_nadu_sw_gw_tn_2021_2025.csv",
    "water_level": "rwl_tel_hr_tamil_nadu_sw_gw_27_2021_2025.csv",
    "pressure": "pressure_tel_hr_tamil_nadu_sw_gw_tn_2025_2025.csv"
}


def inspect_file(name, filename):

    path = os.path.join(DATA_DIR, filename)

    print("\n" + "=" * 80)
    print(f"DATASET: {name}")
    print("=" * 80)

    if not os.path.exists(path):
        print("FILE NOT FOUND:", path)
        return

    df = pd.read_csv(path)

    print("\nShape:")
    print(df.shape)

    print("\nColumns:")
    for col in df.columns:
        print(" -", col)

    print("\nData types:")
    print(df.dtypes)

    print("\nMissing values:")
    missing = df.isnull().sum()
    print(missing[missing > 0])

    print("\nDuplicate rows:")
    print(df.duplicated().sum())

    print("\nFirst 5 rows:")
    print(df.head())

    print("\nNumeric summary:")
    print(df.describe(include="number").T)

    print("\nUnique values for low-cardinality columns:")

    for col in df.columns:
        unique_count = df[col].nunique()

        if unique_count < 20:
            print(f"\n{col} ({unique_count} unique values):")
            print(df[col].unique())


for name, filename in files.items():
    inspect_file(name, filename)


print("\n")
print("=" * 80)
print("ALL DATASET INSPECTION COMPLETED")
print("=" * 80)