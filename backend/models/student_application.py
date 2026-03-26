from . import db
from datetime import datetime


class StudentApplication(db.Model):
    __tablename__ = 'students_applications'

    id = db.Column(db.Integer, primary_key=True)
    student_name = db.Column(db.String(150), nullable=False)
    semester_branch = db.Column(db.String(100), nullable=False)
    let_status = db.Column(db.String(10), nullable=False)
    college_admn_no = db.Column(db.String(50), nullable=False)
    parent_name = db.Column(db.String(150), nullable=False)
    student_contact = db.Column(db.String(20), nullable=False)
    permanent_address = db.Column(db.Text, nullable=False)
    official_address = db.Column(db.Text, nullable=False)
    dob = db.Column(db.Date, nullable=False)
    caste = db.Column(db.String(50), nullable=False)
    religion = db.Column(db.String(50), nullable=False)
    fee_concession = db.Column(db.String(10), nullable=False)
    nationality = db.Column(db.String(50), nullable=False)
    local_guardian_name = db.Column(db.String(150), nullable=False)
    local_guardian_address = db.Column(db.Text, nullable=False)
    inside_outside_india = db.Column(db.String(20), nullable=False)
    state = db.Column(db.String(50), nullable=False)
    district = db.Column(db.String(50), nullable=True)
    category = db.Column(db.String(50), nullable=False)
    distance_km = db.Column(db.Float, nullable=False)
    photo_path = db.Column(db.String(255), nullable=False)
    document_path = db.Column(db.String(255), nullable=True) # Used for standard PDF doc
    caste_certificate_path = db.Column(db.String(255), nullable=False)

    # ── Admission status ──────────────────────────────────────────────────────
    application_status = db.Column(db.String(20), default='Pending')
    rejection_reason = db.Column(db.Text, nullable=True)
    priority_rank = db.Column(db.Integer, nullable=True)
    hostel_admission_no = db.Column(db.String(50), unique=True, nullable=True)
    generated_password = db.Column(db.String(255), nullable=True)
    admission_fee = db.Column(db.Float, nullable=True)
    caution_deposit = db.Column(db.Float, nullable=True)
    payment_status = db.Column(db.String(20), default='N/A')
    payment_date = db.Column(db.String(50), nullable=True)

    # ── WhatsApp notification flags ───────────────────────────────────────────
    whatsapp_approval_sent = db.Column(db.Boolean, default=False)
    whatsapp_credentials_sent = db.Column(db.Boolean, default=False)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'student_name': self.student_name,
            'semester_branch': self.semester_branch,
            'let_status': self.let_status,
            'college_admn_no': self.college_admn_no,
            'parent_name': self.parent_name,
            'student_contact': self.student_contact,
            'permanent_address': self.permanent_address,
            'official_address': self.official_address,
            'dob': self.dob.strftime('%Y-%m-%d') if self.dob else None,
            'caste': self.caste,
            'religion': self.religion,
            'fee_concession': self.fee_concession,
            'nationality': self.nationality,
            'local_guardian_name': self.local_guardian_name,
            'local_guardian_address': self.local_guardian_address,
            'inside_outside_india': self.inside_outside_india,
            'state': self.state,
            'district': self.district,
            'category': self.category,
            'distance_km': self.distance_km,
            'photo_path': self.photo_path,
            'document_path': self.document_path,
            'caste_certificate_path': self.caste_certificate_path,
            'application_status': self.application_status,
            'rejection_reason': self.rejection_reason,
            'priority_rank': self.priority_rank,
            'hostel_admission_no': self.hostel_admission_no,
            'admission_fee': self.admission_fee,
            'caution_deposit': self.caution_deposit,
            'payment_status': self.payment_status,
            'payment_date': self.payment_date,
            # whatsapp flags
            'whatsapp_approval_sent': self.whatsapp_approval_sent,
            'whatsapp_credentials_sent': self.whatsapp_credentials_sent,
            'created_at': self.created_at.strftime('%Y-%m-%d %H:%M:%S') if self.created_at else None,
        }
