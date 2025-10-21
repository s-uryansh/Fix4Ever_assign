'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthResponse } from '@/types';
import { authAPI } from '@/utils/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<AuthResponse>;
  register: (userData: any) => Promise<AuthResponse>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
  setUser?: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && token !== 'undefined' && token !== 'null' && userData) {
        try {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          
          // Verify token is still valid
          try {
            // You might want to add a token validation endpoint
            // await authAPI.validateToken();
          } catch (error) {
            console.warn('Token validation failed, logging out');
            logout();
          }
        } catch (error) {
          console.error('Failed to parse user data:', error);
          logout();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await authAPI.login(email, password);
      
      const { user: userData, token } = response.data;
      
      const actualToken = token || userData?.token;
      
      if (!actualToken) {
        throw new Error('No token received from server');
      }
      
      // Store token and user data
      localStorage.setItem('token', actualToken);
      
      const userWithoutToken = { ...userData };
      delete userWithoutToken.token;
      
      localStorage.setItem('user', JSON.stringify(userWithoutToken));
      
      setUser(userWithoutToken);
      
      return {
        ...response.data,
        user: userWithoutToken,
        token: actualToken
      };
    } catch (error: any) {
      console.error('Login failed:', error);
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const register = async (userData: any): Promise<AuthResponse> => {
    // Validate passwords match
    if (userData.password !== userData.confirmPassword) {
      throw new Error('Passwords do not match');
    }
    
    const { confirmPassword, ...payload } = userData;
    
    try {
      const response = await authAPI.register(payload);
      
      const { user: newUser, token } = response.data;
      
      const actualToken = token || newUser?.token;
      
      if (!actualToken) {
        throw new Error('No token received from server');
      }
      
      localStorage.setItem('token', actualToken);
      
      const userWithoutToken = { ...newUser };
      delete userWithoutToken.token;
      
      localStorage.setItem('user', JSON.stringify(userWithoutToken));
      
      setUser(userWithoutToken);
      
      return {
        ...response.data,
        user: userWithoutToken,
        token: actualToken
      };
    } catch (error: any) {
      console.error('Registration failed:', error);
      const errorMessage = error.response?.data?.message || 'Registration failed. Please try again.';
      throw new Error(errorMessage);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    // Optional: Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    loading,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};