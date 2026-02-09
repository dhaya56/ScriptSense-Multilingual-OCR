import React, { useState, useEffect } from 'react';
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { submitFeedback } from '../utils/api';

const FeedbackForm = () => {
  const [feedbackMode, setFeedbackMode] = useState(null); // null, 'yes', 'no'
  const [feedbackText, setFeedbackText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [message, setMessage] = useState('');
  const [userEmail, setUserEmail] = useState('');

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser?.email) {
      setUserEmail(storedUser.email);
    }
  }, []);

  const handleSubmit = async () => {
    if (!feedbackText.trim()) return;
    try {
      const response = await submitFeedback({ email: userEmail, feedback: feedbackText.trim() });
      if (response.error) {
        setMessage('❌ Failed to submit feedback.');
      } else {
        setSubmitted(true);
        setMessage('✅ Thank you for your feedback!');
      }
    } catch (err) {
      console.error(err);
      setMessage('❌ Failed to submit feedback.');
    }
  };

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mt-8">
      <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
        🗣️ Was this recognition accurate?
      </h3>

      {!feedbackMode && (
        <div className="flex gap-4">
          <button
            className="bg-green-100 text-green-700 px-4 py-1.5 rounded-md flex items-center gap-1 hover:bg-green-200"
            onClick={() => {
              setFeedbackMode('yes');
              setSubmitted(true);
              setMessage('✅ Thank you for using ScriptSense!');
            }}
          >
            <ThumbsUp className="w-4 h-4" /> Yes
          </button>
          <button
            className="bg-red-100 text-red-700 px-4 py-1.5 rounded-md flex items-center gap-1 hover:bg-red-200"
            onClick={() => setFeedbackMode('no')}
          >
            <ThumbsDown className="w-4 h-4" /> No
          </button>
        </div>
      )}

      {feedbackMode === 'no' && !submitted && (
        <div className="mt-4">
          <label className="text-sm text-gray-600 mb-2 block">
            Help us improve by providing feedback on the recognition quality:
          </label>
          <textarea
            value={feedbackText}
            onChange={(e) => setFeedbackText(e.target.value)}
            rows={4}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
            placeholder="Describe any issues or suggestions..."
          />
          <button
            onClick={handleSubmit}
            disabled={!feedbackText.trim()}
            className="mt-3 bg-blue-600 text-white px-4 py-1.5 rounded-md flex items-center gap-1 hover:bg-blue-700 disabled:opacity-50"
          >
            <Send className="w-4 h-4" /> Submit Feedback
          </button>
        </div>
      )}

      {message && <p className="text-sm text-green-600 mt-3">{message}</p>}
    </div>
  );
};

export default FeedbackForm;