from flask import Blueprint, request, jsonify, send_file, current_app
from werkzeug.utils import secure_filename
import mimetypes
import traceback
import os
import uuid
import threading
import time

# Import only what's directly used in this file for clarity and to avoid circular dependencies
from app.ocr_engine import process_document, extract_text_dynamic, save_to_pdf, save_to_docx
from app.utils import detect_language, normalize_lang, correct_spelling, grammar_correction # Re-importing these if needed for specific routes like reprocess_text or direct detection
from app.models import db, User, RecentDocument, DocumentHistory
from app.translator import translate_text # Kept for reprocess_text translate_text
from config import Config

bp = Blueprint('main', __name__)

UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'static/uploads')
RESULT_FOLDER = os.getenv('RESULT_FOLDER', 'static/results')

# Ensure upload and result folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(RESULT_FOLDER, exist_ok=True)

# Directly use Config.SUPPORTED_LANGUAGES as it's defined in config.py
LANGUAGE_MAP = Config.SUPPORTED_LANGUAGES
REVERSE_LANGUAGE_MAP = {v.lower(): k for k, v in LANGUAGE_MAP.items()}

ocr_jobs = {}  # job_id: {"status": ..., "cancel": ..., "result": ...}
ocr_lock = threading.Lock()


@bp.route('/upload', methods=['POST'])
def upload_file():
    file = request.files.get('file')
    source_lang = request.form.get('source_lang') # This will be passed to process_document
    target_lang = request.form.get('target_lang')
    user_email = request.form.get('email')
    enhance_flag = request.form.get('enhance', 'false').lower() == 'true'

    if not file or not user_email:
        return jsonify({'error': 'Missing file or user email'}), 400

    filename = secure_filename(file.filename)
    upload_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(upload_path)

    job_id = str(uuid.uuid4())
    with ocr_lock:
        ocr_jobs[job_id] = {"status": "queued", "cancel": False}

    # Capture the actual app and its context for the background thread
    app = current_app._get_current_object()

    def background_ocr(app_context):
        with app_context:
            time.sleep(0.5) # Small delay before starting processing
            with ocr_lock:
                if ocr_jobs[job_id]["cancel"]:
                    ocr_jobs[job_id]["status"] = "cancelled"
                    print(f"[INFO] OCR job {job_id} cancelled before processing.")
                    return
                ocr_jobs[job_id]["status"] = "processing"
                print(f"[INFO] OCR job {job_id} started processing for file: {filename}")

            try:
                # Pass source_lang to process_document
                result = process_document(upload_path, source_lang, target_lang, enhance_flag)

                if "error" in result:
                    raise Exception(result["error"])

                # Save history to DB
                user = User.query.filter_by(email=user_email).first()
                if user:
                    recent_doc = RecentDocument(
                        filename=filename,
                        file_type=os.path.splitext(filename)[1][1:].upper(),
                        user_id=user.id
                    )
                    doc_history = DocumentHistory(
                        filename=filename,
                        detected_lang=result.get("detected_language"),
                        confidence=result.get("confidence"),
                        word_count=result["stats"].get("word_count", 0),
                        char_count=result["stats"].get("char_count", 0),
                        line_count=result["stats"].get("line_count", 0),
                        page_count=result["stats"].get("page_count", 1),
                        user_id=user.id
                    )
                    db.session.add(recent_doc)
                    db.session.add(doc_history)
                    db.session.commit()
                    print(f"[INFO] Document history saved for user {user_email}, job {job_id}.")
                else:
                    print(f"[WARN] User with email {user_email} not found. Skipping DB log for document history.")

                with ocr_lock:
                    ocr_jobs[job_id]["status"] = "done"
                    ocr_jobs[job_id]["result"] = result
                print(f"[INFO] OCR job {job_id} completed successfully.")

            except Exception as e:
                traceback.print_exc()
                with ocr_lock:
                    ocr_jobs[job_id]["status"] = "error"
                    ocr_jobs[job_id]["result"] = {"error": str(e), "traceback": traceback.format_exc()}
                print(f"[ERROR] OCR job {job_id} failed: {e}")
            finally:
                # Clean up uploaded file after processing
                if os.path.exists(upload_path):
                    os.unlink(upload_path)
                    print(f"[INFO] Cleaned up uploaded file: {upload_path}")


    # Start background thread with app context
    threading.Thread(target=background_ocr, args=(app.app_context(),), daemon=True).start()

    return jsonify({"job_id": job_id})


@bp.route('/status/<job_id>', methods=['GET'])
def get_job_status(job_id):
    with ocr_lock:
        job = ocr_jobs.get(job_id)
        if not job:
            return jsonify({'error': 'Invalid job ID'}), 404
        return jsonify({
            'status': job['status'],
            'result': job.get('result', {}) if job['status'] == 'done' or job['status'] == 'error' else {}
        })


