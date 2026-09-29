import pandas as pd
import numpy as np
import os

print("=" * 70)
print("RESQMESH - CREATE EVENT-AWARE TRAIN / TEST SPLIT")
print("=" * 70)

INPUT_FILE = "data/processed/final_ai_training_data.csv"

TRAIN_OUTPUT = "data/processed/train_event_aware.csv"
TEST_OUTPUT = "data/processed/test_event_aware.csv"

RANDOM_STATE = 42

# ================================================================
# 1. LOAD DATA
# ================================================================

if not os.path.exists(INPUT_FILE):
    print("\nERROR: Input file not found:")
    print(INPUT_FILE)
    raise SystemExit(1)

print("\nLoading final AI training data...")

df = pd.read_csv(
    INPUT_FILE,
    low_memory=False
)

print(f"Total rows: {len(df):,}")
print(f"Total columns: {len(df.columns)}")

# ================================================================
# 2. CHECK REQUIRED COLUMNS
# ================================================================

required_columns = [
    "flood_event",
    "event_id"
]

for column in required_columns:

    if column not in df.columns:

        print(
            f"\nERROR: Required column missing: {column}"
        )

        raise SystemExit(1)

# ================================================================
# 3. EVENT DISTRIBUTION
# ================================================================

print("\n" + "=" * 70)
print("1. EVENT DISTRIBUTION")
print("=" * 70)

event_distribution = (
    df.groupby(
        ["event_id", "flood_event"],
        dropna=False
    )
    .size()
    .reset_index(name="rows")
)

print(
    event_distribution.to_string(
        index=False
    )
)

# ================================================================
# 4. IDENTIFY FLOOD EVENTS
# ================================================================

flood_df = df[
    df["flood_event"] == 1
].copy()

normal_df = df[
    df["flood_event"] == 0
].copy()

print("\nFlood rows:")
print(f"{len(flood_df):,}")

print("\nNormal rows:")
print(f"{len(normal_df):,}")

flood_event_ids = sorted(
    flood_df["event_id"]
    .dropna()
    .unique()
)

print("\nFlood event IDs:")
print(flood_event_ids)

if len(flood_event_ids) < 2:

    print(
        "\nERROR: At least two flood events "
        "are required for event-aware evaluation."
    )

    raise SystemExit(1)

# ================================================================
# 5. SELECT TRAINING AND TEST FLOOD EVENTS
# ================================================================

# Event 1 is used for training.
# Event 2 is held completely unseen for testing.

TRAIN_FLOOD_EVENT = flood_event_ids[0]
TEST_FLOOD_EVENT = flood_event_ids[1]

train_flood = flood_df[
    flood_df["event_id"] == TRAIN_FLOOD_EVENT
].copy()

test_flood = flood_df[
    flood_df["event_id"] == TEST_FLOOD_EVENT
].copy()

print("\n" + "=" * 70)
print("2. FLOOD EVENT SPLIT")
print("=" * 70)

print(
    f"\nTraining flood event: "
    f"{TRAIN_FLOOD_EVENT}"
)

print(
    f"Training flood rows: "
    f"{len(train_flood):,}"
)

print(
    f"\nTesting flood event: "
    f"{TEST_FLOOD_EVENT}"
)

print(
    f"Testing flood rows: "
    f"{len(test_flood):,}"
)

# ================================================================
# 6. PREVENT FLOOD EVENT LEAKAGE
# ================================================================

if (
    set(
        train_flood["event_id"]
        .dropna()
        .unique()
    )
    &
    set(
        test_flood["event_id"]
        .dropna()
        .unique()
    )
):

    print(
        "\nERROR: Flood-event leakage detected!"
    )

    raise SystemExit(1)

print(
    "\nFlood-event leakage check: PASSED"
)

# ================================================================
# 7. SELECT NORMAL DATA
# ================================================================

print("\n" + "=" * 70)
print("3. SELECTING NORMAL DATA")
print("=" * 70)

# We want a manageable and reasonably balanced
# training dataset rather than all 1.88M normal rows.

TRAIN_NEGATIVE_RATIO = 3

train_normal_target = (
    len(train_flood)
    *
    TRAIN_NEGATIVE_RATIO
)

print(
    f"\nTarget normal training rows: "
    f"{train_normal_target:,}"
)

# ------------------------------------------------
# Use event_id == 0 as normal data.
# ------------------------------------------------

normal_pool = normal_df[
    normal_df["event_id"] == 0
].copy()

print(
    f"Available normal pool: "
    f"{len(normal_pool):,}"
)

if len(normal_pool) < train_normal_target:

    train_normal_target = len(normal_pool)

    print(
        "\nWARNING: Normal pool smaller than "
        "requested target."
    )

# ------------------------------------------------
# Randomly sample training normal rows.
# ------------------------------------------------

train_normal = normal_pool.sample(
    n=train_normal_target,
    random_state=RANDOM_STATE
)

# ------------------------------------------------
# Test normal size = 3x test flood size.
# ------------------------------------------------

TEST_NEGATIVE_RATIO = 3

test_normal_target = (
    len(test_flood)
    *
    TEST_NEGATIVE_RATIO
)

print(
    f"Target normal test rows: "
    f"{test_normal_target:,}"
)

