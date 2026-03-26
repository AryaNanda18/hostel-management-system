import sqlite3
import os

# Paths
OLD_DB = "instance/hostel.db"
NEW_DB = "hostel.db"

def recover():
    if not os.path.exists(OLD_DB):
        print("Old database not found in instance folder.")
        return
    
    conn_old = sqlite3.connect(OLD_DB)
    cur_old = conn_old.cursor()
    
    conn_new = sqlite3.connect(NEW_DB)
    cur_new = conn_new.cursor()
    
    try:
        # Get applications from old DB
        cur_old.execute("SELECT * FROM students_applications")
        cols = [d[0] for d in cur_old.description]
        rows = cur_old.fetchall()
        
        print(f"Found {len(rows)} old applications. Recovering...")
        
        count = 0
        for row in rows:
            data = dict(zip(cols, row))
            
            # Skip if already exists in new DB (by college_admn_no usually)
            college_id = data.get('college_admn_no')
            cur_new.execute("SELECT id FROM students_applications WHERE college_admn_no=?", (college_id,))
            if cur_new.fetchone():
                continue
                
            # Prepare new data
            # Add defaults for missing columns (caste_cert, status, reason, etc.)
            new_data = {
                'student_name': data.get('student_name'),
                'semester_branch': data.get('semester_branch'),
                'let_status': data.get('let_status', 'No'),
                'college_admn_no': college_id,
                'parent_name': data.get('parent_name', 'N/A'),
                'student_contact': data.get('student_contact', 'N/A'),
                'permanent_address': data.get('permanent_address', 'N/A'),
                'official_address': data.get('official_address', 'N/A'),
                'dob': data.get('dob'),
                'caste': data.get('caste', 'N/A'),
                'religion': data.get('religion', 'N/A'),
                'fee_concession': data.get('fee_concession', 'No'),
                'nationality': data.get('nationality', 'Indian'),
                'local_guardian_name': data.get('local_guardian_name', 'N/A'),
                'local_guardian_address': data.get('local_guardian_address', 'N/A'),
                'inside_outside_india': data.get('inside_outside_india', 'Inside India'),
                'state': data.get('state', 'Kerala'),
                'district': data.get('district'),
                'category': data.get('category', 'General'),
                'distance_km': data.get('distance_km', 0.0),
                'photo_path': data.get('photo_path', 'uploads/photos/default.jpg'),
                'document_path': data.get('document_path'),
                # NEW REQUIRED COLUMN:
                'caste_certificate_path': 'uploads/documents/default.pdf', # Placeholder for old data
                'application_status': data.get('application_status', 'Pending'),
                'created_at': data.get('created_at')
            }
            
            # Construct insert
            fields = list(new_data.keys())
            placeholders = ",".join(["?" for _ in fields])
            sql = f"INSERT INTO students_applications ({','.join(fields)}) VALUES ({placeholders})"
            cur_new.execute(sql, list(new_data.values()))
            count += 1
            
        conn_new.commit()
        print(f"✅ Recovered {count} applications from old database!")
        
    except Exception as e:
        print(f"❌ Error during recovery: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        conn_old.close()
        conn_new.close()

if __name__ == '__main__':
    recover()
