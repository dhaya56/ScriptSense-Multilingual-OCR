import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await API.post('/auth/login', { email, password });

      if (res.data.message === 'Login successful') {
        const { token, user } = res.data;

        // ✅ Store token, login state, and admin status
        localStorage.setItem('token', token);
        localStorage.setItem('loggedIn', 'true');
        localStorage.setItem('email', user.email);
        localStorage.setItem('isAdmin', user.is_admin);

        navigate('/home');
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      console.error(err);
      setError('Server error or user not found');
    }
  };

  return (
    <div className="auth-container flex min-h-screen">
      {/* Left Info Panel */}
      <div className="auth-left w-1/2 bg-gray-100 p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto">
          <div className="flex items-center mb-8">
            <i className="fas fa-file-alt text-3xl mr-3 text-purple-700"></i>
            <h1 className="text-3xl font-bold text-purple-700">ScriptSense</h1>
          </div>
          <h2 className="text-4xl font-bold mb-4 text-gray-800">
            Digitize Regional Documents with AI
          </h2>
          <p className="text-lg mb-8 text-gray-700">
            Our advanced OCR technology converts handwritten regional language documents into editable digital text with unmatched accuracy.
          </p>
          <div className="space-y-4 text-gray-700">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                <i className="fas fa-language"></i>
              </div>
              <div>
                <h4 className="font-semibold">15+ Regional Languages</h4>
                <p className="text-sm opacity-80">Hindi, Tamil, Telugu, Kannada, and more</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                <i className="fas fa-robot"></i>
              </div>
              <div>
                <h4 className="font-semibold">AI-Powered Correction</h4>
                <p className="text-sm opacity-80">Smart suggestions for unclear handwriting</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-4">
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

      {/* Right Login Form */}
      <div className="auth-right w-1/2 flex items-center justify-center p-12">
        <div className="auth-form w-full max-w-md">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
          <p className="text-gray-600 mb-8">Sign in to access your documents</p>

          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>

            {error && <p className="text-red-500 mb-4 text-sm">{error}</p>}

            <button
              type="submit"
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg transition duration-200"
            >
              Sign In
            </button>
          </form>

          <div className="auth-toggle mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-purple-600 hover:text-purple-800 font-medium">
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
