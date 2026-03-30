import string
import random
from models import db
from models.student_application import StudentApplication
from datetime import datetime


def generate_hostel_admission_no():
    current_year = datetime.now().year
    last_app = StudentApplication.query.filter(
        StudentApplication.hostel_admission_no.like(f'LBSH/{current_year}/%')
    ).order_by(StudentApplication.hostel_admission_no.desc()).first()

    if last_app and last_app.hostel_admission_no:
        last_num = int(last_app.hostel_admission_no.split('/')[-1])
        new_num = last_num + 1
    else:
        new_num = 1
    return f"LBSH/{current_year}/{new_num:03d}"


def generate_password(length=8):
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))


def compute_priority_rank():
    pending_apps = StudentApplication.query.filter_by(application_status='Pending').all()

    def get_sort_key(app):
        # Category order: SC=0, ST=1, OEC=2, OBCH=3, Others=4
        cat = app.category.upper().replace(' ', '')
        if 'SC' in cat:
            cat_priority = 0
        elif 'ST' in cat:
            cat_priority = 1
        elif 'OEC' in cat:
            cat_priority = 2
        elif 'OBCH' in cat:
            cat_priority = 3
        else:
            cat_priority = 4
            
        # Distance (farther distance gets higher priority usually? The prompt says "if priority is same, then sort by distance if applicable" - higher distance should probably come first, so negative distance_km)
        distance_val = -float(app.distance_km)
        return (cat_priority, distance_val)

    sorted_apps = sorted(pending_apps, key=get_sort_key)
    for rank, app in enumerate(sorted_apps, start=1):
        app.priority_rank = rank
    db.session.commit()
    return sorted_apps


def compile_approved_message(student_name, admission_no):
    import os
    frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
    # Public Payment Link
    payment_link = f"{frontend_url}/pay?admn={admission_no}"
    
    return (
        f"Your hostel application has been approved. Please complete the hostel fee payment using the link below within the allotted time: {payment_link}"
    )


def compile_rejected_message(student_name, rejection_reason):
    return (
        f"Dear {student_name}, your hostel admission application has been rejected.\n"
        f"Reason: {rejection_reason}\n"
        f"You may apply again if eligible."
    )


def compile_credentials_message(student_name, username, password):
    return (
        f"Your payment has been verified. Your student portal credentials are:\n"
        f"Username: {username}\n"
        f"Password: {password}\n"
        f"Please log in and change your password."
    )
