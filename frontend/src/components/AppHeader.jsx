import React, { useState, useEffect } from 'react';
import { ChevronDown, LogOut, UserPlus, Shield, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo.svg'; // Update path if different

const AppHeader = ({ user, setShowDemo }) => {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const adminFlag = localStorage.getItem('isAdmin') === 'true';
    setIsAdmin(adminFlag);
  }, []);

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const goToAdminPanel = () => {
    navigate('/admin');
  };

  return (
    <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 shadow-md flex items-center justify-between">
      {/* Left: Logo */}
      <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/home')}>
        <img src={logo} alt="logo" className="w-6 h-6" />
        <h1 className="text-xl font-bold">ScriptSense</h1>
      </div>

      {/* Center: Navigation */}
      <nav className="hidden md:flex space-x-6 font-medium">
        <a href="#" className="hover:text-purple-100">Home</a>
        <a href="#" className="hover:text-purple-100">Features</a>
        <a href="#" className="hover:text-purple-100">Pricing</a>
        <a href="#" className="hover:text-purple-100">Contact</a>
      </nav>

      {/* Right: User Controls */}
      <div className="flex items-center space-x-4 relative">
        {/* Demo Button */}
        <button
          className="bg-white text-purple-700 px-3 py-1 rounded-full flex items-center gap-1 font-medium hover:bg-purple-50 transition"
          onClick={() => setShowDemo(true)}
        >
          <PlayCircle className="w-4 h-4" /> Watch Demo
        </button>

        {/* User Thumbnail */}
        <div
          className="bg-white text-purple-700 rounded-full w-8 h-8 flex items-center justify-center font-semibold cursor-pointer"
          onClick={toggleDropdown}
        >
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>

        {/* Greeting */}
        <p className="hidden sm:block text-sm font-medium">Welcome, {user?.name || 'User'}</p>

        {/* Dropdown */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-12 top-full bg-white text-gray-800 w-52 rounded-md shadow-lg z-10">
            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              onClick={() => navigate('/signup')}
            >
              <UserPlus className="w-4 h-4" /> Add Another Account
            </button>

            {isAdmin && (
              <button
                className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
                onClick={goToAdminPanel}
              >
                <Shield className="w-4 h-4 text-indigo-600" /> Admin Panel
              </button>
            )}

            <button
              className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center gap-2"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default AppHeader;