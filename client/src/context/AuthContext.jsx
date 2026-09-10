import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyUser = async () => {
      const activeToken = localStorage.getItem('token');
      if (activeToken) {
        try {
          const res = await api.get('/auth/me');
          const userData = res.data.user || res.data;
          if (res.data.token) {
            localStorage.setItem('token', res.data.token);
            setToken(res.data.token);
          }
          setUser(userData);
        } catch (error) {
          console.error('Session restore failed:', error);
          setToken(null);
          localStorage.removeItem('token');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    verifyUser();
  }, [token]);

  const login = async (email, password) => {
    try {
      const res = await api.post('/auth/login', { email, password });
      const userObj = res.data.user || res.data;
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(userObj);
      return { success: true, user: userObj };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Invalid email or password' 
      };
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await api.post('/auth/register', { name, email, password });
      const userObj = res.data.user || res.data;
      localStorage.setItem('token', res.data.token);
      setToken(res.data.token);
      setUser(userObj);
      return { success: true, user: userObj };
    } catch (error) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Registration failed' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
