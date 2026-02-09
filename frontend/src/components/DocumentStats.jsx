import React, { useState, useEffect } from 'react';
import { FileText } from 'lucide-react';

const DocumentStats = ({ stats = {} }) => {
  const [showWhitespace, setShowWhitespace] = useState(true);
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    if (showWhitespace) {
      setCharCount(stats.char_count_with_spaces || stats.char_count || 0);
    } else {
      setCharCount(stats.char_count_no_spaces || stats.char_count || 0);
    }
  }, [showWhitespace, stats]);

  return (
    <div className="bg-white shadow-sm border border-gray-200 rounded-lg p-6 mt-10">
      <h2 className="text-lg font-semibold text-purple-700 flex items-center mb-4">
        <FileText className="w-5 h-5 mr-2" />
        Document Statistics
      </h2>

      <div className="text-sm text-right mb-2">
        <label className="mr-2 font-medium">With Whitespace</label>
        <input
          type="checkbox"
          checked={showWhitespace}
          onChange={() => setShowWhitespace(!showWhitespace)}
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
        <div className="bg-gray-100 py-4 rounded-md shadow-inner">
          <p className="text-xl font-bold text-purple-600">{stats.word_count || 0}</p>
          <p className="text-gray-600">Words</p>
        </div>
        <div className="bg-gray-100 py-4 rounded-md shadow-inner">
          <p className="text-xl font-bold text-purple-600">{charCount}</p>
          <p className="text-gray-600">Characters</p>
        </div>
        <div className="bg-gray-100 py-4 rounded-md shadow-inner">
          <p className="text-xl font-bold text-purple-600">{stats.line_count || 0}</p>
          <p className="text-gray-600">Lines</p>
        </div>
        <div className="bg-gray-100 py-4 rounded-md shadow-inner">
          <p className="text-xl font-bold text-purple-600">{stats.page_count || 0}</p>
          <p className="text-gray-600">Pages</p>
        </div>
      </div>
    </div>
  );
};

export default DocumentStats;