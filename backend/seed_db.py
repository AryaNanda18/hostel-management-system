import sqlite3
import os
from datetime import datetime

DB_PATH = "instance/hostel.db"

def seed():
    if not os.path.exists(DB_PATH):
        print("Database not found!")
        return
        
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()
    
    # Check if we already have data
    cur.execute("SELECT COUNT(*) FROM students_applications")
    if cur.fetchone()[0] > 0:
        print("Database already has data. Skipping seed to avoid duplicates.")
        conn.close()
        return

    print("Seeding sample data from schema.sql...")
    
    samples = [
        ('ANJU KRISHNA', 'S3 CSE', 'No', 'LBSITW/22/101', 'Krishnadas P', '9876543210',
         'TC 12/345 Peroorkada Thiruvananthapuram 695005, Ph: 9876543211',
         'Same as permanent', '2004-05-12', 'Ezhava', 'Hindu', 'No', 'Indian',
         'Suresh Kumar', 'TC 9/456 Peroorkada, Ph: 9876543230',
         'Inside India', 'Kerala', 'Thiruvananthapuram',
         'OBCH', 45.0, 'uploads/sample_photo.jpg', 'uploads/sample_caste.pdf', 'Pending'),
         
        ('DIVYA MOHAN', 'S5 ECE', 'No', 'LBSITW/20/202', 'Mohanan R', '8765432109',
         'Chalakudy, Thrissur 680307, Ph: 8765432100',
         'Hostel local: same', '2002-08-22', 'SC', 'Hindu', 'Yes', 'Indian',
         'Rani Thomas', 'Near St. Marys Church, Chalakudy, Ph: 8765432101',
         'Inside India', 'Kerala', 'Thrissur',
         'SC', 120.5, 'uploads/sample_photo.jpg', 'uploads/sample_caste.pdf', 'Pending'),
         
        ('MEENA SEBASTIAN', 'S1 Civil', 'No', 'LBSITW/24/305', 'Sebastian Thomas', '7654321098',
         'Kottayam Town, Kottayam 686001, Ph: 7654321099',
         'Same as permanent', '2006-03-15', 'OBC', 'Christian', 'No', 'Indian',
         'Asha K', 'MG Road Kottayam, Ph: 7654321010',
         'Inside India', 'Kerala', 'Kottayam',
         'General', 90.0, 'uploads/sample_photo.jpg', 'uploads/sample_caste.pdf', 'Pending')
    ]
    
    for s in samples:
        sql = """INSERT INTO students_applications 
                 (student_name, semester_branch, let_status, college_admn_no, parent_name, student_contact,
                  permanent_address, official_address, dob, caste, religion, fee_concession, nationality,
                  local_guardian_name, local_guardian_address, inside_outside_india, state, district,
                  category, distance_km, photo_path, caste_certificate_path, application_status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"""
        cur.execute(sql, s + (datetime.now().strftime('%Y-%m-%d %H:%M:%S'),))
        
    conn.commit()
    print(f"✅ Successfully seeded {len(samples)} sample applications!")
    conn.close()

if __name__ == '__main__':
    seed()
