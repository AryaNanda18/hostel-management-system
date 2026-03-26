from flask import Blueprint, jsonify, request
from models.student_application import StudentApplication
from models import db
from datetime import datetime
import random, string

public_bp = Blueprint('public', __name__)


@public_bp.route('/fee-info/<path:admission_no>', methods=['GET'])
def get_payment_info(admission_no):
    """Public endpoint — returns fee info by admission number (no auth)."""
    app = StudentApplication.query.filter_by(hostel_admission_no=admission_no).first()
    if not app:
        return jsonify({'message': 'Admission number not found'}), 404
    if app.application_status != 'Approved':
        return jsonify({'message': 'Application is not approved yet'}), 400
    return jsonify({
        'student_name': app.student_name,
        'hostel_admission_no': app.hostel_admission_no,
        'admission_fee': app.admission_fee,
        'caution_deposit': app.caution_deposit,
        'college_admn_no': app.college_admn_no,
        'category': app.category,
        'instructions': 'Please complete the hostel fee payment manually after coming to college within the allotted date. No online payments are accepted.'
    })


@public_bp.route('/mark-paid/<path:admission_no>', methods=['POST'])
def mark_paid(admission_no):
    """Public endpoint — marks application as Paid (simulating payment completion)."""
    app = StudentApplication.query.filter_by(hostel_admission_no=admission_no).first()
    if not app:
        return jsonify({'message': 'Admission number not found'}), 404
    if app.application_status != 'Approved':
        return jsonify({'message': 'Application is not approved yet'}), 400
    
    app.payment_status = 'Paid'
    db.session.commit()
    return jsonify({'message': 'Payment marked as Paid. Please wait for admin verification.'})
