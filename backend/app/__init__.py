from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from config import Config

db = SQLAlchemy()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    CORS(app)  # Enable Cross-Origin if frontend and backend are on different ports

    db.init_app(app)

    with app.app_context():
        from app import models  # Import models to register with db
        db.create_all()

    # Register blueprints
    from app.routes import bp as main_routes
    from app.auth import auth_bp
    app.register_blueprint(main_routes)
    app.register_blueprint(auth_bp, url_prefix='/auth')

    try:
        from app.tts import tts_bp
        app.register_blueprint(tts_bp, url_prefix='/tts')
    except ImportError:
        print("TTS module not loaded.")

    return app
