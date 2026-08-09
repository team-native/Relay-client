import { useState, type ReactNode } from 'react';
import { logout as logoutApi } from '../api/authApi';
import { ACCESS_TOKEN_KEY } from '../api/client';
import { AuthContext } from './authContextValue';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(
    () => Boolean(localStorage.getItem(ACCESS_TOKEN_KEY))
  );

  function login() {
    setIsLoggedIn(true);
  }

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
