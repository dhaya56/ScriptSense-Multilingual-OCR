import os

class Config:
    # Base Paths
    BASE_DIR = os.path.abspath(os.path.dirname(__file__))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, 'static', 'uploads')
    RESULT_FOLDER = os.path.join(BASE_DIR, 'static', 'results')

    # Ensure folders exist
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)
    os.makedirs(RESULT_FOLDER, exist_ok=True)

    # Database
    DATABASE_PATH = os.path.join(BASE_DIR, 'database', 'users.db')
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    SQLALCHEMY_DATABASE_URI = f'sqlite:///{DATABASE_PATH}'
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    # Security
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-default-key'

    # OCR Supported Languages
    SUPPORTED_LANGUAGES = {
        'en': 'English',
        'ta': 'Tamil',
        'hi': 'Hindi',
        'ml': 'Malayalam',
        'te': 'Telugu',
        'kn': 'Kannada'
    }

    # Optional
    DEBUG = True
