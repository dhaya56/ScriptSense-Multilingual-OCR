import os
import re
import cv2
import shutil
import traceback
import tempfile
import language_tool_python
from langdetect import detect_langs
from zipfile import ZipFile
from docx import Document
import fitz  # PyMuPDF
import numpy as np
from PIL import Image
from spello.model import SpellCorrectionModel

# Placeholder for Config and LANGUAGE_MAP
class Config:
    SUPPORTED_LANGUAGES = {
        "en": "English",
        "ta": "Tamil",
        "hi": "Hindi",
        "ml": "Malayalam",
        "te": "Telugu",
        "kn": "Kannada"
    }

LANGUAGE_MAP = Config.SUPPORTED_LANGUAGES
REVERSE_LANGUAGE_MAP = {v.lower(): k for k, v in LANGUAGE_MAP.items()}

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
FONT_DIR = os.path.join(BASE_DIR, "fonts")

LANG_FONT_MAP = {
    "en": os.path.join(FONT_DIR, "NotoSans-Regular.ttf"),
    "ta": os.path.join(FONT_DIR, "NotoSansTamil-Regular.ttf"),
    "hi": os.path.join(FONT_DIR, "NotoSansDevanagari-Regular.ttf"),
    "ml": os.path.join(FONT_DIR, "NotoSansMalayalam-Regular.ttf"),
    "te": os.path.join(FONT_DIR, "NotoSansTelugu-Regular.ttf"),
    "kn": os.path.join(FONT_DIR, "NotoSansKannada-Regular.ttf"),
}

_spello_models = {}


