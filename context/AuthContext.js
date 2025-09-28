import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    try {
      const userData = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (userData && token) {
        setUser(JSON.parse(userData));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Error al verificar autenticación:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      
      const response = await axios.get(process.env.NEXT_PUBLIC_APP_URL+'/api/users');
      const users = response.data;
      
      const foundUser = users.find(u => u.email === email && u.password === password);
      
      if (!foundUser) {
        throw new Error('Credenciales inválidas');
      }

      const token = `token_${foundUser.id}_${Date.now()}`;
      
      localStorage.setItem('user', JSON.stringify(foundUser));
      localStorage.setItem('token', token);
      
      setUser(foundUser);
      setIsAuthenticated(true);
      
      return { success: true, user: foundUser };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role = 'usuario') => {
    try {
      setLoading(true);
      
      const response = await axios.get(process.env.NEXT_PUBLIC_APP_URL+'/api/users');
      const existingUser = response.data.find(u => u.email === email);
      
      if (existingUser) {
        throw new Error('El email ya está registrado');
      }

      const newUser = {
        id: Date.now(),
        name,
        email,
        password,
        role,
        avatar: name.split(' ').map(n => n[0]).join('').toUpperCase()
      };

      await axios.post(process.env.NEXT_PUBLIC_APP_URL+'/api/users', newUser);
      
      return await login(email, password);
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated,
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