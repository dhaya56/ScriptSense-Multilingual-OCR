import React, { useEffect, useState, useRef } from 'react';
import { Loader, AlertTriangle } from 'lucide-react';
import api from '../utils/api';

const ProcessingScreen = ({ jobId, onSuccess, onCancelSuccess }) => {
  const [status, setStatus] = useState('processing');
  const [isCancelling, setIsCancelling] = useState(false);
  const [metrics, setMetrics] = useState({
    accuracy: 'Loading...',
    pages: 'Estimating...',
    eta: '240s',
  });

  const intervalRef = useRef(null);

  useEffect(() => {
    if (!jobId) return;

    // Start polling job status every 2 seconds
    intervalRef.current = setInterval(async () => {
      try {
        const res = await api.get(`/status/${jobId}`);

        if (res.data.status === 'done') {
          clearInterval(intervalRef.current);
          setStatus('done');
          onSuccess(res.data.result);
        } else if (res.data.status === 'cancelled') {
          clearInterval(intervalRef.current);
          setStatus('cancelled');
          onCancelSuccess();
        } else {
          // Optionally update metrics if backend provides partial info during processing
          if (res.data.metrics) {
            setMetrics({
              accuracy: res.data.metrics.accuracy || metrics.accuracy,
              pages: res.data.metrics.pages || metrics.pages,
              eta: res.data.metrics.eta || metrics.eta,
            });
          }
        }
      } catch (err) {
        console.error('Polling error:', err);
        clearInterval(intervalRef.current);
        setStatus('error');
        // Consider calling onCancelSuccess or show error UI here if needed
      }
    }, 2000);

    // Cleanup on unmount or jobId change
    return () => clearInterval(intervalRef.current);
  }, [jobId, onSuccess, onCancelSuccess]);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await api.post(`/cancel/${jobId}`);
      clearInterval(intervalRef.current);
      setStatus('cancelled');
      onCancelSuccess();
    } catch (err) {
      console.error('Cancel failed:', err);
      setIsCancelling(false);
    }
  };

  // Only render when processing or cancelling, hide on done/cancelled/error states
  if (!jobId || status === 'done' || status === 'cancelled') return null;

  return (
    <div className="bg-white shadow-md rounded-xl px-8 py-10 mt-6 text-center space-y-6">
      {/* Spinner */}
      <div className="flex justify-center text-indigo-600">
        <Loader className="w-12 h-12 animate-spin" />
      </div>

      {/* Title */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800">Processing Your Document</h2>
        <p className="text-sm text-gray-500 mt-1">
          Our AI is analyzing handwriting, detecting layout, and recognizing text accurately…
        </p>
      </div>

      {/* Metrics */}
      <div className="flex justify-center items-center gap-10 text-sm font-medium text-indigo-700">
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold">{metrics.accuracy}</span>
          <span className="text-gray-500 text-xs">Accuracy</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold">{metrics.pages}</span>
          <span className="text-gray-500 text-xs">Pages</span>
        </div>
        <div className="flex flex-col items-center">
          <span className="text-lg font-bold">{metrics.eta}</span>
          <span className="text-gray-500 text-xs">Remaining</span>
        </div>
      </div>

      {/* Insight Box */}
      <div className="bg-yellow-100 text-yellow-800 border border-yellow-300 px-5 py-3 rounded-md text-sm flex items-start gap-2 max-w-md mx-auto">
        <AlertTriangle className="w-5 h-5 mt-0.5 text-yellow-700" />
        <span>
          <strong>Processing Insights</strong>
          <br />
          We’re analyzing handwriting and formatting for optimal accuracy. Please don’t refresh the page.
        </span>
      </div>

      {/* Cancel Button */}
      <button
        onClick={handleCancel}
        disabled={isCancelling}
        className={`text-indigo-600 hover:underline text-sm font-medium ${
          isCancelling ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        {isCancelling ? 'Cancelling…' : '✖ Cancel Processing'}
      </button>

      {status === 'error' && (
        <p className="text-red-500 font-medium text-sm mt-2">
          There was an error while processing. Please try again.
        </p>
      )}
    </div>
  );
};

export default ProcessingScreen;
