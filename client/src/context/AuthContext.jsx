import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [loading, setLoading] = useState(true);

  const saveAuth = (authToken, authUser) => {
    localStorage.setItem('token', authToken);
    localStorage.setItem('user', JSON.stringify(authUser));
    setToken(authToken);
    setUser(authUser);
  };

  const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken('');
    setUser(null);
  };

  const fetchMe = async () => {
    try {
      if (!localStorage.getItem('token')) {
        setLoading(false);
        return;
      }

      const response = await api.get('/auth/me');
      const me = response.data?.user || null;

      if (me) {
        localStorage.setItem('user', JSON.stringify(me));
        setUser(me);
      }
    } catch (error) {
      clearAuth();
    } finally {
      setLoading(false);
    }
  };

  const login = async (payload) => {
    try {
      const response = await api.post('/auth/login', payload);
      const authToken = response.data?.token;
      const authUser = response.data?.user;

      if (!authToken || !authUser) {
        throw new Error('Invalid login response');
      }

      saveAuth(authToken, authUser);
      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Login failed. Please check your connection and backend server.';
      throw { message };
    }
  };

  const register = async (payload) => {
    try {
      const response = await api.post('/auth/register', payload);
      const authToken = response.data?.token;
      const authUser = response.data?.user;

      if (!authToken || !authUser) {
        throw new Error('Invalid registration response');
      }

      saveAuth(authToken, authUser);
      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Registration failed. Please check your connection and backend server.';
      throw { message };
    }
  };

  const logout = () => {
    clearAuth();
  };

  useEffect(() => {
    const cachedUser = localStorage.getItem('user');

    if (cachedUser) {
      try {
        setUser(JSON.parse(cachedUser));
      } catch (error) {
        localStorage.removeItem('user');
      }
    }

    fetchMe();
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      setUser,
    }),
    [user, token, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
};
