'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api';
import { User, AuthResponse } from '@/types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, senha: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  hasRole: (roles: string[]) => boolean;
}

interface RegisterData {
  nome: string;
  email: string;
  senha: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/login', '/register'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setIsLoading(false);
      if (!publicRoutes.includes(pathname)) {
        router.push('/login');
      }
      return;
    }

    try {
      const response = await api.get<User>('/auth/me');
      setUser(response.data);

      if (publicRoutes.includes(pathname)) {
        router.push('/');
      }
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
      if (!publicRoutes.includes(pathname)) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  }, [pathname, router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (email: string, senha: string) => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      senha,
    });

    localStorage.setItem('token', response.data.access_token);
    setUser(response.data.user);
    router.push('/');
  };

  const register = async (data: RegisterData) => {
    const response = await api.post<AuthResponse>('/auth/register', data);

    localStorage.setItem('token', response.data.access_token);
    setUser(response.data.user);
    router.push('/');
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    router.push('/login');
  };

  const hasRole = (roles: string[]) => {
    if (!user) return false;
    if (user.cargo === 'admin') return true;
    return roles.includes(user.cargo);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        hasRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
