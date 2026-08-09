import {
  apiClient,
  ACCESS_TOKEN_KEY,
  AUTH_TOKEN_REMOVED_EVENT,
  REFRESH_TOKEN_KEY,
} from './client';
import { mockDelay } from '../mocks/delay';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  name: string;
  email: string;
  password: string;
  passwordConfirm: string;
  department: string;
  generation: string;
}

export interface VerifyEmailPayload {
  email: string;
  code: string;
}

export interface AuthTokens {
  accessToken?: string;
  refreshToken?: string;
}

function normalizeTokens(data: unknown): AuthTokens {
  const body = (data ?? {}) as {
    accessToken?: string;
    refreshToken?: string;
    token?: {
      accessToken?: string;
      refreshToken?: string;
    };
    data?: {
      accessToken?: string;
      refreshToken?: string;
      token?: {
        accessToken?: string;
        refreshToken?: string;
      };
    };
  };

  return {
    accessToken:
      body.accessToken ??
      body.token?.accessToken ??
      body.data?.accessToken ??
      body.data?.token?.accessToken,

    refreshToken:
      body.refreshToken ??
      body.token?.refreshToken ??
      body.data?.refreshToken ??
      body.data?.token?.refreshToken,
  };
}

function saveTokens(tokens: AuthTokens) {
  if (tokens.accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  }

  if (tokens.refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  }
}

export async function login(
  payload: LoginPayload
): Promise<AuthTokens | void> {
  if (USE_MOCK) return mockDelay(undefined);

  const res = await apiClient.post('/api/auth/login', payload);
  const tokens = normalizeTokens(res.data);

  saveTokens(tokens);

  return tokens;
}

export async function logout(): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined);

  try {
    await apiClient.post('/api/auth/logout');
  } finally {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.dispatchEvent(new Event(AUTH_TOKEN_REMOVED_EVENT));
  }
}

export async function signup(
  payload: SignupPayload
): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined);

  await apiClient.post('/api/auth/signup', payload);
}

export async function sendVerificationEmail(
  email: string
): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined);

  await apiClient.post('/api/auth/email/send', {
    email,
  });
}

export async function verifyEmail(
  payload: VerifyEmailPayload
): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined);

  await apiClient.post('/api/auth/email/verify', payload);
}

export async function reissueToken(): Promise<AuthTokens | void> {
  if (USE_MOCK) return mockDelay(undefined);

  const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

  if (!refreshToken) {
    throw new Error("Refresh token이 없습니다.");
  }

  const res = await apiClient.post('/api/auth/reissue', {
    refreshToken,
  });

  const tokens = normalizeTokens(res.data);

  saveTokens(tokens);

  return tokens;
}
