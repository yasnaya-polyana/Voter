"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';

type AuthContextType = {
  isLoggedIn: boolean;
  user: { type: 'voter' | 'campaign' | null };
  login: (type: 'voter' | 'campaign') => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ type: 'voter' | 'campaign' | null }>({ type: null });

  useEffect(() => {
    // Check local storage or cookies for existing session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setIsLoggedIn(true);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (type: 'voter' | 'campaign') => {
    setIsLoggedIn(true);
    setUser({ type });
    localStorage.setItem('user', JSON.stringify({ type }));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUser({ type: null });
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, login, logout }}>
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
