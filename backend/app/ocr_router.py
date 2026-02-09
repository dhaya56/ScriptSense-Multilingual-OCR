import os
import torch
from PIL import Image
from paddleocr import PaddleOCR
from transformers import TrOCRProcessor, VisionEncoderDecoderModel
# Import the new segment_text_lines_opencv function
from app.utils import detect_handwritten_or_printed, segment_text_lines_opencv 
import traceback

# ------------------ Device Setup ------------------
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
print(f"[INFO] Using device: {device}")

# ------------------ Global OCR Engine Instances (Cached) ------------------
_paddle_ocr_models = {} # Cache for PaddleOCR instances per language

# TrOCR is primarily for English handwritten text with the current model.
# If multi-lingual handwritten OCR is required, a different TrOCR model or fine-tuning is needed.
processor = TrOCRProcessor.from_pretrained("microsoft/trocr-base-handwritten")
model = VisionEncoderDecoderModel.from_pretrained("microsoft/trocr-base-handwritten").to(device)
model.eval()

# Helper to get/initialize PaddleOCR instance for a given language
def _get_paddle_ocr_instance(lang_code):
    """
    Lazily initializes and returns a PaddleOCR instance for the given language code.
    Falls back to 'en' if the specific language model fails to load.
    """
    if lang_code not in _paddle_ocr_models:
        print(f"[INFO] Initializing PaddleOCR for language: {lang_code}")
        try:
            # use_gpu=True ensures GPU is utilized if available
            _paddle_ocr_models[lang_code] = PaddleOCR(use_angle_cls=True, lang=lang_code, use_gpu=torch.cuda.is_available(), show_log=False)
            print(f"[INFO] PaddleOCR for '{lang_code}' loaded successfully.")
        except Exception as e:
            print(f"[ERROR] Failed to load PaddleOCR for '{lang_code}': {e}.")
            print(f"[WARN] Falling back to 'en' PaddleOCR model for '{lang_code}'.")
            if 'en' not in _paddle_ocr_models: # Ensure 'en' fallback is also loaded if not already
                _paddle_ocr_models['en'] = PaddleOCR(use_angle_cls=True, lang='en', use_gpu=torch.cuda.is_available(), show_log=False)
            _paddle_ocr_models[lang_code] = _paddle_ocr_models['en'] # Assign 'en' fallback
    return _paddle_ocr_models[lang_code]

# ------------------ PP-OCRv3 Handler ------------------
def run_ppocr(image_path, lang='en'):
    try:
        print(f"[INFO] Running PaddleOCR (lang='{lang}') on: {image_path}")
        ocr_instance = _get_paddle_ocr_instance(lang)
        result = ocr_instance.ocr(image_path, cls=True)

        if not result or not result[0]:
            print(f"[WARN] No OCR result from PaddleOCR for {image_path} with lang='{lang}'.")
            return "", [], []

        extracted_text = ""
        word_conf_list = []
        low_conf_words = []

        for line_data in result[0]:
            try:
                text_conf = line_data[1]

                # Handle both tuple and list formats for (text, confidence)
                if isinstance(text_conf, (list, tuple)) and len(text_conf) == 2:
                    full_line = text_conf[0]
                    conf = float(text_conf[1])

                    words = full_line.split()
                    for word in words:
                        word_conf_list.append((word, conf))
                        if conf < 0.7:
                            low_conf_words.append(word)

                    extracted_text += full_line + " "
                else:
                    # Fallback if format is not standard
                    print(f"[WARN] Unexpected OCR data format: {text_conf}")
                    if isinstance(text_conf, str):
                        word = text_conf
                        conf = 0.5  # Assume low confidence
                        word_conf_list.append((word, conf))
                        low_conf_words.append(word)
                        extracted_text += word + " "

            except Exception as inner_e:
                print(f"[ERROR] Failed to parse OCR line: {line_data}. Error: {inner_e}")
                traceback.print_exc()

        # Debug: sample of results
        print("[DEBUG] Word Confidence Scores (sample):", word_conf_list[:3])
        print("[DEBUG] Flattened Confidence Scores (sample):", [conf for _, conf in word_conf_list[:3]])

        return extracted_text.strip(), word_conf_list, low_conf_words

    except Exception as e:
        print(f"[ERROR] PaddleOCR failed for {image_path} (lang='{lang}'): {e}")
        traceback.print_exc()
        return "", [], []

# ------------------ TrOCR Handler ------------------
def run_trocr(image_path):
    """
    Runs TrOCR on a given image. It first segments the image into lines
    and then processes each line individually with TrOCR.
    This TrOCR model is primarily for English handwritten text.
    For multi-lingual handwritten OCR, a different model or fine-tuning is generally required.
    """
    try:
        print(f"[INFO] Running TrOCR on segmented lines from: {image_path}")
        
        # Segment the image into text lines using OpenCV from utils
        # segment_text_lines_opencv returns a list of (PIL_Image_of_line, y_coordinate)
        line_images_with_coords = segment_text_lines_opencv(image_path) 
        
        if not line_images_with_coords:
            print(f"[WARN] No text lines found for TrOCR processing in {image_path}.")
            return "", [], []

        full_extracted_text = []
        # TrOCR does not provide word-level confidence natively from this model.
        # So, we'll keep the word_conf_list and low_conf_words empty/placeholder for TrOCR.
        word_conf_list = [] 
        low_conf_words = []

        # Process each segmented line
        for line_img, y_coord in line_images_with_coords:
            # Ensure the PIL Image is in RGB format for TrOCR
            if line_img.mode != 'RGB':
                line_img = line_img.convert("RGB")
            
            # Prepare pixel values for the model
            pixel_values = processor(images=line_img, return_tensors="pt").pixel_values.to(device)

            with torch.no_grad():
                generated_ids = model.generate(
                    pixel_values, 
                    max_length=512, 
                    num_beams=5, 
                    early_stopping=True
                )
            
            line_text = processor.batch_decode(generated_ids, skip_special_tokens=True)[0]
            full_extracted_text.append(line_text.strip()) # Add stripped line text

            line_words = line_text.strip().split()
            word_conf_list.extend([(w, 1.0) for w in line_words if w]) # Add words from this line

        final_text = "\n".join(full_extracted_text).strip() # Join lines with newline
        
        # Debug print to see the combined output
        print(f"\n[DEBUG] TrOCR combined output for {os.path.basename(image_path)}:\n---START_TROCR_OUTPUT---\n{final_text}\n---END_TROCR_OUTPUT---\n")

        return final_text, word_conf_list, low_conf_words

    except Exception as e:
        print(f"[ERROR] TrOCR failed: {e}")
        traceback.print_exc()
        return "", [], []

# ------------------ Dynamic Routing ------------------
def extract_text_with_best_model(image_path, source_lang='en'):
    if not os.path.exists(image_path):
        print(f"[ERROR] File not found: {image_path}")
        return "", [], []

    try:
        is_handwritten = detect_handwritten_or_printed(image_path)
        engine = "TrOCR" if is_handwritten else "PaddleOCR"
        print(f"[INFO] Routing to {engine} for file: {image_path} (detected handwritten: {is_handwritten})")

        if is_handwritten:
            # If handwritten, use TrOCR, which now processes segmented lines
            return run_trocr(image_path) 
        else:
            # If not handwritten, use PaddleOCR with the specified source language.
            return run_ppocr(image_path, lang=source_lang)

    except Exception as e:
        print(f"[ERROR] OCR routing failed for {image_path}: {e}")
        traceback.print_exc()
        return "", [], []