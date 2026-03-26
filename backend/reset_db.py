from app import create_app
from models import db
import os

app = create_app()

def reset_database():
    with app.app_context():
        print("Cleaning up existing database...")
        # Drop all tables
        db.drop_all()
        # Create all tables with new schema
        db.create_all()
        
        # Initialize admin
        from utils.db_init import init_admin
        init_admin()
        
        print("✅ Database successfully reset with new schema!")
        print("✅ Admin user created: admin / password123")

if __name__ == '__main__':
    reset_database()
