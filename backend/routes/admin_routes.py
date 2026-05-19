import re
import urllib.parse
from datetime import datetime, timezone
from flask import Blueprint, jsonify, request
from models.student_application import StudentApplication
from models import db
from utils.auth import admin_required
from services.admission_service import (
    generate_hostel_admission_no, generate_password,
    compute_priority_rank,
    compile_approved_message, compile_rejected_message,
    compile_credentials_message
)

admin_bp = Blueprint('admin', __name__)

def _wa_url(phone, message):
    # Strip all non-digit characters
    clean_phone = re.sub(r'\D', '', str(phone))
    
    # If 10 digits, prefix with 91 (India)
    if len(clean_phone) == 10:
        clean_phone = f"91{clean_phone}"
    elif len(clean_phone) == 12 and clean_phone.startswith('91'):
        pass
    
    return f"https://wa.me/{clean_phone}?text={urllib.parse.quote(message)}"

# ── List applications ─────────────────────────────────────────────────────────
@admin_bp.route('/applications', methods=['GET'])
@admin_required
def get_applications(_current_admin):
    status = request.args.get('status')
    category = request.args.get('category')
    
    query = StudentApplication.query
    
    if status:
        query = query.filter_by(application_status=status)
    if category:
        query = query.filter(StudentApplication.category.ilike(f"%{category}%"))
        
    apps_list = query.order_by(StudentApplication.created_at.desc()).all()
    return jsonify([a.to_dict() for a in apps_list])

# ── Export to Excel ────────────────────────────────────────────────────────────
@admin_bp.route('/export-excel', methods=['GET'])
@admin_required
def export_excel(_current_admin):
    import pandas as pd
    import io
    from flask import send_file
    
    status = request.args.get('status')
    category = request.args.get('category')
    
    query = StudentApplication.query
    if status:
        query = query.filter_by(application_status=status)
    if category:
        query = query.filter(StudentApplication.category.ilike(f"%{category}%"))
        
    all_apps = query.all()
    
    data = []
    for a in all_apps:
        data.append({
            'Student Name': a.student_name,
            'College ID': a.college_admn_no,
            'Semester/Branch': a.semester_branch,
            'Category': a.category,
            'Distance (KM)': a.distance_km,
            'Contact': a.student_contact,
            'Caste': a.caste,
            'Religion': a.religion,
            'Status': a.application_status,
            'Rejection Reason': a.rejection_reason or '',
            'Created At': a.created_at.strftime('%Y-%m-%d %H:%M:%S') if a.created_at else ''
        })
        
    df = pd.DataFrame(data)
    
    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Applications')
    
    output.seek(0)
    
    filename = "applications.xlsx"
    if category:
        filename = f"applications_{category.lower()}.xlsx"
    
    return send_file(
        output,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name=filename
    )

# ── Single application ────────────────────────────────────────────────────────
@admin_bp.route('/applications/<int:app_id>', methods=['GET'])
@admin_required
def get_application(_current_admin, app_id):
    application = db.get_or_404(StudentApplication, app_id)
    return jsonify(application.to_dict())

# ── Approve ───────────────────────────────────────────────────────────────────
@admin_bp.route('/applications/<int:app_id>/approve', methods=['POST'])
@admin_required
def approve_application(_current_admin, app_id):
    application = db.get_or_404(StudentApplication, app_id)

    if application.application_status == 'Approved':
        return jsonify({'message': 'Application already approved'}), 400

    if not application.hostel_admission_no:
        application.hostel_admission_no = generate_hostel_admission_no()

    application.application_status = 'Approved'
    application.payment_status = 'Pending'
    
    if application.category in ['SC', 'ST', 'OEC', 'OBCH', 'OBC-H']:
        admission_fee = 1000.0
        caution_deposit = 3000.0
    else:
        admission_fee = 1000.0
        caution_deposit = 12000.0

    application.admission_fee = admission_fee
    application.caution_deposit = caution_deposit
    application.whatsapp_approval_sent = True
    db.session.commit()

    msg = compile_approved_message(application.student_name, application.hostel_admission_no)
    
    return jsonify({
        'message': 'Application approved successfully',
        'whatsapp_url': _wa_url(application.student_contact, msg),
    })

# ── Reject ────────────────────────────────────────────────────────────────────
@admin_bp.route('/applications/<int:app_id>/reject', methods=['POST'])
@admin_required
def reject_application(_current_admin, app_id):
    application = db.get_or_404(StudentApplication, app_id)

    if application.application_status == 'Rejected':
        return jsonify({'message': 'Application already rejected'}), 400

    data = request.get_json() or {}
    reason = data.get('rejection_reason', '').strip()
    
    if not reason:
        return jsonify({'message': 'Rejection reason is required'}), 400

    application.application_status = 'Rejected'
    application.rejection_reason = reason
    db.session.commit()

    msg = compile_rejected_message(application.student_name, reason)

    return jsonify({
        'message': 'Application rejected successfully',
        'whatsapp_url': _wa_url(application.student_contact, msg),
    })

# ── Mark as Verified & Send Credentials ───────────────────────────────────────
@admin_bp.route('/applications/<int:app_id>/verify-payment', methods=['POST'])
@admin_required
def verify_payment(_current_admin, app_id):
    application = db.get_or_404(StudentApplication, app_id)

    if application.payment_status == 'Verified':
        return jsonify({'message': 'Payment already verified'}), 400

    if application.payment_status != 'Paid':
         return jsonify({'message': 'Payment must be marked as Paid first'}), 400

    application.payment_status = 'Verified'
    application.payment_date = datetime.now(timezone.utc).strftime('%Y-%m-%d %H:%M:%S')

    if not application.hostel_admission_no:
        application.hostel_admission_no = generate_hostel_admission_no()
    if not application.generated_password:
        application.generated_password = generate_password()
    
    db.session.commit()

    msg = compile_credentials_message(
        application.student_name,
        application.hostel_admission_no,
        application.generated_password
    )
    
    application.whatsapp_credentials_sent = True
    db.session.commit()

    return jsonify({
        'message': 'Payment verified and credentials sent via WhatsApp',
        'whatsapp_url': _wa_url(application.student_contact, msg)
    })

# ── Priority list ─────────────────────────────────────────────────────────────
@admin_bp.route('/priority-list', methods=['GET'])
@admin_required
def get_priority_list(_current_admin):
    sorted_apps = compute_priority_rank()
    return jsonify([a.to_dict() for a in sorted_apps])


# ── Export Priority List to Excel ─────────────────────────────────────────────
@admin_bp.route('/export-priority-excel', methods=['GET'])
@admin_required
def export_priority_excel(_current_admin):
    import pandas as pd
    import io
    from flask import send_file

    sorted_apps = compute_priority_rank()

    data = []
    for a in sorted_apps:
        data.append({
            'Rank':           a.priority_rank,
            'Student Name':   a.student_name,
            'College ID':     a.college_admn_no,
            'Semester/Branch': a.semester_branch,
            'Category':       a.category,
            'Distance (KM)':  a.distance_km,
            'Contact':        a.student_contact,
            'Caste':          a.caste,
            'Religion':       a.religion,
            'Status':         a.application_status,
        })

    df = pd.DataFrame(data)

    output = io.BytesIO()
    with pd.ExcelWriter(output, engine='openpyxl') as writer:
        df.to_excel(writer, index=False, sheet_name='Priority List')

    output.seek(0)

    return send_file(
        output,
        mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        as_attachment=True,
        download_name='priority_list.xlsx'
    )
