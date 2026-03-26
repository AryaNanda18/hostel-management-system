from models.admin import Admin
from models import db
from werkzeug.security import generate_password_hash

def init_admin():
    if not Admin.query.filter_by(username='admin').first():
        new_admin = Admin(
            username='admin',
            password_hash=generate_password_hash('password123')
        )
        db.session.add(new_admin)
        db.session.commit()
