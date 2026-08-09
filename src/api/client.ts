import axios, { type InternalAxiosRequestConfig } from 'axios';

export const ACCESS_TOKEN_KEY = 'relay_access_token';
export const REFRESH_TOKEN_KEY = 'relay_refresh_token';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  }
);

let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean;
        })
      | undefined;

    const requestUrl = originalRequest?.url ?? '';

    // 로그인/회원가입/이메일 인증처럼
    // 로그인 전에 사용하는 API는 토큰 재발급을 시도하지 않는다.
    const isAuthRequest =
      requestUrl.includes('/api/auth/login') ||
      requestUrl.includes('/api/auth/signup') ||
      requestUrl.includes('/api/auth/email/send') ||
      requestUrl.includes('/api/auth/email/verify') ||
      requestUrl.includes('/api/auth/reissue');

    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry ||
      isAuthRequest
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshPromise) {
      refreshPromise = apiClient
        .post('/api/auth/reissue')
        .then((response) => {
          const data = response.data as {
            accessToken?: string;
            refreshToken?: string;
            data?: {
              accessToken?: string;
              refreshToken?: string;
            };
          };

          const accessToken =
            data.accessToken ??
            data.data?.accessToken ??
            null;

          const refreshToken =
            data.refreshToken ??
            data.data?.refreshToken;

          if (accessToken) {
            localStorage.setItem(
              ACCESS_TOKEN_KEY,
              accessToken
            );
          }

          if (refreshToken) {
            localStorage.setItem(
              REFRESH_TOKEN_KEY,
              refreshToken
            );
          }

          return accessToken;
        })
        .catch(() => {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);

          return null;
        })
        .finally(() => {
          refreshPromise = null;
        });
    }

    const accessToken = await refreshPromise;

    if (!accessToken) {
      return Promise.reject(error);
    }

    originalRequest.headers.Authorization =
      `Bearer ${accessToken}`;

    return apiClient(originalRequest);
  }
);