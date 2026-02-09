from app import db
from datetime import datetime

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    recent_documents = db.relationship('RecentDocument', backref='user', lazy=True)
    document_histories = db.relationship('DocumentHistory', backref='user', lazy=True)


class RecentDocument(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(50), nullable=False)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def to_dict(self):
        return {
            'filename': self.filename,
            'file_type': self.file_type,
            'uploaded_at': self.uploaded_at.strftime("%Y-%m-%d %H:%M:%S")
        }

class DocumentHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    filename = db.Column(db.String(255), nullable=False)
    upload_time = db.Column(db.DateTime, default=datetime.utcnow)
    detected_lang = db.Column(db.String(10))
    confidence = db.Column(db.Float)
    word_count = db.Column(db.Integer)
    char_count = db.Column(db.Integer)
    line_count = db.Column(db.Integer)
    page_count = db.Column(db.Integer)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)