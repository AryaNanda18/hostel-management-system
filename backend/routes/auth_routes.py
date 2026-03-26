from flask import Blueprint, request, jsonify, current_app
from models.admin import Admin
from models.student_application import StudentApplication
from werkzeug.security import check_password_hash
import jwt
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/admin/login', methods=['POST'])
def admin_login():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'message': 'Could not verify'}), 401

    admin = Admin.query.filter_by(username=data.get('username')).first()

    if not admin or not check_password_hash(admin.password_hash, data.get('password')):
        return jsonify({'message': 'Invalid username or password'}), 401

    token = jwt.encode({
        'id': admin.id,
        'role': 'admin',
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, current_app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({'token': token})

@auth_bp.route('/student/login', methods=['POST'])
def student_login():
    data = request.get_json()
    if not data or not data.get('admission_no') or not data.get('password'):
        return jsonify({'message': 'Could not verify'}), 401

    student = StudentApplication.query.filter_by(
        hostel_admission_no=data.get('admission_no'),
        application_status='Approved'
    ).first()

    if not student or student.generated_password != data.get('password'):
        return jsonify({'message': 'Invalid admission number or password, or application not approved.'}), 401

    token = jwt.encode({
        'id': student.id,
        'role': 'student',
        'exp': datetime.utcnow() + timedelta(hours=24)
    }, current_app.config['SECRET_KEY'], algorithm="HS256")

    return jsonify({'token': token})
