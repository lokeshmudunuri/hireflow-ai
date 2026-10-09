import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('hireflow_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('hireflow_token') || null);
  const [loading, setLoading] = useState(true);

  // Persistent session verification on page refresh
  useEffect(() => {
    const verifyUser = async () => {
      const storedToken = localStorage.getItem('hireflow_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          if (res?.data?.success && res.data.user) {
            setUser(res.data.user);
            localStorage.setItem('hireflow_user', JSON.stringify(res.data.user));
          } else {
            handleSessionClear();
          }
        } catch (err) {
          console.warn('Session verification failed on refresh:', err?.response?.data?.message || err.message);
          handleSessionClear();
        }
      } else {
        handleSessionClear();
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const handleSessionClear = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('hireflow_token');
    localStorage.removeItem('hireflow_user');
  };

  const login = async (email, password) => {
    try {
      const res = await authApi.login(email, password);
      if (res.data?.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('hireflow_token', newToken);
        localStorage.setItem('hireflow_user', JSON.stringify(newUser));
        return newUser;
      }
      throw new Error(res.data?.message || 'Authentication failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed';
      throw new Error(msg);
    }
  };

  const register = async (userData) => {
    try {
      const res = await authApi.register(userData);
      if (res.data?.success) {
        const { token: newToken, user: newUser } = res.data;
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('hireflow_token', newToken);
        localStorage.setItem('hireflow_user', JSON.stringify(newUser));
        return newUser;
      }
      throw new Error(res.data?.message || 'Registration failed');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      throw new Error(msg);
    }
  };

  const quickLogin = async (role) => {
    let email = 'recruiter@hireflow.dev';
    if (role === 'admin') email = 'admin@hireflow.dev';
    if (role === 'interviewer') email = 'interviewer@hireflow.dev';

    return await login(email, 'Password123!');
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // Ignore network errors on logout
    } finally {
      handleSessionClear();
    }
  };

  const forgotPassword = async (email) => {
    try {
      const res = await authApi.forgotPassword(email);
      return res.data;
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Password reset request failed';
      throw new Error(msg);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        quickLogin,
        logout,
        forgotPassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
