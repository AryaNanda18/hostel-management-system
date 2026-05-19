import os
from dotenv import load_dotenv

basedir = os.path.abspath(os.path.dirname(__file__))
load_dotenv(os.path.join(basedir, '.env'))

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'super-secret-key-change-it'

    # Get DATABASE_URL from environment
    db_url = os.environ.get('DATABASE_URL', '')

    # Render provides postgres:// but SQLAlchemy needs postgresql://
    if db_url.startswith('postgres://'):
        db_url = db_url.replace('postgres://', 'postgresql://', 1)

    if db_url.startswith('sqlite:///'):
        rel_path = db_url.replace('sqlite:///', '')
        abs_path = os.path.join(basedir, rel_path)
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{abs_path}"
    elif db_url:
        SQLALCHEMY_DATABASE_URI = db_url
    else:
        SQLALCHEMY_DATABASE_URI = f"sqlite:///{os.path.join(basedir, 'instance', 'hostel.db')}"

    SQLALCHEMY_TRACK_MODIFICATIONS = False
    UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
    MAX_CONTENT_LENGTH = 16 * 1024 * 1024  # 16 MB limit
