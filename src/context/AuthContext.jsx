import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../services/api';

/**
 * Authentication Context
 * Manages user authentication state and provides auth methods
 */
export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      apiClient.setToken(savedToken);
      // Optionally fetch user data
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      const response = await apiClient.login(email, password);

      if (response.token) {
        setToken(response.token);
        apiClient.setToken(response.token, response.refreshToken);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const register = async (data) => {
    try {
      setError(null);
      const response = await apiClient.register(data);

      if (response.token) {
        setToken(response.token);
        apiClient.setToken(response.token, response.refreshToken);
        setUser(response.user);
        localStorage.setItem('token', response.token);
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      }

      return response;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    setError(null);
    apiClient.logout();
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
