import urllib.parse
from datetime import datetime
from flask import Blueprint, jsonify, request
from models.student_application import StudentApplication
from models import db
from utils.auth import admin_required
from services.admission_service import (
    generate_hostel_admission_no, generate_password,
    compute_priority_rank,
    compile_approved_message, compile_rejected_message
)

admin_bp = Blueprint('admin', __name__)


import re

def _wa_url(phone, message):
    # Strip all non-digit characters
    clean_phone = re.sub(r'\D', '', str(phone))
    
    # If 10 digits, prefix with 91 (India)
    if len(clean_phone) == 10:
        clean_phone = f"91{clean_phone}"
    elif len(clean_phone) == 12 and clean_phone.startswith('91'):
        pass # already has 91
    # Note: adjust prefix logic if the user is outside India, but the context suggests India.
    
    return f"https://wa.me/{clean_phone}?text={urllib.parse.quote(message)}"


# ── List applications ─────────────────────────────────────────────────────────
@admin_bp.route('/applications', methods=['GET'])
@admin_required
def get_applications(current_admin):
    status = request.args.get('status')
    category = request.args.get('category')
    
    query = StudentApplication.query
    
    if status:
        query = query.filter_by(application_status=status)
    if category:
        query = query.filter(StudentApplication.category.ilike(f"%{category}%"))
        
    apps = query.order_by(StudentApplication.created_at.desc()).all()
    return jsonify([a.to_dict() for a in apps])


# ── Export to Excel ────────────────────────────────────────────────────────────
@admin_bp.route('/export-excel', methods=['GET'])
@admin_required
def export_excel(current_admin):
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
        
    apps = query.all()
    
    data = []
    for a in apps:
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
def get_application(current_admin, app_id):
    app = StudentApplication.query.get_or_404(app_id)
    return jsonify(app.to_dict())


# ── Approve ───────────────────────────────────────────────────────────────────
@admin_bp.route('/applications/<int:app_id>/approve', methods=['POST'])
@admin_required
def approve_application(current_admin, app_id):
    app = StudentApplication.query.get_or_404(app_id)

    if app.application_status == 'Approved':
        return jsonify({'message': 'Application already approved'}), 400

    # Generate admission number on approval so it can be used for payment
    if not app.hostel_admission_no:
        app.hostel_admission_no = generate_hostel_admission_no()

    app.application_status = 'Approved'
    app.payment_status = 'Pending'
    
    # Calculate fees based on category
    if app.category in ['SC', 'ST', 'OEC', 'OBCH', 'OBC-H']:
        admission_fee = 1000.0
        caution_deposit = 3000.0
    else:
        admission_fee = 1000.0
        caution_deposit = 12000.0

    app.admission_fee = admission_fee
    app.caution_deposit = caution_deposit
    app.whatsapp_approval_sent = True
    db.session.commit()

    msg = compile_approved_message(app.student_name, app.hostel_admission_no)
    
    return jsonify({
        'message': 'Application approved successfully',
        'whatsapp_url': _wa_url(app.student_contact, msg),
    })


# ── Reject ────────────────────────────────────────────────────────────────────
@admin_bp.route('/applications/<int:app_id>/reject', methods=['POST'])
@admin_required
def reject_application(current_admin, app_id):
    app = StudentApplication.query.get_or_404(app_id)

    if app.application_status == 'Rejected':
        return jsonify({'message': 'Application already rejected'}), 400

    data = request.get_json() or {}
    reason = data.get('rejection_reason', '').strip()
    
    if not reason:
        return jsonify({'message': 'Rejection reason is required'}), 400

    app.application_status = 'Rejected'
    app.rejection_reason = reason
    db.session.commit()

    msg = compile_rejected_message(app.student_name, reason)

    return jsonify({
        'message': 'Application rejected successfully',
        'whatsapp_url': _wa_url(app.student_contact, msg),
    })


# ── Mark as Verified & Send Credentials ───────────────────────────────────────
@admin_bp.route('/applications/<int:app_id>/verify-payment', methods=['POST'])
@admin_required
def verify_payment(current_admin, app_id):
    from services.admission_service import compile_credentials_message
    app = StudentApplication.query.get_or_404(app_id)

    if app.payment_status == 'Verified':
        return jsonify({'message': 'Payment already verified'}), 400

    if app.payment_status != 'Paid':
         return jsonify({'message': 'Payment must be marked as Paid first'}), 400

    app.payment_status = 'Verified'
    app.payment_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')

    # Ensure credentials are generated
    if not app.hostel_admission_no:
        app.hostel_admission_no = generate_hostel_admission_no()
    if not app.generated_password:
        app.generated_password = generate_password()
    
    db.session.commit()

    msg = compile_credentials_message(
        app.student_name,
        app.hostel_admission_no,
        app.generated_password
    )
    
    app.whatsapp_credentials_sent = True
    db.session.commit()

    return jsonify({
        'message': 'Payment verified and credentials sent via WhatsApp',
        'whatsapp_url': _wa_url(app.student_contact, msg)
    })


# Send credentials removed as payment gateway is removed


# ── Priority list ─────────────────────────────────────────────────────────────
@admin_bp.route('/priority-list', methods=['GET'])
@admin_required
def get_priority_list(current_admin):
    sorted_apps = compute_priority_rank()
    return jsonify([a.to_dict() for a in sorted_apps])
