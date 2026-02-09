import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Download, Copy, Share2 } from 'lucide-react';
import TextToSpeechButton from './TextToSpeechButton';
import { reprocessText, saveEditedText } from '../utils/api';
import { jsPDF } from 'jspdf'; // Import jsPDF for client-side PDF generation
import { notoTamilBase64 } from '../assets/fonts/notoTamilBase64';
import { notoHindiBase64 } from '../assets/fonts/notoHindiBase64';    
import { notoMalayalamBase64 } from '../assets/fonts/notoMalayalamBase64'; 
import { notoTeluguBase64 } from '../assets/fonts/notoTeluguBase64';  
import { notoKannadaBase64 } from '../assets/fonts/notoKannadaBase64';

const TranslatedText = ({
  text = '',
  langCode = 'en',
  email = '',
  downloadLinks = { pdf: '', docx: '' }, // These are still useful if you want to offer original backend files
}) => {
  const [editing, setEditing] = useState(false);
  const [editableText, setEditableText] = useState(text); // Text in the editable textarea
  const [displayedText, setDisplayedText] = useState(text); // Text currently displayed (original or saved edited)
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showDownloadOptions, setShowDownloadOptions] = useState(false);

  // Sync displayedText and editableText when the 'text' prop changes (e.g., new translation result)
  useEffect(() => {
    setDisplayedText(text);
    setEditableText(text);
  }, [text]);

  const handleSave = async () => {
    setEditing(false);
    setLoading(true);
    try {
      const result = await reprocessText({
        text: editableText,
        target_lang: langCode,
        source_lang: 'auto', // Assuming auto-detect source for re-translation/correction
        area: 'translated',
      });

      const newText = result.translated_text || editableText; // Use re-translated text or current edited text
      setDisplayedText(newText); // Update displayed text with reprocessed or current edited text
      setEditableText(newText); // Keep editable text in sync

      await saveEditedText({ text: newText, area: 'translated', email }); // Save the edited text to the backend
    } catch (err) {
      console.error('Error saving translated text:', err);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setEditableText(displayedText); // Revert editable text to last saved/displayed version
    setEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(displayedText); // Copies the content of 'displayedText'
    setCopied(true);
    setTimeout(() => setCopied(false), 1500); // Resets the "Copied!" message after 1.5 seconds
  };

  const getSpeechLangCode = (code = 'en') => {
    const map = {
      en: 'en-US',
      ta: 'ta-IN',
      hi: 'hi-IN',
      te: 'te-IN',
      ml: 'ml-IN',
      kn: 'kn-IN',
    };
    return map[code.slice(0, 2)] || 'en-US'; // Always fallback to valid Web Speech API code
  };

  // --- Frontend Download Functions (NEW) ---
  const downloadPdfFromFrontend = () => {
    const doc = new jsPDF();

    doc.addFileToVFS('NotoSansTamil-Regular.ttf', notoTamilBase64);
    doc.addFont('NotoSansTamil-Regular.ttf', 'NotoSansTamil', 'normal');

    doc.addFileToVFS('NotoSansHindi-Regular.ttf', notoHindiBase64);
    doc.addFont('NotoSansHindi-Regular.ttf', 'NotoSansHindi', 'normal');

    doc.addFileToVFS('NotoSansMalayalam-Regular.ttf', notoMalayalamBase64);
    doc.addFont('NotoSansMalayalam-Regular.ttf', 'NotoSansMalayalam', 'normal');

    doc.addFileToVFS('NotoSansTelugu-Regular.ttf', notoTeluguBase64);
    doc.addFont('NotoSansTelugu-Regular.ttf', 'NotoSansTelugu', 'normal');

    doc.addFileToVFS('NotoSansKannada-Regular.ttf', notoKannadaBase64);
    doc.addFont('NotoSansKannada-Regular.ttf', 'NotoSansKannada', 'normal');

    // Now, set the font based on the current langCode
    switch (langCode) {
      case 'ta': // Tamil
        doc.setFont('NotoSansTamil');
        break;
      case 'hi': // Hindi
        doc.setFont('NotoSansHindi');
        break;
      case 'ml': // Malayalam
        doc.setFont('NotoSansMalayalam');
        break;
      case 'te': // Telugu
        doc.setFont('NotoSansTelugu');
        break;
      case 'kn': // Kannada
        doc.setFont('NotoSansKannada');
        break;
      case 'en': // English (or default if you have a specific Latin font you want)
      default:
        doc.setFont('Times'); // or 'Arial', 'Times', or a custom Latin font if needed
        break;
    }

    // Optional: Adjust font size for better readability across languages
    doc.setFontSize(12); // You might experiment with this size

    // Text splitting (this works with the currently set font)
    const textLines = doc.splitTextToSize(displayedText, 180);

    doc.text(textLines, 10, 10);

    doc.save(`translated_text_${langCode}.pdf`); // You might want to include lang code in filename
    setShowDownloadOptions(false);
  };

  const downloadDocxFromFrontend = () => {
    const content = displayedText;
    const filename = 'translated_text.doc'; // Using .doc for basic compatibility with Word

    // Create a simple HTML string that Word can often open if saved as .doc
    // NOTE: This is NOT a true .docx file. It's a simple HTML document.
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
          <meta charset="UTF-8">
          <style>
              body { font-family: Calibri, sans-serif; font-size: 11pt; }
              p { margin-bottom: 0.5em; }
          </style>
      </head>
      <body>
          ${content.split('\n').map(line => `<p>${line}</p>`).join('')}
      </body>
      </html>
    `;

    // Create a Blob and trigger download
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Clean up the object URL
    setShowDownloadOptions(false); // Close the dropdown after download
  };
  // --- End Frontend Download Functions ---

  // --- Share Function (UNCHANGED from your original code) ---
  const handleShare = () => {
    const message = `🌐 Here are your translated files:\n\nPDF: ${downloadLinks.pdf}\nDOCX: ${downloadLinks.docx}`;
    const whatsappUrl = `https://web.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  // --- End Share Function ---

  return (
    <div className="border border-gray-200 bg-white rounded-xl p-5 shadow-sm relative mt-6">
      {/* Top Header */}
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-sm font-semibold text-purple-700">🌐 Translated Text</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            <Edit className="w-4 h-4" /> Edit Text
          </button>
        )}
      </div>

      {/* Text Area */}
      <div className="bg-gray-50 border border-gray-200 rounded-md p-4 min-h-[10rem] mb-4">
        {editing ? (
          <>
            <textarea
              className="w-full p-3 text-sm border border-purple-300 rounded-md resize-none h-56"
              value={editableText}
              onChange={(e) => setEditableText(e.target.value)}
              lang={langCode}
            />
            <div className="flex gap-2 mt-3">
              <button
                onClick={handleSave}
                className="bg-green-600 text-white px-4 py-1.5 rounded-md hover:bg-green-700 flex items-center gap-1"
              >
                <Save className="w-4 h-4" /> Save
              </button>
              <button
                onClick={handleCancel}
                className="bg-gray-200 text-gray-700 px-4 py-1.5 rounded-md flex items-center gap-1"
              >
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          </>
        ) : (
          <p className="whitespace-pre-wrap text-sm text-gray-800">
            {displayedText}
          </p>
        )}
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-center gap-3 justify-start">
        <TextToSpeechButton text={displayedText} lang={getSpeechLangCode(langCode)} />

        {/* DOWNLOAD BUTTON (Updated with frontend options) */}
        <div className="relative">
          <button
            onClick={() => setShowDownloadOptions(!showDownloadOptions)}
            className="bg-purple-600 text-white px-4 py-1.5 rounded-md hover:bg-purple-700 flex items-center gap-1"
          >
            <Download className="w-4 h-4" /> Download
          </button>
          {showDownloadOptions && (
            <div className="absolute mt-1 flex flex-col bg-white border shadow rounded-md z-10">
              <span className="px-3 py-1 text-xs text-gray-500 font-semibold border-b">Download Current Text</span>
              <button
                onClick={downloadPdfFromFrontend}
                className="text-xs px-3 py-2 hover:bg-gray-100 text-left w-full"
              >
                as PDF
              </button>
              <button
                onClick={downloadDocxFromFrontend}
                className="text-xs px-3 py-2 hover:bg-gray-100 text-left w-full"
              >
                as DOCX (basic)
              </button>

              {(downloadLinks.pdf || downloadLinks.docx) && (
                <>
                  <span className="px-3 py-1 text-xs text-gray-500 font-semibold border-y mt-1">Download Original (from server)</span>
                  {downloadLinks.pdf && (
                    <a
                      href={`/download/${downloadLinks.pdf.split('/').pop()}`}
                      className="text-xs px-3 py-2 hover:bg-gray-100"
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      as PDF
                    </a>
                  )}
                  {downloadLinks.docx && (
                    <a
                      href={`/download/${downloadLinks.docx.split('/').pop()}`}
                      className="text-xs px-3 py-2 hover:bg-gray-100"
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      as DOCX
                    </a>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* COPY BUTTON */}
        <button
          onClick={handleCopy}
          className="bg-purple-600 text-white px-4 py-1.5 rounded-md hover:bg-purple-700 flex items-center gap-1"
        >
          <Copy className="w-4 h-4" />
          {copied ? 'Copied!' : 'Copy Text'}
        </button>

        {/* SHARE BUTTON (Original logic maintained as requested) */}
        <button
          onClick={handleShare}
          className="bg-purple-600 text-white px-4 py-1.5 rounded-md hover:bg-purple-700 flex items-center gap-1"
        >
          <Share2 className="w-4 h-4" />
          <img src="/whatsapp-icon.png" alt="whatsapp" className="w-4 h-4" />
          Share
        </button>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center mt-4 text-xs text-gray-600">
        <p className="text-green-600">✓ High confidence (92%)</p>
        <p className="flex items-center gap-1">
          <span className="text-gray-500">🧠 Detected:</span>{' '}
          {langCode === 'en' ? 'English' : 'Tamil'} {/* Using langCode from props */}
        </p>
      </div>

      {loading && (
        <p className="text-xs text-purple-500 mt-2">Processing update…</p>
      )}
    </div>
  );
};

export default TranslatedText;