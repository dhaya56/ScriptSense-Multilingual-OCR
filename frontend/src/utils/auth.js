// Save login status and user info
export const login = (token, email, isAdmin = false) => {
  localStorage.setItem('loggedIn', 'true');
  localStorage.setItem('token', token);
  localStorage.setItem('userEmail', email);
  localStorage.setItem('isAdmin', isAdmin.toString());
};

// Clear user session
export const logout = () => {
  localStorage.removeItem('loggedIn');
  localStorage.removeItem('token');
  localStorage.removeItem('userEmail');
  localStorage.removeItem('isAdmin');
};

// Check if user is logged in
export const isLoggedIn = () => {
  return localStorage.getItem('loggedIn') === 'true' && !!localStorage.getItem('token');
};

// Get stored token
export const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Get user email
export const getUserEmail = () => {
  return localStorage.getItem('userEmail');
};

// Check if current user is admin
export const isAdmin = () => {
  return localStorage.getItem('isAdmin') === 'true';
};
