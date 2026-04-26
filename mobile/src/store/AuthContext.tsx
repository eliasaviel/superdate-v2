import React, { createContext, useContext, useEffect, useState } from 'react';
import { getToken, saveToken, removeToken } from '../utils/storage';
import { apiClient } from '../services/api/client';

interface User {
  id: string;
  email?: string;
  phone?: string;
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (token: string, user: User) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    bootstrap();
  }, []);

  async function bootstrap() {
    try {
      const stored = await getToken();
      if (stored) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${stored}`;
        const res = await apiClient.get('/users/me');
        if (res.data.ok) {
          setToken(stored);
          setUser(res.data.user);
        } else {
          await removeToken();
        }
      }
    } catch {
      await removeToken();
    } finally {
      setLoading(false);
    }
  }

  async function login(newToken: string, newUser: User) {
    await saveToken(newToken);
    apiClient.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    setToken(newToken);
    setUser(newUser);
  }

  async function logout() {
    await removeToken();
    delete apiClient.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
