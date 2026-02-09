import React, { useState } from 'react';
import AppHeader from '../components/AppHeader';
import UploadArea from '../components/UploadArea';
import ProcessingScreen from '../components/ProcessingScreen';
import ExtractedText from '../components/ExtractedText';
import TranslatedText from '../components/TranslatedText';
import DocumentStats from '../components/DocumentStats';
import ConfidenceStats from '../components/ConfidenceStats';
import ConfidenceHistogram from '../components/ConfidenceHistogram';
import Footer from '../components/Footer';
import FeedbackForm from '../components/FeedbackForm';
import ScriptSenseAssistant from '../components/Chatbot';
import RecentDocuments from '../components/RecentDocuments';
import api from '../utils/api';

const Home = () => {
  const [stage, setStage] = useState('upload');
  const [jobId, setJobId] = useState(null);
  const [userEmail] = useState(() => localStorage.getItem('email') || '');
  const [sourceLang, setSourceLang] = useState('');
  const [targetLang, setTargetLang] = useState('');
  const [extractedText, setExtractedText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [lowConfCount, setLowConfCount] = useState(0);
  const [detectedLangCode, setDetectedLangCode] = useState('en');
  const [stats, setStats] = useState({});
  const [confidenceMetrics, setConfidenceMetrics] = useState({});
  const [wordScores, setWordScores] = useState([]);

  // NEW: Download link states
  const [extractedDownloads, setExtractedDownloads] = useState({});
  const [translatedDownloads, setTranslatedDownloads] = useState({});

  const handleFileUpload = (file) => {
    console.log('File uploaded in Home:', file);
    setSourceLang('');
  };

  const handleStartProcessing = async ({ file, src_lang_code, tgt_lang_code }) => {
    if (!file || !src_lang_code || !tgt_lang_code) {
      alert('Please upload a file and select both source and target languages.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('source_lang', src_lang_code);
    formData.append('target_lang', tgt_lang_code);
    formData.append('email', userEmail);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setJobId(res.data.job_id);
      setStage('processing');
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
    }
  };

  const handleJobSuccess = (result) => {
    console.log("✅ handleJobSuccess triggered");
    console.log("👉 result passed in:", result);

    setStage('result');
    setExtractedText(result.extracted_text || '');
    setTranslatedText(result.translated_text || '');
    setDetectedLangCode(result.detected_language || 'en');
    setStats(result.stats || {});
    setLowConfCount(result.low_conf_count || 0);
    setConfidenceMetrics(result.confidence_metrics || {});
    setWordScores(result.word_confidence_scores || []);
    setTargetLang(result.target_lang || targetLang);

    // NEW: Store download links
    setExtractedDownloads({
      pdf: result.download_extracted_pdf,
      docx: result.download_extracted_docx
    });
    setTranslatedDownloads({
      pdf: result.download_translated_pdf,
      docx: result.download_translated_docx
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelSuccess = () => {
    setJobId(null);
    setStage('upload');
  };

  const handleEditExtracted = (newText) => {
    setExtractedText(newText);
  };

  const handleEditTranslated = (newText) => {
    setTranslatedText(newText);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader
        user={{ email: userEmail }}
        isAdmin={localStorage.getItem('is_admin') === 'true'}
      />

      <main className="max-w-6xl mx-auto px-4 py-6">
        {stage === 'upload' && (
          <UploadArea
            onFileUpload={handleFileUpload}
            onSourceLangSelect={setSourceLang}
            onTargetLangSelect={setTargetLang}
            selectedSourceLang={sourceLang}
            selectedTargetLang={targetLang}
            onStartProcessing={handleStartProcessing}
          />
        )}

        {stage === 'processing' && jobId && (
          <ProcessingScreen
            jobId={jobId}
            onSuccess={handleJobSuccess}
            onCancelSuccess={handleCancelSuccess}
          />
        )}

        {stage === 'result' && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExtractedText
                text={extractedText}
                langCode={detectedLangCode}
                lowConfCount={lowConfCount}
                onTextUpdate={handleEditExtracted}
                downloadLinks={extractedDownloads}
              />
              <TranslatedText
                text={translatedText}
                langCode={targetLang}
                onTextUpdate={handleEditTranslated}
                downloadLinks={translatedDownloads}
              />
            </div>

            <DocumentStats stats={stats} />
            <ConfidenceStats {...confidenceMetrics} lowConfCount={lowConfCount} />
            <ConfidenceHistogram wordConfidenceScores={wordScores} />
            <RecentDocuments userEmail={userEmail} />

            <div className="flex justify-center mt-8">
              <button
                onClick={() => {
                  setStage('upload');
                  setJobId(null);
                  setExtractedText('');
                  setTranslatedText('');
                  setLowConfCount(0);
                  setStats({});
                  setConfidenceMetrics({});
                  setWordScores([]);
                  setSourceLang('');
                  setTargetLang('');
                  setDetectedLangCode('en');
                  setExtractedDownloads({});
                  setTranslatedDownloads({});
                }}
                className="bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700"
              >
                + Process another Image/Document
              </button>
            </div>

            <FeedbackForm userEmail={userEmail} />
            <Footer />
          </>
        )}
      </main>

      <ScriptSenseAssistant />
    </div>
  );
};

export default Home;