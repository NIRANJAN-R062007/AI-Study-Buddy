import os
from datetime import timedelta

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'your-secret-key-change-in-production'
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'dev-secret-key')
    DB_PATH = os.environ.get('DB_PATH', 'study_buddy.db')
    GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
