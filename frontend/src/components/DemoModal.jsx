import React from 'react';
import { X } from 'lucide-react';

const DemoModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
      {/* Modal box */}
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full relative p-6">
        {/* Close button */}
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <h2 className="text-xl font-semibold text-purple-700 mb-4">📽️ Watch ScriptSense in Action</h2>

        {/* Video iframe (YouTube or replace with local) */}
        <div className="aspect-w-16 aspect-h-9">
          <iframe
            className="w-full h-full rounded-md"
            src="https://youtu.be/WR8PyAhn6tQ?si=S4DJDGzG3WHca3g4"
            title="ScriptSense Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

export default DemoModal;
