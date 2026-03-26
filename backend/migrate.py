"""
Run this script once to add new payment/whatsapp columns to existing SQLite DB.
It is safe to run multiple times (ignores 'duplicate column' errors).
"""
import sqlite3, os

DB_PATH = os.path.join(os.path.dirname(__file__), 'instance', 'hostel.db')

NEW_COLUMNS = [
    ("payment_status",           "VARCHAR(20) DEFAULT 'Not Required'"),
    ("admission_fee",            "FLOAT"),
    ("caution_deposit",          "FLOAT"),
    ("payment_reference",        "VARCHAR(100)"),
    ("payment_date",             "DATETIME"),
    ("whatsapp_approval_sent",   "BOOLEAN DEFAULT 0"),
    ("whatsapp_credentials_sent","BOOLEAN DEFAULT 0"),
]

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

for col_name, col_def in NEW_COLUMNS:
    try:
        cur.execute(f"ALTER TABLE students_applications ADD COLUMN {col_name} {col_def};")
        print(f"  ✅ Added column: {col_name}")
    except sqlite3.OperationalError as e:
        if "duplicate column" in str(e).lower():
            print(f"  ⚠️  Column already exists: {col_name}")
        else:
            raise

conn.commit()
conn.close()
print("\nMigration complete!")
