from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

from .admin import Admin
from .student_application import StudentApplication
