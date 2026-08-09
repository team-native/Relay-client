import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  ACCESS_TOKEN_KEY,
  AUTH_TOKEN_REMOVED_EVENT,
} from '../api/client';

import { AuthContext } from './authContextValue';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({
  children,
}: AuthProviderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
  );

  useEffect(() => {
    const handleTokenRemoved = () => {
      setIsLoggedIn(false);
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
    setIsLoggedIn(true);
  }

  async function logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem('relay_refresh_token');

    setIsLoggedIn(false);

    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}