@bp.route('/cancel/<job_id>', methods=['POST'])
def cancel_job(job_id):
    with ocr_lock:
        job = ocr_jobs.get(job_id)
        if not job:
            return jsonify({'error': 'Invalid job ID'}), 404
        
        if job["status"] == "processing" or job["status"] == "queued":
            job["cancel"] = True
            job["status"] = "cancelled"
            print(f"[INFO] OCR job {job_id} cancellation requested.")
            return jsonify({'message': 'OCR job cancellation requested.'})
        else:
            return jsonify({'message': f'Cannot cancel job in {job["status"]} status.'}), 400


@bp.route('/save-edited-text', methods=['POST'])
def save_edited_text():
    data = request.json
    edited_text = data.get('text')
    format_type = data.get('format', 'pdf') # Default to pdf
    lang_code = data.get('lang_code', 'en') # Add language code for PDF saving

    if not edited_text:
        return jsonify({'error': 'No text provided'}), 400

    file_id = str(uuid.uuid4())
    result_path = os.path.join(RESULT_FOLDER, f"edited_{file_id}.{format_type}")
    
    try:
        if format_type == 'docx':
            save_to_docx(edited_text, result_path)
        elif format_type == 'pdf':
            # Pass lang_code to save_to_pdf for correct font rendering
            save_to_pdf(edited_text, result_path, lang_code=lang_code) 
        else:
            return jsonify({'error': 'Unsupported format type for saving.'}), 400

        print(f"[INFO] Edited file saved to: {result_path}")
        return jsonify({
            'message': 'Edited file saved successfully',
            'download_url': f"/{result_path}"
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': f'Failed to save edited file: {str(e)}'}), 500


@bp.route('/recent-documents', methods=['POST']) # Typically GET for fetching, but POST for email is common
def recent_documents():
    user_email = request.json.get('email')
    if not user_email:
        return jsonify({'error': 'Email is required'}), 400

    user = User.query.filter_by(email=user_email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    recent = RecentDocument.query.filter_by(user_id=user.id).order_by(
        RecentDocument.uploaded_at.desc()).limit(10).all()

    return jsonify([doc.to_dict() for doc in recent])


@bp.route('/history/<email>', methods=['GET'])
def get_user_history(email):
    user = User.query.filter_by(email=email).first()
    if not user:
        return jsonify({'error': 'User not found'}), 404

    history = DocumentHistory.query.filter_by(user_id=user.id).order_by(
        DocumentHistory.upload_time.desc()).all()

    return jsonify([{
        "filename": h.filename,
        "upload_time": h.upload_time.strftime("%Y-%m-%d %H:%M:%S"),
        "language": h.detected_lang,
        "confidence": h.confidence,
        "word_count": h.word_count,
        "page_count": h.page_count
    } for h in history])

@bp.route('/download/<path:filename>', methods=['GET'])
def download_file(filename):
    result_folder_path = current_app.config.get('RESULT_FOLDER', os.path.abspath(os.getenv('RESULT_FOLDER', 'static/results')))
    requested_absolute_path = os.path.abspath(os.path.join(result_folder_path, filename))
    if not requested_absolute_path.startswith(result_folder_path):
        print(f"[SECURITY WARNING] Attempted directory traversal: {filename}")
        return jsonify({'error': 'Access denied.'}), 403 # Forbidden

    if os.path.exists(requested_absolute_path) and os.path.isfile(requested_absolute_path):
        # Determine the MIME type based on the file extension
        mimetype, _ = mimetypes.guess_type(requested_absolute_path)

        # Fallback if mimetype cannot be guessed (though should work for .pdf/.docx)
        if not mimetype:
            mimetype = 'application/octet-stream'

        # --- ADD THESE PRINT STATEMENTS ---
        print(f"[DEBUG] File requested: {filename}")
        print(f"[DEBUG] Absolute file path: {requested_absolute_path}")
        print(f"[DEBUG] Guessed MIME type by mimetypes.guess_type: {mimetype}")
        # --- END PRINT STATEMENTS ---

        return send_file(
            requested_absolute_path, # Use the absolute path
            as_attachment=True,
            download_name=filename, # Suggest the original filename
            mimetype=mimetype # Explicitly set the determined MIME type
        )
    
    print(f"[WARN] Download requested for non-existent or unsafe file: {filename} in {result_folder_path}")
    return jsonify({'error': 'File not found or access denied.'}), 404

@bp.route('/detect-language', methods=['POST'])
def detect_language_route():
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400

    filename = secure_filename(file.filename)
    upload_path = os.path.join(UPLOAD_FOLDER, filename)
    file.save(upload_path)

    try:
        # Use extract_text_dynamic to get text from various file types.
        # Pass a default 'en' as source_lang, it won't affect detection.
        text, _, _ = extract_text_dynamic(upload_path, source_lang='en') 
        if not text.strip():
            return jsonify({'error': 'No text extracted for language detection.'}), 400

        lang_code, confidence = detect_language(text.strip())
        # Use LANGUAGE_MAP to get the full language name from its code
        lang_name = LANGUAGE_MAP.get(lang_code, lang_code) 

        return jsonify({
            'detected_lang_code': lang_code,
            'detected_lang_name': lang_name,
            'confidence': confidence
        })
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': f'Language detection failed: {str(e)}'}), 500
    finally:
        if os.path.exists(upload_path):
            os.unlink(upload_path) # Clean up uploaded file


@bp.route('/reprocess-text', methods=['POST'])
def reprocess_text():
    data = request.json
    text = data.get('text', '')
    source_lang = data.get('source_lang') # Source language of the 'text' provided
    target_lang = data.get('target_lang', 'en')
    area = data.get('area', 'extracted') # 'extracted' or 'translated'

    if not text:
        return jsonify({'error': 'No text provided'}), 400

    # Normalize target_lang for consistency with LANGUAGE_MAP keys
    target_lang_code = normalize_lang(target_lang) or 'en'
    # Normalize source_lang for consistency if provided
    source_lang_code = normalize_lang(source_lang) if source_lang else None

    try:
        if area == 'extracted':
            # correct_spelling and grammar_correction now return just the string
            corrected_text = correct_spelling(text, lang_code=source_lang_code) # Pass source_lang_code
            
            detected_lang_code, confidence = detect_language(corrected_text)
            # Use detected_lang_code as source for translation if source_lang_code wasn't explicitly provided
            lang_for_translation = source_lang_code or detected_lang_code 
            
            translated = translate_text(corrected_text, lang_for_translation, target_lang_code)
            
            translated_corrected = correct_spelling(translated, lang_code=target_lang_code)
            translated_final = grammar_correction(translated_corrected, lang_code=target_lang_code)

            return jsonify({
                "corrected_text": corrected_text,
                "translated_text": translated_final,
                "detected_language": detected_lang_code, # Language of the (corrected) extracted text
                "confidence": confidence
            })

        elif area == 'translated':
            corrected_translated = correct_spelling(text, lang_code=target_lang_code)
            corrected_translated = grammar_correction(corrected_translated, lang_code=target_lang_code)
            return jsonify({
                "corrected_text": "", # This area is only for translated text correction
                "translated_text": corrected_translated,
                "detected_language": target_lang_code, # The language of the text being reprocessed
                "confidence": 1.0 # Assume high confidence as it's user-provided/translated
            })

        return jsonify({'error': 'Invalid area value. Must be "extracted" or "translated".'}), 400
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': f'Text reprocessing failed: {str(e)}'}), 500


@bp.route('/feedback', methods=['POST'])
def save_feedback():
    data = request.json
    email = data.get('email')
    feedback_text = data.get('feedback')

    if not email or not feedback_text:
        return jsonify({'error': 'Missing feedback or email'}), 400

    try:
        with open("feedback_log.txt", "a", encoding="utf-8") as f:
            f.write(f"[{email}] {feedback_text}\n")
        print(f"[INFO] Feedback received from {email}.")
        return jsonify({'message': 'Feedback submitted successfully'})
    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': f'Failed to save feedback: {str(e)}'}), 500


@bp.route('/admin/users', methods=['POST']) # Consider changing to GET if sensitive info is in URL
def get_all_users():
    email = request.json.get('email')
    admin = User.query.filter_by(email=email).first()
    if not admin or not admin.is_admin:
        return jsonify({'error': 'Unauthorized'}), 403

    users = User.query.all()
    return jsonify([{"email": u.email, "is_admin": u.is_admin} for u in users])


@bp.route('/feedback/<email>', methods=['GET'])
def view_user_feedback(email):
    feedback_list = []
    try:
        if not os.path.exists("feedback_log.txt"):
            return jsonify({'error': 'Feedback log not found'}), 404

        with open("feedback_log.txt", "r", encoding="utf-8") as f:
            for line in f:
                if line.startswith(f"[{email}]"):
                    feedback_text = line.strip().split("] ", 1)[-1]
                    feedback_list.append(feedback_text)
        
        if not feedback_list:
            return jsonify({'message': 'No feedback found for this user.'})

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': f'Failed to retrieve feedback: {str(e)}'}), 500

    return jsonify({"email": email, "feedback": feedback_list})