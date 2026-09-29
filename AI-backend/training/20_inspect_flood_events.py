import pandas as pd
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

file_path = os.path.join(
    BASE_DIR,
    "data",
    "raw",
    "disasterIND.csv"
)

print("=" * 70)
print("RESQMESH - HISTORICAL FLOOD EVENT INSPECTION")
print("=" * 70)

df = pd.read_csv(file_path, low_memory=False)

print("\nDataset shape:")
print(df.shape)

print("\nColumns:")
for i, col in enumerate(df.columns):
    print(f"{i}: {col}")

print("\nMissing values:")
missing = df.isnull().sum()
print(missing[missing > 0].sort_values(ascending=False))

print("\nDisaster types:")
print(df["Disaster Type"].value_counts(dropna=False))

flood = df[
    df["Disaster Type"]
    .astype(str)
    .str.contains("Flood", case=False, na=False)
].copy()

print("\n" + "=" * 70)
print("FLOOD RECORDS")
print("=" * 70)

print("Total flood-related records:", len(flood))

text_columns = [
    "Location",
    "Country",
    "Region",
    "Admin1",
    "Admin2",
    "Admin3"
]

existing_text_columns = [
    c for c in text_columns if c in flood.columns
]

flood["combined_location"] = (
    flood[existing_text_columns]
    .fillna("")
    .astype(str)
    .agg(" ".join, axis=1)
)

tn_flood = flood[
    flood["combined_location"]
    .str.contains(
        r"Tamil Nadu|Tamilnadu|Chennai|Coimbatore|Cuddalore|"
        r"Madurai|Salem|Thanjavur|Tiruchirappalli|Tirunelveli|"
        r"Thoothukudi|Tuticorin|Kanniyakumari|Kanyakumari|"
        r"Tenkasi|Virudhunagar|Nagapattinam|Ooty|Coonoor",
        case=False,
        na=False,
        regex=True
    )
].copy()

print("\nTamil Nadu-related flood records:", len(tn_flood))

display_columns = [
    c for c in [
        "Disaster Type",
        "Disaster Subtype",
        "Location",
        "Country",
        "Start Year",
        "Start Month",
        "Start Day",
        "End Year",
        "End Month",
        "End Day",
        "Latitude",
        "Longitude",
        "River Basin",
        "Total Deaths",
        "No. Affected",
        "Total Damage"
    ]
    if c in tn_flood.columns
]

print("\nTamil Nadu flood events:")

print(
    tn_flood[display_columns]
    .sort_values(
        by=["Start Year", "Start Month", "Start Day"],
        na_position="last"
    )
    .to_string(index=False)
)

print("\n" + "=" * 70)
print("FLOOD EVENTS BY YEAR")
print("=" * 70)

print(
    tn_flood["Start Year"]
    .value_counts()
    .sort_index()
)

output_path = os.path.join(
    BASE_DIR,
    "data",
    "processed",
    "tamil_nadu_flood_events.csv"
)

tn_flood.to_csv(output_path, index=False)

print("\nSaved:")
print(output_path)

print("\nInspection complete.")