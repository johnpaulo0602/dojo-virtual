import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, type ReactNode } from "react";
import type { User } from "@/types";
import { api, setAccessToken } from "@/lib/api";
import axios from "axios";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (access_token: string, refresh_token: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const response = await api.get('/api/v1/auth/me');
      setUser(response.data);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        // Use base axios to avoid the interceptor catching the 401 and looping
        const response = await axios.post(`${api.defaults.baseURL}/api/v1/auth/refresh`, {
          refresh_token: refreshToken
        });
        
        const { access_token, refresh_token: new_refresh } = response.data;
        setAccessToken(access_token);
        localStorage.setItem('refresh_token', new_refresh);
        
        // Fetch user profile
        await fetchUser();
      } catch (error) {
        console.error("Auto login failed", error);
        localStorage.removeItem('refresh_token');
        setAccessToken(null);
        setIsLoading(false);
      }
    };

    initAuth();
  }, [fetchUser]);

  const login = useCallback(async (access_token: string, refresh_token: string) => {
    setAccessToken(access_token);
    localStorage.setItem('refresh_token', refresh_token);
    await fetchUser();
  }, [fetchUser]);

  const logout = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await api.post('/api/v1/auth/logout', { refresh_token: refreshToken });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAccessToken(null);
      localStorage.removeItem('refresh_token');
      setUser(null);
    }
  }, []);

  const value = useMemo(() => ({ user, isLoading, login, logout }), [user, isLoading, login, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
