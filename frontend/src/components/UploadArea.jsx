import React, { useState, useEffect } from 'react';
import { Upload, Info } from 'lucide-react';
import api from '../utils/api';

const LANGUAGES = {
  en: 'English',
  ta: 'Tamil',
  hi: 'Hindi',
  ml: 'Malayalam',
  te: 'Telugu',
  kn: 'Kannada',
};

const UploadArea = ({
  onFileUpload,
  onSourceLangSelect,
  onTargetLangSelect,
  onStartProcessing,
  selectedSourceLang,
  selectedTargetLang,
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [hoverInfo, setHoverInfo] = useState(false);
  const [isAutoDetecting, setIsAutoDetecting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewLoading, setPreviewLoading] = useState(false);

  useEffect(() => {
    // Reset source lang if no file selected
    if (!selectedFile) {
      onSourceLangSelect('');
    }
  }, [selectedFile, onSourceLangSelect]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      simulateUpload(file);
    }
  };

  const simulateUpload = (file) => {
    setUploading(true);
    let progress = 0;
    const interval = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(interval);
        setUploading(false);
        setSelectedFile(file);
        setPreviewLoading(true);
        setTimeout(() => setPreviewLoading(false), 1000);
        onFileUpload(file);
      }
    }, 100);
  };

  const handleAutoDetect = async () => {
    if (!selectedFile) return;
    setIsAutoDetecting(true);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const res = await api.post('/detect-language', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const detectedLang = res.data.detected_lang_code || '';
      onSourceLangSelect(detectedLang);
    } catch (err) {
      console.error('Auto language detection failed:', err);
      alert('Auto language detection failed. Please select language manually.');
    } finally {
      setIsAutoDetecting(false);
    }
  };

  const handleStart = () => {
    if (selectedFile && selectedSourceLang && selectedTargetLang) {
      onStartProcessing({
        file: selectedFile,
        src_lang_code: selectedSourceLang,
        tgt_lang_code: selectedTargetLang,
      });
    } else {
      alert('Please select both source and target languages.');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      {!selectedFile && !uploading && (
        <div className="text-center py-24 border-2 border-dashed border-gray-300 bg-gray-50 rounded-lg">
          <label htmlFor="file-upload" className="cursor-pointer">
            <Upload className="w-10 h-10 text-purple-600 mx-auto mb-3" />
            <p className="text-gray-700 text-lg font-medium">Drag & drop your document here</p>
            <p className="text-sm text-gray-500">or</p>
            <div className="inline-block mt-2 px-5 py-2 bg-purple-600 text-white text-sm rounded shadow hover:bg-purple-700">
              Browse Files
            </div>
            <input
              type="file"
              id="file-upload"
              accept=".jpg,.jpeg,.png,.pdf,.doc,.docx"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        </div>
      )}

      {uploading && (
        <div className="text-center py-20">
          <p className="text-sm text-gray-600 mb-4">Uploading document…</p>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-purple-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {selectedFile && !uploading && (
        <div className="flex flex-col lg:flex-row gap-6 mt-6">
          {/* Left: Preview */}
          <div className="flex-1 border rounded-lg p-4 bg-gray-50 h-[400px] overflow-y-auto text-center">
            {previewLoading ? (
              <p className="text-gray-500">Loading document preview…</p>
            ) : selectedFile.type.startsWith('image/') ? (
              <img src={URL.createObjectURL(selectedFile)} alt="Preview" className="max-w-full mx-auto" />
            ) : (
              <iframe
                title="doc-preview"
                src={URL.createObjectURL(selectedFile)}
                className="w-full h-full"
              ></iframe>
            )}
          </div>

          {/* Right: Options */}
          <div className="w-full lg:w-1/3 space-y-4">
            <div
              className="relative inline-block"
              onMouseEnter={() => setHoverInfo(true)}
              onMouseLeave={() => setHoverInfo(false)}
            >
              <Info className="w-5 h-5 text-gray-500 cursor-pointer" />
              {hoverInfo && (
                <div className="absolute z-10 top-6 right-0 w-64 bg-gray-900 text-white text-sm rounded shadow-lg p-3">
                  <div><strong>💡 Good Lighting:</strong> Ensure well-lit document for clarity.</div>
                  <div><strong>📄 Flat Surface:</strong> Avoid distortion for better OCR.</div>
                  <div><strong>✍️ Clear Text:</strong> Avoid cursive or faint writing.</div>
                  <div><strong>🔍 High Resolution:</strong> Use 300+ DPI for accuracy.</div>
                </div>
              )}
            </div>

            <button
              onClick={handleAutoDetect}
              disabled={isAutoDetecting}
              className="text-purple-600 hover:underline font-medium"
            >
              ✍️ {isAutoDetecting ? 'Detecting…' : 'Auto-detect Language'}
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Document Language</label>
              <select
                value={selectedSourceLang || ''}
                onChange={(e) => onSourceLangSelect(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select a language</option>
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Convert to</label>
              <select
                value={selectedTargetLang || ''}
                onChange={(e) => onTargetLangSelect(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">Select target language</option>
                {Object.entries(LANGUAGES).map(([code, name]) => (
                  <option key={code} value={code}>{name}</option>
                ))}
              </select>
            </div>

            <button
              onClick={handleStart}
              disabled={!selectedSourceLang || !selectedTargetLang}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-md font-semibold transition-all"
            >
              Start Processing
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadArea;
