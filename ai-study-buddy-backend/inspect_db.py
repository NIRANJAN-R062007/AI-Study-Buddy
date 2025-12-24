
import sqlite3
import sys
import os
from config import Config

sys.path.append(os.getcwd())

def inspect_db():
    db_path = Config.DB_PATH
    print(f"Inspecting DB at: {db_path}")
    
    if not os.path.exists(db_path):
        print("Database file not found!")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    print("\n--- Users ---")
    try:
        cursor.execute("SELECT id, email, name FROM users")
        for row in cursor.fetchall():
            print(row)
    except Exception as e:
        print(f"Error reading users: {e}")

    print("\n--- Study Plans ---")
    try:
        cursor.execute("SELECT id, user_id, topic FROM study_plans")
        plans = cursor.fetchall()
        if not plans:
            print("No study plans found.")
        for row in plans:
            print(f"Plan ID: {row[0]}, User ID: {row[1]}, Topic: {row[2]}")
    except Exception as e:
        print(f"Error reading study plans: {e}")

    conn.close()

if __name__ == "__main__":
    inspect_db()
