import React from 'react';
import { BarChart2, AlertTriangle } from 'lucide-react';

const ConfidenceStats = ({
  document_quality = 0,
  handwriting_clarity = 0,
  text_recognition = 0,
  lowConfCount = 0
}) => {
  const ProgressBar = ({ label, colorClass, value }) => (
    <div>
      <p className="text-sm text-gray-700 font-medium mb-1">{label}</p>
      <div className="relative w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className={`absolute top-0 left-0 h-2 rounded-full transition-all duration-500 ${colorClass}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <p className="text-xs text-right text-gray-500 mt-1">{value}%</p>
    </div>
  );

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mt-10 space-y-6">
      <h2 className="text-lg font-semibold text-purple-700 flex items-center mb-4">
        <BarChart2 className="w-5 h-5 mr-2" />
        Confidence Analysis
      </h2>

      <div className="space-y-4">
        <ProgressBar label="Document Quality" colorClass="bg-blue-600" value={document_quality} />
        <ProgressBar label="Handwriting Clarity" colorClass="bg-purple-500" value={handwriting_clarity} />
        <ProgressBar label="Text Recognition" colorClass="bg-indigo-600" value={text_recognition} />
      </div>

      {lowConfCount > 0 && (
        <div className="mt-5 bg-yellow-100 text-yellow-900 text-sm px-4 py-3 rounded-md border border-yellow-300 flex items-start gap-2">
          <AlertTriangle className="w-5 h-5 mt-0.5 text-yellow-700" />
          <span>
            <strong>Review Suggested:</strong> {lowConfCount} word{lowConfCount > 1 ? 's' : ''} were detected with low confidence. These are highlighted in{' '}
            <span className="bg-yellow-300 px-1 rounded-sm">yellow</span> in the extracted text.
          </span>
        </div>
      )}
    </div>
  );
};

export default ConfidenceStats;