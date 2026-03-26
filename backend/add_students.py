import sqlite3
import os
import random
from datetime import datetime

def add_students():
    # Use absolute path
    basedir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(basedir, "instance", "hostel.db")
    
    if not os.path.exists(db_path):
        print(f"Error: Database file not found at {db_path}")
        return

    conn = sqlite3.connect(db_path)
    cur = conn.cursor()

    students = [
        # (List same as before, but as tuples for better performance or just dicts for clarity)
        # 22 students...
        {"name": "Fathima Adeeba", "admn": "2025B470", "branch": "Semester 1, CS2", "parent": "Kunhalan Kutty O.P.", "contact": "8156900252", "addr": "Kallengal (H), Pookolathur, Pulpatta (PO), Malappuram (Dist)", "dob": "2006-09-26", "rel": "Islam", "caste": "Mappila", "dist": "Malappuram"},
        {"name": "Nivedya S.", "admn": "2025B247", "branch": "1st Year ECE", "parent": "Sadheesh Chandran", "contact": "9526568527", "addr": "Thodiyil Merathil Veedu, Mylakkadu, Kollam, Kerala", "dob": "2007-08-04", "rel": "Hindu", "caste": "Nair", "dist": "Kollam"},
        {"name": "Pavithra Balachandran P.", "admn": "2025B229", "branch": "1st Year ECE", "parent": "Balachandran P.", "contact": "9605213428", "addr": "Poyilil House, Melattur (P.O.), Malappuram - 679326", "dob": "2006-12-03", "rel": "Hindu", "caste": "Thiyya", "dist": "Malappuram"},
        {"name": "Caren Aji", "admn": "2025B146", "branch": "CS1", "parent": "Aji Mathew Varghese", "contact": "9995201109", "addr": "Villa-1, VY Square, Reed Homes, Chalikkavattom, Ernakulam - 28", "dob": "2007-10-22", "rel": "Christian", "caste": "Pentecost", "dist": "Ernakulam"},
        {"name": "Azin Muhammed Nufail", "admn": "2025B141", "branch": "EC, First Sem", "parent": "Adv. Muhammed Nufail", "contact": "9746911917", "addr": "Ishaal, Maruthurkulagara South, Alumkadavu P.O., Karunagappally - 690573", "dob": "2007-10-16", "rel": "Islam", "caste": "Muslim", "dist": "Kollam"},
        {"name": "Diya R.", "admn": "2025B321", "branch": "CSE, Sem-1", "parent": "Mr. Dinu D.R.", "contact": "7356186566", "addr": "Palliyadiyil House, Palackal (PO), Thevalakkara, Kollam", "dob": "2007-11-20", "rel": "Hindu", "caste": "Nair", "dist": "Kollam"},
        {"name": "Angel Anna Thomas", "admn": "2025B275", "branch": "Civil Engineering, 1st Semester", "parent": "Thomas T.C.", "contact": "8891081438", "addr": "Thaikunnel House, Kanichar PO, Kelakam, Kannur - 670674", "dob": "2007-08-05", "rel": "Christian", "caste": "R.C.", "dist": "Kannur"},
        {"name": "Nandana Sreekumar", "admn": "2025B410", "branch": "CSE S1", "parent": "Sreekumar K.V.", "contact": "8590375995", "addr": "Sreevilasam, Pazhanjikonam, Pattoor PO, Alleppey - 690529", "dob": "2006-10-07", "rel": "Hindu", "caste": "Ezhava", "dist": "Alappuzha"},
        {"name": "Sreelakshmi C", "admn": "2025B283", "branch": "1st Computer Science", "parent": "Binu C", "contact": "8089758019", "addr": "Cheruvalath, Bindu Nivas, Chevayur, Kozhikode", "dob": "2006-02-24", "rel": "Hindu", "caste": "Thiyya", "dist": "Kozhikode"},
        {"name": "Ann Rose Shaju", "admn": "2025B351", "branch": "Semester 1, Computer Science", "parent": "Shaju George", "contact": "9778062811", "addr": "Vellanal House, Thariode PO, Wayanad, Kerala", "dob": "2006-12-28", "rel": "Christian", "caste": "Catholic", "dist": "Wayanad"},
        {"name": "Pooja Rajesh", "admn": "2025B170", "branch": "IT, Sem 1", "parent": "Rajesh P", "contact": "8590812753", "addr": "Narayanankattil House, Cheruvathery PO, Chevoor, Thrissur - 680027", "dob": "2006-09-20", "rel": "Hindu", "caste": "Nair", "dist": "Thrissur"},
        {"name": "Nanditha P V", "admn": "2025B001", "branch": "Semester 1, CSE", "parent": "Sukesh P V", "contact": "9778402500", "addr": "Meghamalhar, Pazhayangadi, Adukkila, Kannur, Kerala - 670303", "dob": "2007-11-23", "rel": "Hindu", "caste": "Vaniya", "dist": "Kannur"},
        {"name": "Mehanna V", "admn": "2025B194", "branch": "CSE", "parent": "Vijayakumar K P", "contact": "8281504370", "addr": "Thekkey Valiammel (H), Nadapuram, Kallachi (PO), Vadakara, Kozhikode - 673506", "dob": "2004-02-01", "rel": "Hindu", "caste": "Thiyya", "dist": "Kozhikode"},
        {"name": "Meenakshi Nandakumar", "admn": "2025B183", "branch": "First Semester, IT", "parent": "Nandakumar C", "contact": "8714167585", "addr": "Changarangath (H), PO Pullazhy, Thrissur - 680012", "dob": "2007-05-24", "rel": "Hindu", "caste": "Nair", "dist": "Thrissur"},
        {"name": "Harshiny M", "admn": "2025B478", "branch": "S1 CSE", "parent": "Murugan K", "contact": "9074397283", "addr": "Thulasi Bhavam, Gandhinagar, Nellimala Junction, Vandiperiyar, Idukki", "dob": "2007-10-27", "rel": "Hindu", "caste": "SC", "dist": "Idukki"},
        {"name": "Gouri G Nair", "admn": "2025B064", "branch": "CS1 (Computer Science)", "parent": "Gopakumar R", "contact": "9074815414", "addr": "Madhavam, Valayanchirangara P.O, Perumbavoor, Ernakulam - 683556", "dob": "2006-11-01", "rel": "Hindu", "caste": "Nair", "dist": "Ernakulam"},
        {"name": "Gouri Krishna S", "admn": "2025B032", "branch": "CS1", "parent": "Shaji S", "contact": "8089476721", "addr": "Pournami, Manappally North P.O, Karunagappally, Kollam - 690574", "dob": "2007-03-20", "rel": "Hindu", "caste": "Ezhava", "dist": "Kollam"},
        {"name": "Meenakshi S", "admn": "2025B034", "branch": "CS1", "parent": "Shaji S", "contact": "8089536721", "addr": "Pournami, Manappally North P.O, Karunagappally, Kollam - 690574", "dob": "2007-03-20", "rel": "Hindu", "caste": "Ezhava", "dist": "Kollam"},
        {"name": "Arathi A S", "admn": "2025B061", "branch": "CS1", "parent": "Anil Kumar K", "contact": "7012351713", "addr": "Karthika, Alummoodu P.O, Mukhathala, Kollam - 691577", "dob": "2007-09-17", "rel": "Hindu", "caste": "Ezhava", "dist": "Kollam"},
        {"name": "Malavika S Kumar", "admn": "2025B326", "branch": "CS2", "parent": "Santhosh Kumar S", "contact": "9562217036", "addr": "Deepam, T.C 50/463(1), Thaliyal, Karamana P.O, TVM - 695002", "dob": "2007-04-08", "rel": "Hindu", "caste": "Nair", "dist": "Thiruvananthapuram"},
        {"name": "Adithya A", "admn": "2025B289", "branch": "EC (Electronics & Communication)", "parent": "Anilkumar K", "contact": "9495034601", "addr": "Kilirooril House, Thiruvanvandoor P.O, Chengannur, Alappuzha - 689109", "dob": "2007-05-06", "rel": "Hindu", "caste": "Ezhava", "dist": "Alappuzha"},
        {"name": "Abhirami A S", "admn": "2025B291", "branch": "EC", "parent": "Ajayakumar S", "contact": "7902720230", "addr": "Abhiramam, Panavely P.O, Kottarakara, Kollam - 691532", "dob": "2006-10-16", "rel": "Hindu", "caste": "Viswakarma", "dist": "Kollam"}
    ]

    count = 0
    for s in students:
        # Check if already exists
        cur.execute("SELECT id FROM students_applications WHERE college_admn_no=?", (s["admn"],))
        if cur.fetchone():
            print(f"Skipping {s['name']} (already exists)")
            continue

        # Map category
        c = s["caste"].lower()
        cat = "General"
        if "sc" in c: cat = "SC"
        elif "st" in c: cat = "ST"
        elif any(x in c for x in ["ezhava", "thiyya", "mappila", "muslim", "viswakarma", "vaniya", "obch", "obc"]):
            cat = "OBCH"
        
        dist = round(random.uniform(20.0, 500.0), 1)
        
        sql = """INSERT INTO students_applications 
                 (student_name, semester_branch, let_status, college_admn_no, parent_name, student_contact,
                  permanent_address, official_address, dob, caste, religion, fee_concession, nationality,
                  local_guardian_name, local_guardian_address, inside_outside_india, state, district,
                  category, distance_km, photo_path, caste_certificate_path, application_status, created_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"""
        
        # Note: SQLite date format is YYYY-MM-DD
        vals = (
            s["name"], s["branch"], "No", s["admn"], s["parent"], s["contact"],
            s["addr"], s["addr"], s["dob"], s["caste"], s["rel"], 
            "Yes" if cat in ["SC", "ST"] else "No", "Indian",
            s["parent"], s["addr"], "Inside India", "Kerala", s["dist"],
            cat, dist, "uploads/photos/default.jpg", "uploads/documents/default.pdf", "Pending",
            datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        )
        cur.execute(sql, vals)
        count += 1

    conn.commit()
    conn.close()
    print(f"\n✅ Successfully added {count} new students!")

if __name__ == '__main__':
    add_students()
