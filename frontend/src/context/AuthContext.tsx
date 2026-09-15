import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole, LanguageCode } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { name: string; email: string; password: string; confirm_password?: string; phone?: string; preferred_language?: string; role?: string }) => Promise<any>;
  logout: () => void;
  quickDemoLogin: (role: 'farmer' | 'admin') => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('agrismart_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    const fetchMe = async () => {
      const storedToken = localStorage.getItem('agrismart_token');
      if (storedToken) {
        try {
          const userData = await authApi.getMe();
          if (isMounted) {
            setUser(userData);
            setToken(storedToken);
          }
        } catch (err) {
          console.warn('Session expired or invalid token');
          if (isMounted) {
            localStorage.removeItem('agrismart_token');
            setToken(null);
            setUser(null);
          }
        }
      } else {
        if (isMounted) {
          setUser(null);
          setToken(null);
        }
      }
      if (isMounted) setIsLoading(false);
    };
    fetchMe();
    return () => { isMounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login(email, password);
    localStorage.setItem('agrismart_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const register = async (userData: { name: string; email: string; password: string; confirm_password?: string; phone?: string; preferred_language?: string; role?: string }) => {
    return await authApi.register(userData);
  };

  const logout = () => {
    localStorage.removeItem('agrismart_token');
    setToken(null);
    setUser(null);
  };


  const quickDemoLogin = async (role: 'farmer' | 'admin') => {
    if (role === 'farmer') {
      await login('demo@agrismart.local', 'Demo@12345');
    } else {
      await login('admin@agrismart.local', 'Admin@12345');
    }
  };

  const updateUser = (updated: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updated });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        quickDemoLogin,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
