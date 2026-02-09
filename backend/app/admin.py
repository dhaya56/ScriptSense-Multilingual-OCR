from flask import Blueprint, request, jsonify
from app import db
from app.models import User, RecentDocument, DocumentHistory
from datetime import datetime

admin_bp = Blueprint('admin', __name__)

# Middleware-style check for admin access
def is_admin_request():
    email = request.args.get('email') or request.json.get('email')
    if not email:
        return False, jsonify({'error': 'Admin email required'}), 400

    admin = User.query.filter_by(email=email).first()
    if not admin or not admin.is_admin:
        return False, jsonify({'error': 'Unauthorized'}), 403

    return True, admin, None

@admin_bp.route('/admin/users', methods=['POST'])
def get_all_users():
    ok, admin, err = is_admin_request()
    if not ok:
        return err

    users = User.query.all()
    return jsonify([
        {'email': u.email, 'id': u.id, 'is_admin': u.is_admin}
        for u in users
    ])

@admin_bp.route('/admin/documents', methods=['POST'])
def get_all_documents():
    ok, admin, err = is_admin_request()
    if not ok:
        return err

    docs = RecentDocument.query.order_by(RecentDocument.uploaded_at.desc()).all()
    return jsonify([
        {
            'user_id': doc.user_id,
            'filename': doc.filename,
            'type': doc.file_type,
            'uploaded_at': doc.uploaded_at.strftime('%Y-%m-%d %H:%M')
        }
        for doc in docs
    ])

@admin_bp.route('/admin/user-history', methods=['POST'])
def get_user_history_admin():
    ok, admin, err = is_admin_request()
    if not ok:
        return err

    data = request.json
    user_email = data.get('user_email')
    if not user_email:
        return jsonify({'error': 'User email required'}), 400

    history = DocumentHistory.query.filter_by(user_email=user_email).order_by(
        DocumentHistory.upload_time.desc()
    ).all()

    return jsonify([
        {
            'filename': h.filename,
            'upload_time': h.upload_time.strftime("%Y-%m-%d %H:%M:%S"),
            'language': h.detected_lang,
            'confidence': h.confidence,
            'word_count': h.word_count,
            'page_count': h.page_count
        }
        for h in history
    ])
