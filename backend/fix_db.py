import psycopg2

def fix():
    try:
        conn = psycopg2.connect(
            dbname="college_erp_db",
            user="postgres",
            password="root",
            host="localhost",
            port="5432"
        )
        cur = conn.cursor()
        
        # Add hod, established, status to api_department
        print("Adding columns to api_department...")
        try:
            cur.execute("ALTER TABLE api_department ADD COLUMN hod VARCHAR(100);")
        except Exception as e:
            print(f"Error adding hod: {e}")
            conn.rollback()
        else:
            conn.commit()

        try:
            cur.execute("ALTER TABLE api_department ADD COLUMN established VARCHAR(4);")
        except Exception as e:
            print(f"Error adding established: {e}")
            conn.rollback()
        else:
            conn.commit()

        try:
            cur.execute("ALTER TABLE api_department ADD COLUMN status VARCHAR(20) DEFAULT 'Active';")
        except Exception as e:
            print(f"Error adding status: {e}")
            conn.rollback()
        else:
            conn.commit()

        # Update Notice table if needed (rename content to description)
        print("Checking api_notice...")
        try:
            cur.execute("ALTER TABLE api_notice RENAME COLUMN content TO description;")
        except Exception as e:
            print(f"Error renaming content: {e}")
            conn.rollback()
        else:
            conn.commit()

        try:
            cur.execute("ALTER TABLE api_notice ADD COLUMN target_role VARCHAR(10) DEFAULT 'BOTH';")
            cur.execute("ALTER TABLE api_notice ADD COLUMN priority VARCHAR(10) DEFAULT 'NORMAL';")
            cur.execute("ALTER TABLE api_notice ADD COLUMN expiry_date TIMESTAMP WITH TIME ZONE;")
        except Exception as e:
            print(f"Error updating notice columns: {e}")
            conn.rollback()
        else:
            conn.commit()

        print("Done!")
        cur.close()
        conn.close()
    except Exception as e:
        print(f"Connection error: {e}")

if __name__ == "__main__":
    fix()
