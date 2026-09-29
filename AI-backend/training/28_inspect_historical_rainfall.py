import pandas as pd
from pathlib import Path

print("=" * 70)
print("RESQMESH - INSPECT HISTORICAL INDIAN RAINFALL")
print("=" * 70)

RAW = Path("data/raw")

# =========================================================
# 1. DISTRICT-WISE RAINFALL NORMAL
# =========================================================

file1 = RAW / "district wise rainfall normal.csv"

print("\n" + "=" * 70)
print("DISTRICT-WISE RAINFALL NORMAL")
print("=" * 70)

df1 = pd.read_csv(file1, encoding_errors="replace")

print("Rows:", f"{len(df1):,}")
print("Columns:", len(df1.columns))

print("\nTamil Nadu rows:")

tn1 = df1[
    df1["STATE_UT_NAME"]
    .astype(str)
    .str.upper()
    .str.contains("TAMIL")
]

print(tn1.to_string(index=False))

# =========================================================
# 2. HISTORICAL INDIA RAINFALL
# =========================================================

file2 = RAW / "rainfall in india 1901-2015.csv"

print("\n" + "=" * 70)
print("HISTORICAL INDIA RAINFALL")
print("=" * 70)

df2 = pd.read_csv(file2, encoding_errors="replace")

print("Rows:", f"{len(df2):,}")
print("Columns:", len(df2.columns))

print("\nYear range:")

print(
    df2["YEAR"].min(),
    "→",
    df2["YEAR"].max()
)

print("\nSubdivisions containing Tamil Nadu:")

tn2 = df2[
    df2["SUBDIVISION"]
    .astype(str)
    .str.upper()
    .str.contains("TAMIL")
]

print(
    tn2[
        [
            "SUBDIVISION",
            "YEAR",
            "JAN",
            "FEB",
            "MAR",
            "APR",
            "MAY",
            "JUN",
            "JUL",
            "AUG",
            "SEP",
            "OCT",
            "NOV",
            "DEC",
            "ANNUAL"
        ]
    ].to_string(index=False)
)

# =========================================================
# 3. MISSING VALUES
# =========================================================

print("\n" + "=" * 70)
print("MISSING VALUES")
print("=" * 70)

print("\nDistrict rainfall:")
print(
    df1.isna().sum()[
        df1.isna().sum() > 0
    ]
)

print("\nHistorical rainfall:")
print(
    df2.isna().sum()[
        df2.isna().sum() > 0
    ]
)

# =========================================================
# 4. DUPLICATES
# =========================================================

print("\n" + "=" * 70)
print("DUPLICATES")
print("=" * 70)

print(
    "District rainfall duplicates:",
    df1.duplicated().sum()
)

print(
    "Historical rainfall duplicates:",
    df2.duplicated().sum()
)

# =========================================================
# 5. SUMMARY
# =========================================================

print("\n" + "=" * 70)
print("STEP 28 COMPLETE")
print("=" * 70)