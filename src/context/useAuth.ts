import { useContext } from 'react';
import { AuthContext } from './authContextValue';

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있어요.');
  }

  return context;
}