def segment_text_lines_opencv(image_path, min_height=10, min_width=20, line_threshold_y=15, dilation_kernel_size=(3,3)):
    try:
        image_np = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if image_np is None:
            print(f"[ERROR] Could not read image for segmentation at {image_path}. Returning empty list.")
            return []

        # Apply OTSU thresholding. Assume input is already preprocessed (deskewed, etc.)
        _, binary_img = cv2.threshold(image_np, 0, 255, cv2.THRESH_BINARY_INV | cv2.THRESH_OTSU)
        # Note: Used THRESH_BINARY_INV to make text white and background black, which is often better for contour finding

        # Optional: Apply dilation to connect broken characters.
        # This can help in grouping parts of the same word/character into a single contour.
        kernel = np.ones(dilation_kernel_size, np.uint8)
        dilated_img = cv2.dilate(binary_img, kernel, iterations=1)
        
        contours, _ = cv2.findContours(dilated_img, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        line_boxes = []
        for contour in contours:
            x, y, w, h = cv2.boundingRect(contour)
            if w > min_width and h > min_height:
                line_boxes.append({'x': x, 'y': y, 'w': w, 'h': h, 'y_center': y + h/2})

        line_boxes.sort(key=lambda b: b['y_center']) # Sort by center y-coordinate

        merged_lines = []
        if not line_boxes:
            print(f"[WARN] No significant contours found for segmentation in {os.path.basename(image_path)}. Returning empty list.")
            return []

        current_line_group = [line_boxes[0]]
        for i in range(1, len(line_boxes)):
            # Check if current box is close enough to the previous box in the group vertically
            # The 'line_threshold_y' can be adjusted. For handwritten, a larger value might be needed.
            # Using intersection over union (IOU) along Y-axis for more robust merging
            prev_box_y1 = current_line_group[-1]['y']
            prev_box_y2 = current_line_group[-1]['y'] + current_line_group[-1]['h']
            curr_box_y1 = line_boxes[i]['y']
            curr_box_y2 = line_boxes[i]['y'] + line_boxes[i]['h']

            # Calculate intersection
            intersection_y1 = max(prev_box_y1, curr_box_y1)
            intersection_y2 = min(prev_box_y2, curr_box_y2)
            intersection_height = max(0, intersection_y2 - intersection_y1)

            # Calculate union
            union_height = (prev_box_y2 - prev_box_y1) + (curr_box_y2 - curr_box_y1) - intersection_height

            iou_y = intersection_height / union_height if union_height > 0 else 0

            # Also consider distance between bounding box tops (or centers)
            # The previous logic used center distance. Let's refine for a more common line grouping.
            # Consider if the current box's top is within the vertical range of the last box of the current line group
            # OR if their y_centers are close
            is_same_line = (abs(line_boxes[i]['y_center'] - current_line_group[-1]['y_center']) < line_threshold_y) or \
                           (iou_y > 0.5) # If there's significant vertical overlap

            if is_same_line:
                current_line_group.append(line_boxes[i])
            else:
                # Merge current_line_group into a single bounding box
                x_min_group = min(b['x'] for b in current_line_group)
                y_min_group = min(b['y'] for b in current_line_group)
                x_max_group = max(b['x'] + b['w'] for b in current_line_group)
                y_max_group = max(b['y'] + b['h'] for b in current_line_group)
                merged_lines.append((x_min_group, y_min_group, x_max_group - x_min_group, y_max_group - y_min_group))
                current_line_group = [line_boxes[i]]

        # Add the last group
        if current_line_group:
            x_min_group = min(b['x'] for b in current_line_group)
            y_min_group = min(b['y'] for b in current_line_group)
            x_max_group = max(b['x'] + b['w'] for b in current_line_group)
            y_max_group = max(b['y'] + b['h'] for b in current_line_group)
            merged_lines.append((x_min_group, y_min_group, x_max_group - x_min_group, y_max_group - y_min_group))

        # Sort final merged lines by Y-coordinate
        merged_lines.sort(key=lambda b: b[1])

        cropped_line_images = []
        for x, y, w, h in merged_lines:
            # Add padding to ensure no text is cut off and provide context for OCR
            padding_x = 10 # More horizontal padding
            padding_y = 5  # Vertical padding
            x_start = max(0, x - padding_x)
            y_start = max(0, y - padding_y)
            x_end = min(image_np.shape[1], x + w + padding_x)
            y_end = min(image_np.shape[0], y + h + padding_y)

            cropped_img_np = image_np[y_start:y_end, x_start:x_end]
            
            # --- NEW CHECK HERE ---
            if cropped_img_np is None or cropped_img_np.size == 0:
                print(f"[WARN] Cropped image NumPy array is empty or None for line: {x,y,w,h}. Skipping.")
                continue # Skip this iteration if the cropped array is invalid
            # --- END NEW CHECK ---

            if cropped_img_np.shape[0] > 0 and cropped_img_np.shape[1] > 0:
                # Convert to RGB before creating PIL Image, as TrOCR expects RGB
                cropped_img_rgb = cv2.cvtColor(cropped_img_np, cv2.COLOR_GRAY2RGB)
                cropped_line_images.append((Image.fromarray(cropped_img_rgb), y_start))
            else:
                print(f"[WARN] Skipped empty cropped image for line: {x,y,w,h} (after padding adjust).")

        return cropped_line_images

    except Exception as e:
        print(f"[ERROR] Error during text line segmentation for {os.path.basename(image_path)}: {e}")
        traceback.print_exc()
        return []


def detect_language(text):
    try:
        if not text.strip():
            return 'en', 1.0
        detected = detect_langs(text)
        if detected:
            lang = detected[0].lang
            prob = detected[0].prob
            if lang in LANGUAGE_MAP:
                return lang, prob
            mapped = REVERSE_LANGUAGE_MAP.get(lang.lower(), 'en')
            return mapped, prob
    except Exception as e:
        print(f"[ERROR] Language detection failed: {e}")
        traceback.print_exc()
    return 'en', 1.0


def normalize_lang(lang_code):
    if lang_code and lang_code.lower() in REVERSE_LANGUAGE_MAP:
        return REVERSE_LANGUAGE_MAP[lang_code.lower()]
    return lang_code

def get_doc_stats(text, file_path, chars_per_line=80):
    num_words = len(text.split())

    # Accurate character counts
    char_count_with_spaces = len(text)
    char_count_no_spaces = len(text.replace(" ", "").replace("\n", "").replace("\t", ""))

    # Estimated line count
    estimated_line_count = max(1, round(len(text) / chars_per_line))

    # Page count logic
    file_type = os.path.splitext(file_path)[1].lower()
    num_pages = 1

    if file_type == ".pdf":
        try:
            import fitz
            doc = fitz.open(file_path)
            num_pages = len(doc)
            doc.close()
        except Exception as e:
            print(f"[WARN] PDF page count failed: {e}")
    elif file_type == ".docx":
        try:
            from docx import Document
            doc = Document(file_path)
            total_words = sum(len(p.text.split()) for p in doc.paragraphs)
            num_pages = max(1, round(total_words / 300))
        except Exception as e:
            print(f"[WARN] DOCX page count failed: {e}")

    return {
        "word_count": num_words,
        "char_count_with_spaces": char_count_with_spaces,
        "char_count_no_spaces": char_count_no_spaces,
        "line_count": estimated_line_count,
        "page_count": num_pages
    }

def highlight_low_confidence_words(text, low_conf_words):
    sorted_low_conf = sorted(list(set(low_conf_words)), key=len, reverse=True)
    for word in sorted_low_conf:
        if word.strip():
            pattern = r'\b' + re.escape(word) + r'\b'
            text = re.sub(pattern, f"<mark>{word}</mark>", text)
    return text


def _load_spello_model(lang_code):
    if lang_code not in _spello_models:
        model = SpellCorrectionModel(language=lang_code)
        model_loaded = False
        try:
            if lang_code == 'en':
                model_path = os.path.abspath(os.path.join(BASE_DIR, 'en.pkl'))
            elif lang_code == 'hi':
                model_path = os.path.abspath(os.path.join(BASE_DIR, 'hi.pkl'))
            else:
                print(f"[INFO] No spello model configured for language: {lang_code}.")
                _spello_models[lang_code] = None
                return None

            if os.path.exists(model_path):
                print(f"[INFO] Loading Spello model from: {model_path}")
                model.load(model_path)
                model_loaded = True
            else:
                print(f"[WARN] Spello model not found at {model_path}. Skipping.")

            _spello_models[lang_code] = model if model_loaded else None
        except Exception as e:
            print(f"[WARN] Could not load spello model for {lang_code}: {e}")
            traceback.print_exc()
            _spello_models[lang_code] = None
    return _spello_models.get(lang_code)


def correct_spelling(text, lang_code='en'):
    try:
        if lang_code.lower() not in ['en', 'hi']:
            print(f"[INFO] Skipping spell correction for language: {lang_code}.")
            return text

        print(f"[INFO] Attempting spell correction for language: {lang_code}")
        spello_model = _load_spello_model(lang_code.lower())
        if spello_model:
            result = spello_model.spell_correct(text)
            return result.get('spell_corrected_text', text)
        else:
            print(f"[INFO] No loaded spello model for {lang_code}.")
            return text
    except Exception as e:
        print(f"[ERROR] Spell correction failed for language {lang_code}: {e}")
        traceback.print_exc()
        return text


def grammar_correction(text, lang_code='en'):
    try:
        if lang_code.lower() != 'en':
            print(f"[INFO] Skipping grammar correction for language: {lang_code}.")
            return text
        print(f"[INFO] Attempting grammar correction for language: {lang_code}")
        tool = language_tool_python.LanguageTool(lang_code)
        matches = tool.check(text)
        corrected = language_tool_python.utils.correct(text, matches)
        tool.close()
        return corrected
    except Exception as e:
        print(f"[ERROR] Grammar correction failed for language {lang_code}: {e}")
        traceback.print_exc()
        return text


def detect_handwritten_or_printed(image_path):
    try:
        gray = cv2.imread(image_path, cv2.IMREAD_GRAYSCALE)
        if gray is None:
            print(f"[WARN] Unable to read image at {image_path} for handwriting detection.")
            return False
        blurred_gray = cv2.GaussianBlur(gray, (5, 5), 0)
        variance = cv2.Laplacian(blurred_gray, cv2.CV_64F).var()
        is_handwritten = variance < 180
        print(f"[INFO] Image {image_path} variance: {variance}. Detected as {'Handwritten' if is_handwritten else 'Printed'}.")
        return is_handwritten
    except Exception as e:
        print(f"[ERROR] Handwriting detection failed for {image_path}: {e}")
        traceback.print_exc()
        return False


def extract_images_from_docx(docx_path):
    image_paths = []
    with tempfile.TemporaryDirectory() as temp_dir:
        try:
            with ZipFile(docx_path, 'r') as zip_ref:
                zip_ref.extractall(temp_dir)
            media_folder = os.path.join(temp_dir, "word", "media")
            if os.path.exists(media_folder):
                for file_name in os.listdir(media_folder):
                    if file_name.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.tiff')):
                        src_path = os.path.join(media_folder, file_name)
                        dst_path = os.path.join(temp_dir, file_name)
                        shutil.copyfile(src_path, dst_path)
                        image_paths.append(dst_path)
        except Exception as e:
            print(f"[ERROR] Failed to extract images from DOCX '{docx_path}': {e}")
            traceback.print_exc()
    return image_paths
