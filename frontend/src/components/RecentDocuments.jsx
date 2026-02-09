import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Eye, FileText, Globe, Layers } from 'lucide-react';

const RecentDocuments = ({ userEmail }) => {
  const [recentDocs, setRecentDocs] = useState([]);
  const [previewDoc, setPreviewDoc] = useState(null);

  useEffect(() => {
    const fetchDocs = async () => {
      if (userEmail) {
        const res = await api.post('/recent-documents', { email: userEmail });
        setRecentDocs(res.data);
      }
    };
    fetchDocs();
  }, [userEmail]);

  const handlePreview = (doc) => {
    setPreviewDoc(doc);
  };

  const renderPreview = () => {
    if (!previewDoc) return null;
    const ext = previewDoc.filename.split('.').pop().toLowerCase();
    const fileUrl = `/static/uploads/${previewDoc.filename}`;

    if (ext === 'pdf') {
      return (
        <iframe
          src={fileUrl}
          title="PDF Preview"
          className="w-full h-[500px] border rounded-md shadow-sm"
        />
      );
    } else if (ext === 'docx') {
      return (
        <iframe
          src={`https://docs.google.com/gview?url=${window.location.origin + fileUrl}&embedded=true`}
          title="DOCX Preview"
          className="w-full h-[500px] border rounded-md shadow-sm"
        />
      );
    } else if (['jpg', 'jpeg', 'png'].includes(ext)) {
      return (
        <img
          src={fileUrl}
          alt="Preview"
          className="max-w-full max-h-[500px] mx-auto rounded shadow"
        />
      );
    }
    return <p className="text-sm text-gray-500">Preview not available for this file type.</p>;
  };

  return (
    <div className="bg-white shadow-sm rounded-xl p-6 mt-8">
      <h2 className="text-lg font-semibold text-purple-700 mb-4 flex items-center gap-2">
        <Layers className="w-5 h-5 text-purple-500" /> Recent Documents
      </h2>

      {recentDocs.length === 0 ? (
        <p className="text-sm text-gray-500">No documents uploaded recently.</p>
      ) : (
        <ul className="space-y-3">
          {recentDocs.map((doc, idx) => (
            <li
              key={idx}
              className="flex justify-between items-center bg-gray-50 border border-gray-200 rounded-md px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handlePreview(doc)}
            >
              <div>
                <p className="text-sm font-medium text-gray-700">{doc.filename}</p>
                <div className="flex gap-3 text-xs text-gray-500 mt-0.5">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" /> {doc.file_type}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" /> {doc.language || 'Auto-detected'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" /> Click to preview
                  </span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      {previewDoc && (
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">
            Preview: <span className="text-purple-600">{previewDoc.filename}</span>
          </h3>
          <div className="border rounded-md p-3 bg-gray-50 overflow-y-auto max-h-[550px]">
            {renderPreview()}
          </div>
        </div>
      )}
    </div>
  );
};

export default RecentDocuments;