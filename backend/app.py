from flask import Flask, send_from_directory
from config import Config
from models import db
from flask_cors import CORS
from routes.auth_routes import auth_bp
from routes.admin_routes import admin_bp
from routes.student_routes import student_bp
from routes.application_routes import application_bp
from routes.public_routes import public_bp
import os

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    CORS(app)
    db.init_app(app)
    
    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(admin_bp, url_prefix='/api/admin')
    app.register_blueprint(student_bp, url_prefix='/api/student')
    app.register_blueprint(application_bp, url_prefix='/api/application')
    app.register_blueprint(public_bp, url_prefix='/api/public')
    
    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

    # Create uploads directory if not exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    with app.app_context():
        db.create_all()
        from utils.db_init import init_admin
        init_admin()
        
    return app

app = create_app()

@app.route('/')
def home():
    return {"message": "Hostel Management System API is running"}

if __name__ == '__main__':
    app.run(debug=True, port=5000)
