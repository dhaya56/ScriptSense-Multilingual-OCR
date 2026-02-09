import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach token if present
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const reprocessText = async ({ text, target_lang, source_lang, area = 'extracted' }) => {
  try {
    const res = await API.post('/reprocess-text', {
      text,
      target_lang,
      source_lang,
      area, // ✅ Now included
    });
    return res.data;
  } catch (err) {
    console.error('Reprocessing text failed:', err);
    return null;
  }
};

/** ---------------------
 * Save Edited Text
 * --------------------- */
export const saveEditedText = async ({ text, format = 'pdf', lang_code = 'en' }) => {
  try {
    const res = await API.post('/save-edited-text', { text, format, lang_code });
    return res.data;
  } catch (err) {
    console.error('Save edited text failed:', err);
    return { message: 'Failed', download_url: '' };
  }
};

/** ---------------------
 * Submit Feedback
 * --------------------- */
export const submitFeedback = async ({ email, feedback }) => {
  try {
    const res = await API.post('/feedback', {
      email,
      feedback,
    });
    return res.data;
  } catch (err) {
    console.error('Submit feedback failed:', err);
    return { error: 'Failed to submit feedback' };
  }
};

export default API;