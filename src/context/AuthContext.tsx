import { useEffect, useState, type ReactNode } from 'react';
import { logout as logoutApi } from '../api/authApi';
import { ACCESS_TOKEN_KEY, AUTH_TOKEN_REMOVED_EVENT } from '../api/client';
import { AuthContext } from './authContextValue';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
  );

  function login() {
    setIsLoggedIn(true);
  }

  useEffect(() => {
    function handleTokenRemoved() {
      setIsLoggedIn(false);
    }

    window.addEventListener(AUTH_TOKEN_REMOVED_EVENT, handleTokenRemoved);

    return () => {
      window.removeEventListener(AUTH_TOKEN_REMOVED_EVENT, handleTokenRemoved);
    };
  }, []);

  async function logout() {
    try {
      await logoutApi();
    } finally {
      setIsLoggedIn(false);
    }
  }

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
