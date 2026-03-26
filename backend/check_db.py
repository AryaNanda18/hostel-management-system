import sqlite3
import os

paths = ["hostel.db", "instance/hostel.db"]

for p in paths:
    if os.path.exists(p):
        print(f"--- {p} ---")
        conn = sqlite3.connect(p)
        cur = conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
        print("Tables:", cur.fetchall())
        conn.close()
    else:
        print(f"--- {p} not found ---")
