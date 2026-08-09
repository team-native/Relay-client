import {
  createContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  ACCESS_TOKEN_KEY,
  AUTH_TOKEN_REMOVED_EVENT,
} from '../api/client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
  checkAuthStatus: () => Promise<void>;
}

export const AuthContext = createContext<
  AuthContextType | undefined
>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
  );

  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (!token) {
      setIsAuthenticated(false);
      setIsLoading(false);
      return;
    }

    setIsAuthenticated(true);
    setIsLoading(false);
  };

  useEffect(() => {
    void checkAuthStatus();
  }, []);

  useEffect(() => {
    const handleTokenRemoved = () => {
      setIsAuthenticated(false);
    };

    window.addEventListener(
      AUTH_TOKEN_REMOVED_EVENT,
      handleTokenRemoved
    );

    return () => {
      window.removeEventListener(
        AUTH_TOKEN_REMOVED_EVENT,
        handleTokenRemoved
      );
    };
  }, []);

  function login() {
    setIsAuthenticated(true);
  }

  function logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setIsAuthenticated(false);
    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}