"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type UserType = 'voter' | 'campaign' | 'admin' | null;

interface User {
  id: string;
  email: string;
  userType: UserType;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string; user?: User }>;
  logout: () => void;
  isLoggedIn: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save user to state and localStorage
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Invalid credentials' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('auth_token');
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoggedIn: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
