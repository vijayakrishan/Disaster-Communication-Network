import pandas as pd
from pathlib import Path
import zipfile

print("=" * 70)
print("RESQMESH - INSPECT NEW DATASETS")
print("=" * 70)

RAW = Path("data/raw")

# ---------------------------------------------------------
# CSV FILES
# ---------------------------------------------------------

csv_files = [
    "river_discharge_manual_daily_cwc_tn_2001_2025.csv",
    "river_discharge_manual_daily_cwc_tn_2026_2030.csv",
    "riverdischarge_manual_daily_cwc_ap_1950_2000.csv",
    "river_discharge_manual_daily_cwc_ap_2001_2025.csv",
    "Gov. Climate Datasets (Archive) - List.csv",
]

for filename in csv_files:

    path = RAW / filename

    print("\n" + "=" * 70)
    print(filename)
    print("=" * 70)

    if not path.exists():
        print("FILE NOT FOUND")
        continue

    try:
        df = pd.read_csv(path)

        print("Rows    :", f"{len(df):,}")
        print("Columns :", len(df.columns))

        print("\nColumns:")
        for col in df.columns:
            print("  -", col)

        print("\nFirst 3 rows:")
        print(df.head(3).to_string())

        print("\nMissing values:")
        missing = df.isna().sum()
        missing = missing[missing > 0]

        if len(missing) == 0:
            print("  None")
        else:
            print(missing.to_string())

        print("\nExact duplicate rows:", df.duplicated().sum())

    except Exception as e:
        print("ERROR:", e)


# ---------------------------------------------------------
# ZIP FILES
# ---------------------------------------------------------

zip_files = [
    "archive (9).zip",
    "archive (10).zip",
]

for filename in zip_files:

    path = RAW / filename

    print("\n" + "=" * 70)
    print(filename)
    print("=" * 70)

    if not path.exists():
        print("FILE NOT FOUND")
        continue

    try:
        with zipfile.ZipFile(path, "r") as z:

            files = z.namelist()

            print("Files inside ZIP:", len(files))

            for item in files:
                print("  -", item)

    except Exception as e:
        print("ERROR:", e)


print("\n" + "=" * 70)
print("STEP 27 COMPLETE")
print("=" * 70)