remaining_normal_pool = normal_pool[
    ~normal_pool.index.isin(
        train_normal.index
    )
].copy()

if len(remaining_normal_pool) < test_normal_target:

    test_normal_target = (
        len(remaining_normal_pool)
    )

    print(
        "\nWARNING: Remaining normal pool "
        "smaller than requested test target."
    )

test_normal = remaining_normal_pool.sample(
    n=test_normal_target,
    random_state=RANDOM_STATE
)

# ================================================================
# 8. COMBINE TRAIN AND TEST
# ================================================================

train_df = pd.concat(
    [
        train_flood,
        train_normal
    ],
    axis=0
)

test_df = pd.concat(
    [
        test_flood,
        test_normal
    ],
    axis=0
)

# Shuffle within each dataset.
train_df = train_df.sample(
    frac=1,
    random_state=RANDOM_STATE
).reset_index(drop=True)

test_df = test_df.sample(
    frac=1,
    random_state=RANDOM_STATE
).reset_index(drop=True)

# ================================================================
# 9. CHECK TARGET DISTRIBUTION
# ================================================================

print("\n" + "=" * 70)
print("4. FINAL TRAIN / TEST DISTRIBUTION")
print("=" * 70)

print("\nTRAINING DATA:")

print(
    train_df["flood_event"]
    .value_counts()
    .sort_index()
)

print("\nTEST DATA:")

print(
    test_df["flood_event"]
    .value_counts()
    .sort_index()
)

# ================================================================
# 10. CHECK EVENT LEAKAGE
# ================================================================

print("\n" + "=" * 70)
print("5. FINAL LEAKAGE CHECK")
print("=" * 70)

train_events = set(
    train_df.loc[
        train_df["flood_event"] == 1,
        "event_id"
    ]
    .dropna()
    .unique()
)

test_events = set(
    test_df.loc[
        test_df["flood_event"] == 1,
        "event_id"
    ]
    .dropna()
    .unique()
)

print(
    f"\nTraining flood events: "
    f"{sorted(train_events)}"
)

print(
    f"Testing flood events: "
    f"{sorted(test_events)}"
)

overlap = train_events.intersection(
    test_events
)

if len(overlap) > 0:

    print(
        "\nERROR: Flood event overlap detected!"
    )

    print(
        "Overlapping events:",
        sorted(overlap)
    )

    raise SystemExit(1)

print(
    "\nFlood event overlap: NONE"
)

# ================================================================
# 11. CHECK ROW DUPLICATES
# ================================================================

print("\n" + "=" * 70)
print("6. DUPLICATE CHECK")
print("=" * 70)

train_duplicates = train_df.duplicated().sum()
test_duplicates = test_df.duplicated().sum()

print(
    f"\nTraining duplicate rows: "
    f"{train_duplicates:,}"
)

print(
    f"Testing duplicate rows: "
    f"{test_duplicates:,}"
)

# ================================================================
# 12. CHECK EVENT 2 IS COMPLETELY UNSEEN
# ================================================================

print("\n" + "=" * 70)
print("7. UNSEEN FLOOD EVENT CHECK")
print("=" * 70)

test_event_rows_in_train = train_df[
    train_df["event_id"] == TEST_FLOOD_EVENT
]

print(
    f"\nRows from test flood event "
    f"{TEST_FLOOD_EVENT} inside training data: "
    f"{len(test_event_rows_in_train):,}"
)

if len(test_event_rows_in_train) != 0:

    print(
        "\nERROR: Test flood event leaked into training!"
    )

    raise SystemExit(1)

print(
    "\nTest flood event is completely unseen "
    "during training: PASSED"
)

# ================================================================
# 13. SAVE DATASETS
# ================================================================

print("\n" + "=" * 70)
print("8. SAVING DATASETS")
print("=" * 70)

os.makedirs(
    "data/processed",
    exist_ok=True
)

train_df.to_csv(
    TRAIN_OUTPUT,
    index=False
)

test_df.to_csv(
    TEST_OUTPUT,
    index=False
)

print(
    f"\nTraining dataset saved:"
)

print(
    TRAIN_OUTPUT
)

print(
    f"\nTesting dataset saved:"
)

print(
    TEST_OUTPUT
)

# ================================================================
# 14. FINAL SUMMARY
# ================================================================

print("\n" + "=" * 70)
print("FINAL SUMMARY")
print("=" * 70)

print(
    f"\nTraining rows: "
    f"{len(train_df):,}"
)

print(
    f"Testing rows:  "
    f"{len(test_df):,}"
)

print(
    f"\nTraining flood rows: "
    f"{(train_df['flood_event'] == 1).sum():,}"
)

print(
    f"Training normal rows: "
    f"{(train_df['flood_event'] == 0).sum():,}"
)

print(
    f"\nTesting flood rows: "
    f"{(test_df['flood_event'] == 1).sum():,}"
)

print(
    f"Testing normal rows: "
    f"{(test_df['flood_event'] == 0).sum():,}"
)

print("\n" + "=" * 70)
print("STEP 36 COMPLETE")
print("=" * 70)

print(
    "\nEvent-aware train/test split created successfully."
)

print(
    "\nThe second flood event was kept completely "
    "unseen for testing."
)

print(
    "\nDO NOT train yet until you review this output."
)