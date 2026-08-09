import { createContext } from 'react';

export interface AuthContextValue {
  isLoggedIn: boolean;
  userName: string | null;
  login: () => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
