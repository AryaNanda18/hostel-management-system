from flask import Blueprint, jsonify, request
from models.student_application import StudentApplication
from models import db
from utils.auth import token_required
from datetime import datetime
import random, string

student_bp = Blueprint('student', __name__)


@student_bp.route('/dashboard', methods=['GET'])
@token_required
def student_dashboard(current_user, role):
    """Return full student profile. current_user is the StudentApplication object."""
    if role != 'student':
        return jsonify({'message': 'Student access required'}), 403
    return jsonify({'student_info': current_user.to_dict()})


@student_bp.route('/change-password', methods=['POST'])
@token_required
def change_password(current_user, role):
    if role != 'student':
        return jsonify({'message': 'Student access required'}), 403

    data = request.get_json()
    new_password = (data.get('new_password') or '').strip()
    if not new_password or len(new_password) < 6:
        return jsonify({'message': 'Password must be at least 6 characters'}), 400

    current_user.generated_password = new_password
    db.session.commit()
    return jsonify({'message': 'Password updated successfully'})


# Payment API has been removed as per requirements
