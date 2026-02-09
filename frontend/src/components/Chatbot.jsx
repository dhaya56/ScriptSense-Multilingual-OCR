import React, { useState, useRef, useEffect } from 'react';
import { X, Minus, Bot, Send, Loader2 } from 'lucide-react';

const ScriptSenseAssistant = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { type: 'bot', text: "Hello! I'm ScriptSense Assistant. How can I help you with your document digitization today?" },
    { type: 'bot', text: "You can ask me about:\n• Supported languages\n• How to improve OCR accuracy\n• Export options\n• Or anything else!" }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage = { type: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const botReply = {
        type: 'bot',
        text: generateBotReply(userMessage.text)
      };
      setMessages(prev => [...prev, botReply]);
      setIsTyping(false);
    }, 800);
  };

  const generateBotReply = (input) => {
    const text = input.toLowerCase();
    if (text.includes('language')) return 'We support Tamil, Telugu, Kannada, Malayalam, Hindi, and English.';
    if (text.includes('ocr') && text.includes('accuracy')) return 'Ensure high resolution, good lighting, and flat surface to improve OCR accuracy.';
    if (text.includes('export')) return 'You can export output as PDF or DOCX using the buttons below each result.';
    return 'Thank you for your question! I’ll pass it along to the team.';
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white shadow-2xl rounded-xl border border-gray-200 z-50 flex flex-col">
      {/* Header */}
      <div className="bg-purple-600 text-white px-4 py-3 rounded-t-xl flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4" />
          <h2 className="text-sm font-semibold">ScriptSense Assistant</h2>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => setIsMinimized(!isMinimized)}>
            <Minus className="w-4 h-4 text-white hover:text-gray-300" />
          </button>
          <button onClick={() => setIsOpen(false)}>
            <X className="w-4 h-4 text-white hover:text-gray-300" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages area */}
          <div className="px-4 py-3 h-64 overflow-y-auto space-y-2 text-sm">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`p-2 rounded-md w-fit max-w-[90%] ${
                  msg.type === 'bot'
                    ? 'bg-gray-100 text-gray-800'
                    : 'bg-indigo-100 text-indigo-800 ml-auto'
                }`}
              >
                {msg.text.split('\n').map((line, idx) => (
                  <div key={idx}>{line}</div>
                ))}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center space-x-2 text-gray-500 text-sm pl-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Typing…</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input box */}
          <div className="p-3 border-t border-gray-100 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Type your question…"
              className="flex-1 border border-purple-300 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
            />
            <button
              onClick={handleSend}
              className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-md"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ScriptSenseAssistant;
