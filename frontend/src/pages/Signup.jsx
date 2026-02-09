import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/signup', { name, email, password });
      if (res.data.message === 'Signup successful') {
        localStorage.setItem('loggedIn', 'true');
        navigate('/home');
      } else {
        setError('User already exists or error occurred');
      }
    } catch (err) {
      setError('Server error. Try again.');
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="w-1/2 bg-gradient-to-br from-purple-600 to-purple-500 text-white p-12 flex flex-col justify-center">
        <div className="max-w-md">
          <div className="flex items-center mb-8">
            <i className="fas fa-file-alt text-3xl mr-3"></i>
            <h1 className="text-3xl font-bold">ScriptSense</h1>
          </div>
          <h2 className="text-4xl font-bold mb-4">Digitize Regional Documents with AI</h2>
          <p className="text-lg mb-8 opacity-90">
            Our advanced OCR technology converts handwritten regional language documents into editable digital text with unmatched accuracy.
          </p>
          <div className="space-y-4">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-4">
                <i className="fas fa-language"></i>
              </div>
              <div>
                <h4 className="font-semibold">15+ Regional Languages</h4>
                <p className="text-sm opacity-80">Support for Hindi, Tamil, Telugu, Kannada and more</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-4">
                <i className="fas fa-robot"></i>
              </div>
              <div>
                <h4 className="font-semibold">AI-Powered Correction</h4>
                <p className="text-sm opacity-80">Smart suggestions for unclear handwriting</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mr-4">
                <i className="fas fa-lock"></i>
              </div>
              <div>
                <h4 className="font-semibold">Secure Processing</h4>
                <p className="text-xs opacity-80">Your documents are processed securely and never stored</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-1/2 bg-white flex items-center justify-center">
        <div className="w-full max-w-md p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
          <p className="text-gray-600 mb-8">Get started with ScriptSense</p>

          <form onSubmit={handleSignup}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Sign Up
            </button>
          </form>

          <div className="auth-toggle mt-6">
            <p className="text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;