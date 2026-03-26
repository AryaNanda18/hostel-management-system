import os
from flask import Blueprint, request, jsonify, current_app
from models.student_application import StudentApplication
from models import db
from werkzeug.utils import secure_filename
import json
from datetime import datetime

application_bp = Blueprint('application', __name__)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'pdf'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@application_bp.route('/', methods=['POST'])
def submit_application():
    try:
        data = request.form
        
        # Format validation for College ID
        import re
        college_admn_no = data.get('college_admn_no', '')
        if not re.match(r'^\d{4}B\d{3}$', college_admn_no):
            return jsonify({'message': 'Invalid College ID Format. Must be yyyyBxxx (e.g. 2025B001)'}), 400
            
        # Duplicate application prevention
        existing_app = StudentApplication.query.filter(
            StudentApplication.college_admn_no == college_admn_no,
            StudentApplication.application_status.in_(['Pending', 'Approved'])
        ).first()
        
        if existing_app:
            return jsonify({'message': f'You already have an active application with status: {existing_app.application_status}. You cannot apply again.'}), 400

        # Files handling
        if 'photo' not in request.files:
            return jsonify({'message': 'Photo is required'}), 400
            
        photo = request.files['photo']
        if photo.filename == '':
            return jsonify({'message': 'No selected photo'}), 400
            
        if 'caste_certificate' not in request.files:
            return jsonify({'message': 'Caste Certificate is required'}), 400
            
        caste_certificate = request.files['caste_certificate']
        if caste_certificate.filename == '':
            return jsonify({'message': 'No selected Caste Certificate'}), 400
            
        document = request.files.get('document')
        
        if photo and allowed_file(photo.filename):
            photo_filename = secure_filename(photo.filename)
            photo_path = os.path.join(current_app.config['UPLOAD_FOLDER'], photo_filename)
            photo.save(photo_path)
            
            # Need relative path for URL access or configure a proper static serving mapping for it
            photo_rel_path = f"uploads/{photo_filename}"
        else:
            return jsonify({'message': 'Invalid photo format'}), 400
            
        document_rel_path = None
        if document and document.filename != '' and allowed_file(document.filename):
            doc_filename = secure_filename(document.filename)
            doc_path = os.path.join(current_app.config['UPLOAD_FOLDER'], doc_filename)
            document.save(doc_path)
            document_rel_path = f"uploads/{doc_filename}"
            
        caste_cert_rel_path = None
        if caste_certificate and allowed_file(caste_certificate.filename):
            caste_filename = secure_filename(caste_certificate.filename)
            caste_path = os.path.join(current_app.config['UPLOAD_FOLDER'], f"caste_{caste_filename}")
            caste_certificate.save(caste_path)
            caste_cert_rel_path = f"uploads/caste_{caste_filename}"
        else:
            return jsonify({'message': 'Invalid caste certificate format'}), 400
            
        app = StudentApplication(
            student_name=data.get('student_name'),
            semester_branch=data.get('semester_branch'),
            let_status=data.get('let_status'),
            college_admn_no=data.get('college_admn_no'),
            parent_name=data.get('parent_name'),
            student_contact=data.get('student_contact'),
            permanent_address=data.get('permanent_address'),
            official_address=data.get('official_address'),
            dob=datetime.strptime(data.get('dob'), '%Y-%m-%d').date() if data.get('dob') else None,
            caste=data.get('caste'),
            religion=data.get('religion'),
            fee_concession=data.get('fee_concession'),
            nationality=data.get('nationality'),
            local_guardian_name=data.get('local_guardian_name'),
            local_guardian_address=data.get('local_guardian_address'),
            inside_outside_india=data.get('inside_outside_india'),
            state=data.get('state'),
            district=data.get('district'),
            category=data.get('category'),
            distance_km=float(data.get('distance_km', 0.0)),
            photo_path=photo_rel_path,
            document_path=document_rel_path,
            caste_certificate_path=caste_cert_rel_path,
            application_status='Pending'
        )
        
        db.session.add(app)
        db.session.commit()
        
        return jsonify({'message': 'Your hostel admission application has been submitted successfully.'}), 201

    except Exception as e:
        print(f"Error submitting application: {e}")
        return jsonify({'message': f'Server error: {str(e)}'}), 500
