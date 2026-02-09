import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-[#0e0f16] text-white mt-12 px-6 py-12">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Logo & Description */}
        <div>
          <h1 className="text-2xl font-bold mb-3 text-white">📄 ScriptSense</h1>
          <p className="text-sm text-gray-400">
            Advanced AI-powered OCR platform for digitizing and preserving handwritten and printed documents in regional languages.
          </p>
          <div className="flex space-x-4 mt-4">
            <a href="#" className="hover:text-purple-400 text-sm" aria-label="Twitter">🐦 Twitter</a>
            <a href="#" className="hover:text-purple-400 text-sm" aria-label="LinkedIn">💼 LinkedIn</a>
            <a href="#" className="hover:text-purple-400 text-sm" aria-label="GitHub">🌐 GitHub</a>
          </div>
        </div>

        {/* Product Links */}
        <div>
          <h2 className="text-md font-semibold text-white mb-3">Product</h2>
          <ul className="text-sm text-gray-400 space-y-2">
            <li><a href="#" className="hover:text-purple-400">Features</a></li>
            <li><a href="#" className="hover:text-purple-400">Pricing</a></li>
            <li><a href="#" className="hover:text-purple-400">API</a></li>
            <li><a href="#" className="hover:text-purple-400">Integrations</a></li>
          </ul>
        </div>

        {/* Support Links */}
        <div>
          <h2 className="text-md font-semibold text-white mb-3">Support</h2>
          <ul className="text-sm text-gray-400 space-y-2">
            <li><a href="#" className="hover:text-purple-400">Guides</a></li>
            <li><a href="#" className="hover:text-purple-400">Contact Us</a></li>
            <li><a href="#" className="hover:text-purple-400">Status</a></li>
          </ul>
        </div>

        {/* Company Info */}
        <div>
          <h2 className="text-md font-semibold text-white mb-3">Company</h2>
          <ul className="text-sm text-gray-400 space-y-2">
            <li><a href="#" className="hover:text-purple-400">About</a></li>
            <li><a href="#" className="hover:text-purple-400">Blog</a></li>
            <li><a href="#" className="hover:text-purple-400">Careers</a></li>
            <li><a href="#" className="hover:text-purple-400">Privacy Policy</a></li>
          </ul>
        </div>
      </div>

      {/* Footer Note */}
      <div className="text-center text-gray-500 text-xs mt-12">
        © 2025 ScriptSense. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;