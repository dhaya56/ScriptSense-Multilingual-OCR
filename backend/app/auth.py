from flask import Blueprint, request, jsonify, current_app
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from app import db
from app.models import User  # ✅ Added import
from datetime import datetime, timedelta
import os
import jwt

auth_bp = Blueprint('auth', __name__)

# ------------------ Signup ------------------
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.json
    name = data.get('name')  # ✅ Full name
    email = data.get('email')
    password = data.get('password')

    if not name or not email or not password:
        return jsonify({'error': 'Name, email, and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User already exists'}), 409

    new_user = User(name=name, email=email, password=generate_password_hash(password))
    db.session.add(new_user)
    db.session.commit()

    return jsonify({'message': 'Signup successful'})


# ------------------ Login ------------------
SECRET_KEY = os.getenv('SECRET_KEY', 'your-secret-key')

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'error': 'Email and password are required'}), 400

    user = User.query.filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        token = jwt.encode({
            'user_id': user.id,
            'email': user.email,
            'exp': datetime.utcnow() + timedelta(hours=2)
        }, SECRET_KEY, algorithm='HS256')

        return jsonify({
            'message': 'Login successful',
            'token': token,
            'user': {
                'email': user.email,
                'is_admin': user.is_admin
            }
        })
    else:
        return jsonify({'error': 'Invalid credentials'}), 401


# ------------------ Token Verification ------------------
@auth_bp.route('/verify-token', methods=['POST'])
def verify_token():
    token = request.json.get('token')

    if not token:
        return jsonify({'error': 'Token missing'}), 400

    try:
        decoded = jwt.decode(token, SECRET_KEY, algorithms=['HS256'])
        return jsonify({
            'valid': True,
            'email': decoded['email'],
            'user_id': decoded['user_id']
        })
    except jwt.ExpiredSignatureError:
        return jsonify({'error': 'Token expired'}), 401
    except jwt.InvalidTokenError:
        return jsonify({'error': 'Invalid token'}), 401
