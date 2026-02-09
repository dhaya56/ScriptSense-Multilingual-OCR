import React, { useState, useEffect } from 'react';
import { Volume2, Loader } from 'lucide-react';

const langVoiceMap = {
  en: 'en-US',
  ta: 'ta-IN',
  hi: 'hi-IN',
  ml: 'ml-IN',
  te: 'te-IN',
  kn: 'kn-IN',
};

const TextToSpeechButton = ({ text = '', lang = 'en', label = 'Speak', variant = 'default' }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);

  useEffect(() => {
    // Load voices when available
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      if (availableVoices.length > 0) {
        setVoices(availableVoices);
      }
    };

    loadVoices();
    // Chrome fires 'voiceschanged' when voices become available
    window.speechSynthesis.onvoiceschanged = loadVoices;
  }, []);

  const handleSpeak = () => {
    if (!text.trim()) return;

    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = langVoiceMap[lang] || 'en-US';

    const matchedVoice = voices.find(v => v.lang === utterance.lang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      alert('⚠️ Speech synthesis failed.');
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  return (
    <button
      onClick={handleSpeak}
      disabled={isSpeaking || !text.trim()}
      className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-md border transition
        ${variant === 'ghost'
          ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
    >
      {isSpeaking ? <Loader className="w-4 h-4 animate-spin" /> : <Volume2 className="w-4 h-4" />}
      {label}
    </button>
  );
};

export default TextToSpeechButton;