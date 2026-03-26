import jwt
from functools import wraps
from flask import request, jsonify, current_app
from models.admin import Admin
from models.student_application import StudentApplication

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            if data['role'] == 'admin':
                current_user = Admin.query.filter_by(id=data['id']).first()
            elif data['role'] == 'student':
                current_user = StudentApplication.query.filter_by(id=data['id']).first()
            else:
                return jsonify({'message': 'Invalid role!'}), 401
        except Exception as e:
            print(e)
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(current_user, data['role'], *args, **kwargs)

    return decorated

def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            if data['role'] != 'admin':
                return jsonify({'message': 'Admin access required!'}), 403
            current_user = Admin.query.filter_by(id=data['id']).first()
        except:
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(current_user, *args, **kwargs)

    return decorated
