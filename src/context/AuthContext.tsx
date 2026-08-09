import {
  useEffect,
  useState,
  type ReactNode,
} from 'react';

import {
  ACCESS_TOKEN_KEY,
  AUTH_TOKEN_REMOVED_EVENT,
} from '../api/client';

import { getMyProfile } from '../api/userApi';

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

  const [userName, setUserName] = useState<string | null>(null);

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

  // 로그인 상태가 되면 내 프로필을 가져와서 이름을 저장하고,
  // 로그아웃되면 이름을 비워요.
  useEffect(() => {
    if (!isLoggedIn) {
      setUserName(null);
      return;
    }

    let isCancelled = false;

    getMyProfile()
      .then((profile) => {
        if (!isCancelled) setUserName(profile.name);
      })
      .catch(() => {
        if (!isCancelled) setUserName(null);
      });

    return () => {
      isCancelled = true;
    };
  }, [isLoggedIn]);

  function login() {
    setIsLoggedIn(true);
  }

  async function logout() {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem('relay_refresh_token');

    setIsLoggedIn(false);
    setUserName(null);

    window.location.href = '/login';
  }

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        userName,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}