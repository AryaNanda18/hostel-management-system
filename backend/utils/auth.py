import jwt
from functools import wraps
from flask import request, jsonify, current_app
from models.admin import Admin
from models.student_application import StudentApplication
from models import db


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization'].split(" ")
            if len(auth_header) > 1:
                token = auth_header[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            if data['role'] == 'admin':
                current_user = db.session.get(Admin, data['id'])
            elif data['role'] == 'student':
                current_user = db.session.get(StudentApplication, data['id'])
            else:
                return jsonify({'message': 'Invalid role!'}), 401

            if not current_user:
                return jsonify({'message': 'User not found!'}), 401

        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token is invalid!'}), 401
        except Exception as e:
            print(f"Auth error: {e}")
            return jsonify({'message': 'Authentication failed!'}), 401

        return f(current_user, data['role'], *args, **kwargs)

    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization'].split(" ")
            if len(auth_header) > 1:
                token = auth_header[1]

        if not token:
            return jsonify({'message': 'Token is missing!'}), 401

        try:
            data = jwt.decode(token, current_app.config['SECRET_KEY'], algorithms=["HS256"])
            if data['role'] != 'admin':
                return jsonify({'message': 'Admin access required!'}), 403
            current_user = db.session.get(Admin, data['id'])
            if not current_user:
                return jsonify({'message': 'Admin not found!'}), 401
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired!'}), 401
        except Exception:
            return jsonify({'message': 'Token is invalid!'}), 401

        return f(current_user, *args, **kwargs)

    return decorated
