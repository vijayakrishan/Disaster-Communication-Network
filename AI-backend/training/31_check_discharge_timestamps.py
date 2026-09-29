import pandas as pd

print("=" * 70)
print("RESQMESH - CHECK DISCHARGE TIMESTAMP FORMAT")
print("=" * 70)

FILE = r"data\raw\river_discharge_manual_daily_cwc_tn_2001_2025.csv"

df = pd.read_csv(
    FILE,
    low_memory=False
)

col = "Data Acquisition Time"

print("\nTotal rows:", len(df))

print("\nRaw timestamp samples:")
print(df[col].head(20).to_string(index=False))

print("\nRaw timestamp data type:")
print(df[col].dtype)

# Try normal parsing
parsed = pd.to_datetime(
    df[col],
    errors="coerce"
)

invalid = df[parsed.isna()].copy()

print("\n" + "=" * 70)
print("TIMESTAMP PARSING RESULT")
print("=" * 70)

print("Valid timestamps:", parsed.notna().sum())
print("Invalid timestamps:", parsed.isna().sum())

print("\nExamples of INVALID timestamps:")
print(
    invalid[col]
    .drop_duplicates()
    .head(30)
    .to_string(index=False)
)

print("\n" + "=" * 70)
print("INVALID TIMESTAMP FREQUENCY")
print("=" * 70)

print(
    invalid[col]
    .value_counts(dropna=False)
    .head(30)
    .to_string()
)

print("\n" + "=" * 70)
print("STEP 31 COMPLETE")
print("=" * 70)