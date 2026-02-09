import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import API from '../utils/api';

const ProtectedRoute = ({ children }) => {
  const [isAuthorized, setIsAuthorized] = useState(null); // null = loading

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthorized(false);
      return;
    }

    // Validate token with backend
    API.post('/auth/verify-token', { token })
      .then((res) => {
        if (res.data.valid) {
          setIsAuthorized(true);
          // Optional: set user info in state or context if needed
        } else {
          localStorage.clear();
          setIsAuthorized(false);
        }
      })
      .catch(() => {
        localStorage.clear();
        setIsAuthorized(false);
      });
  }, []);

  if (isAuthorized === null) {
    return <div className="text-center mt-10 text-gray-600">Verifying session...</div>; // Optional: show spinner
  }

  return isAuthorized ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;