import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  // Configure axios defaults
  axios.defaults.baseURL = 'http://localhost:5000/api';

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('token', token);
      
      // Fetch user profile if we have token but no user data
      if (!user) {
        axios.get('/auth/me')
          .then(res => {
            setUser(res.data.data.user);
          })
          .catch(err => {
            console.error('Failed to fetch user:', err);
            logout();
          })
          .finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('token');
      setUser(null);
      setLoading(false);
    }
  }, [token, user]);

  const login = async (email, password) => {
    const res = await axios.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = res.data.data;
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const register = async (email, password, role_name) => {
    const res = await axios.post('/auth/register', { email, password, role_name });
    const { token: newToken, user: userData } = res.data.data;
    setToken(newToken);
    setUser(userData);
    return res.data;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
