import axios, { type InternalAxiosRequestConfig } from 'axios';

export const ACCESS_TOKEN_KEY = 'relay_access_token';
export const REFRESH_TOKEN_KEY = 'relay_refresh_token';
export const AUTH_TOKEN_REMOVED_EVENT = 'relay_auth_token_removed';

const PUBLIC_AUTH_PATHS = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/email/send',
  '/api/auth/email/verify',
  '/api/auth/reissue',
];

const PUBLIC_GET_PATHS = [
  '/api/notice',
];

function isPublicAuthUrl(url: string): boolean {
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
}

function isPublicGetUrl(config: InternalAxiosRequestConfig): boolean {
  const requestUrl = config.url ?? '';
  const method = (config.method ?? 'get').toLowerCase();

  return (
    method === 'get' &&
    PUBLIC_GET_PATHS.some((path) => requestUrl === path || requestUrl.startsWith(`${path}/`))
  );
}

function removeStoredTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.dispatchEvent(new Event(AUTH_TOKEN_REMOVED_EVENT));
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const requestUrl = config.url ?? '';

  if (isPublicAuthUrl(requestUrl) || isPublicGetUrl(config)) {
    delete config.headers.Authorization;
    config.withCredentials = false;
    return config;
  }

  const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const requestUrl = originalRequest?.url ?? '';
    const isAuthRequest = isPublicAuthUrl(requestUrl);

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isAuthRequest || isPublicGetUrl(originalRequest)) {
      removeStoredTokens();
      return Promise.reject(error);
    }

    if (!refreshPromise) {
        const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);

        if (!refreshToken) {
          removeStoredTokens();
          return Promise.reject(error);
        }

        refreshPromise = apiClient
          .post('/api/auth/reissue', {
            refreshToken,
          })
        .then((response) => {
          const data = response.data as {
            accessToken?: string;
            refreshToken?: string;
            data?: {
              accessToken?: string;
              refreshToken?: string;
            };
          };

          const newAccessToken =
            data.accessToken ?? data.data?.accessToken ?? null;

          const newRefreshToken =
            data.refreshToken ?? data.data?.refreshToken ?? null;

          if (!newAccessToken) {
            throw new Error('재발급된 accessToken이 없습니다.');
          }

          localStorage.setItem(ACCESS_TOKEN_KEY, newAccessToken);

          if (newRefreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
          }

          return newAccessToken;
        })
        .catch(() => {
          removeStoredTokens();
          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const newAccessToken = await refreshPromise;

    if (!newAccessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

    return apiClient(originalRequest);
  }
);
