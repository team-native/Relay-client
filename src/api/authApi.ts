import { apiClient, ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from './client';
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
  department: string;
  cohort: string;
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
    data?: {
      accessToken?: string;
      refreshToken?: string;
    };
  };

  return {
    accessToken: body.accessToken ?? body.data?.accessToken,
    refreshToken: body.refreshToken ?? body.data?.refreshToken,
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

export async function login(payload: LoginPayload): Promise<AuthTokens | void> {
  if (USE_MOCK) return mockDelay(undefined);

  const res = await apiClient.post('/login', payload);
  const tokens = normalizeTokens(res.data);
  saveTokens(tokens);
  return tokens;
}

export async function logout(): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined);

  try {
    await apiClient.post('/logout');
  } finally {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export async function signup(payload: SignupPayload): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined);

  await apiClient.post('/signup', payload);
}

export async function sendVerificationEmail(email: string): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined);

  await apiClient.post('/send', { email });
}

export async function verifyEmail(payload: VerifyEmailPayload): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined);

  await apiClient.post('/verify', payload);
}

export async function reissueToken(): Promise<AuthTokens | void> {
  if (USE_MOCK) return mockDelay(undefined);

  const res = await apiClient.post('/reissue');
  const tokens = normalizeTokens(res.data);
  saveTokens(tokens);
  return tokens;
}
