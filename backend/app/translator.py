import torch
import traceback
from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from IndicTransToolkit import IndicProcessor
# Import normalize_lang from utils to ensure consistency
from .utils import REVERSE_LANGUAGE_MAP, normalize_lang 

DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
print(f"[INFO] Translator using device: {DEVICE}")

# Model identifiers for IndicTrans2
EN_TO_INDIC_MODEL_NAME = "ai4bharat/indictrans2-en-indic-1B"
INDIC_TO_EN_MODEL_NAME = "ai4bharat/indictrans2-indic-en-1B"
INDIC_TO_INDIC_MODEL_NAME = "ai4bharat/indictrans2-indic-indic-1B"

# Dictionaries to cache loaded models and tokenizers for lazy loading
_models = {
    "en-indic": {"tokenizer": None, "model": None},
    "indic-en": {"tokenizer": None, "model": None},
    "indic-indic": {"tokenizer": None, "model": None},
}

# Language tags used by IndicTrans2 (ISO 639-1 to IndicTrans specific tags)
LANG_TAGS = {
    'en': 'eng_Latn',
    'ta': 'tam_Taml',
    'hi': 'hin_Deva',
    'ml': 'mal_Mlym',
    'te': 'tel_Telu',
    'kn': 'kan_Knda',
    # Add other languages if your IndicTrans2 model supports them and your application needs them
}

# Initialize IndicProcessor once
try:
    ip = IndicProcessor(inference=True)
except Exception as e:
    print(f"[ERROR] Failed to initialize IndicProcessor: {e}")
    traceback.print_exc()
    ip = None # Set to None to handle cases where it fails

# --- Lazy Loading Functions for Models ---
def _load_model_and_tokenizer(model_type):
    """
    Loads and caches the specified IndicTrans2 model and its tokenizer.
    model_type can be "en-indic", "indic-en", or "indic-indic".
    """
    if _models[model_type]["model"] is None:
        try:
            print(f"[INFO] Loading {model_type} model...")
            if model_type == "en-indic":
                model_name = EN_TO_INDIC_MODEL_NAME
            elif model_type == "indic-en":
                model_name = INDIC_TO_EN_MODEL_NAME
            elif model_type == "indic-indic":
                model_name = INDIC_TO_INDIC_MODEL_NAME
            else:
                raise ValueError(f"Unknown model type: {model_type}")

            tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
            model = AutoModelForSeq2SeqLM.from_pretrained(model_name, trust_remote_code=True).to(DEVICE)
            
            _models[model_type]["tokenizer"] = tokenizer
            _models[model_type]["model"] = model
            print(f"[INFO] {model_type} model loaded successfully.")
        except Exception as e:
            print(f"[CRITICAL ERROR] Failed to load {model_type} model from {model_name}: {e}")
            print("Please ensure you have an active internet connection and the model identifiers are correct.")
            traceback.print_exc()
            # Set to None to indicate failure, so subsequent calls won't attempt to use a failed model
            _models[model_type]["tokenizer"] = None
            _models[model_type]["model"] = None
    return _models[model_type]["model"], _models[model_type]["tokenizer"]


# ------------------ Translate Text ------------------
def translate_text(text, src_lang_code, tgt_lang_code):
    try:
        # Normalize language codes using the utility function from utils.py
        src_lang_code = normalize_lang(src_lang_code)
        tgt_lang_code = normalize_lang(tgt_lang_code)

        if src_lang_code is None or tgt_lang_code is None:
            raise ValueError(f"One or both language codes are unsupported after normalization: '{src_lang_code}' -> '{tgt_lang_code}'")

        if src_lang_code == tgt_lang_code:
            print(f"[INFO] Skipping translation: source and target languages are the same ({src_lang_code})")
            return text

        src_tag = LANG_TAGS.get(src_lang_code)
        tgt_tag = LANG_TAGS.get(tgt_lang_code)

        if not src_tag or not tgt_tag:
            raise ValueError(f"Unsupported language tags for IndicTrans2: '{src_lang_code}' (tag: {src_tag}) → '{tgt_lang_code}' (tag: {tgt_tag})")

        model_to_use = None
        tokenizer_to_use = None

        # Determine which model to load and use based on source and target languages
        if src_lang_code == 'en':
            model_to_use, tokenizer_to_use = _load_model_and_tokenizer("en-indic")
        elif tgt_lang_code == 'en':
            model_to_use, tokenizer_to_use = _load_model_and_tokenizer("indic-en")
        else: # Both are Indic languages
            model_to_use, tokenizer_to_use = _load_model_and_tokenizer("indic-indic")
        
        if model_to_use is None or tokenizer_to_use is None:
            raise RuntimeError(f"Translation model for '{src_lang_code}' to '{tgt_lang_code}' could not be loaded.")

        if ip is None:
            raise RuntimeError("IndicProcessor failed to initialize. Cannot perform translation.")

        print(f"[INFO] Translating from {src_lang_code} ({src_tag}) to {tgt_lang_code} ({tgt_tag})...")

        # Preprocess using IndicProcessor
        # Ensure batch is a list, even for a single text
        batch = ip.preprocess_batch([text], src_lang=src_tag, tgt_lang=tgt_tag)

        # Tokenize input
        inputs = tokenizer_to_use(batch, return_tensors="pt", padding=True, truncation=True, max_length=2048).to(DEVICE)

        # Generate translation
        with torch.no_grad():
            generated_tokens = model_to_use.generate(
                **inputs,
                use_cache=True,
                max_length=2048, # Adjust max_length based on expected output length
                num_beams=5,    # Number of beams for beam search, higher means better quality but slower
                num_return_sequences=1,
            )

        # Decode and post-process
        outputs = tokenizer_to_use.batch_decode(generated_tokens, skip_special_tokens=True)
        final = ip.postprocess_batch(outputs, lang=tgt_tag)

        return final[0].strip()

    except Exception as e:
        print(f"[ERROR] Translation failed: {src_lang_code} → {tgt_lang_code}: {e}")
        traceback.print_exc() # Print full traceback for debugging
        return text # Return original text on failure