import axios, { type InternalAxiosRequestConfig } from 'axios';

export const ACCESS_TOKEN_KEY = 'relay_access_token';
export const REFRESH_TOKEN_KEY = 'relay_refresh_token';
export const USER_ROLE_KEY = 'relay_user_role';
export const AUTH_TOKEN_REMOVED_EVENT = 'relay_auth_token_removed';

const PUBLIC_AUTH_PATHS = [
  '/api/auth/login',
  '/api/auth/signup',
  '/api/auth/email/send',
  '/api/auth/email/verify',
  '/api/auth/reissue',
];

const PUBLIC_GET_PATHS: string[] = [];

function isPublicAuthUrl(url: string): boolean {
  return PUBLIC_AUTH_PATHS.some((path) => url.includes(path));
}

function isPublicGetUrl(config: InternalAxiosRequestConfig): boolean {
  const requestUrl = config.url ?? '';
  const method = (config.method ?? 'get').toLowerCase();

  return (
    method === 'get' &&
    PUBLIC_GET_PATHS.some(
      (path) =>
        requestUrl === path ||
        requestUrl.startsWith(`${path}/`)
    )
  );
}

function removeStoredTokens() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);

  window.dispatchEvent(
    new Event(AUTH_TOKEN_REMOVED_EVENT)
  );
}

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * 요청 인터셉터
 * LocalStorage에 저장된 accessToken을 Authorization 헤더에 추가
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const requestUrl = config.url ?? '';

    // 로그인 / 회원가입 / 이메일 인증 / 토큰 재발급
    // 공개 API는 accessToken을 붙이지 않음
    if (
      isPublicAuthUrl(requestUrl) ||
      isPublicGetUrl(config)
    ) {
      delete config.headers.Authorization;
      config.withCredentials = false;

      return config;
    }

    const accessToken = localStorage.getItem(
      ACCESS_TOKEN_KEY
    );

    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

let refreshPromise: Promise<string | null> | null = null;

/**
 * 응답 인터셉터
 * 401 발생 시 refreshToken으로 accessToken 재발급
 */
apiClient.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & {
          _retry?: boolean;
        })
      | undefined;

    const requestUrl = originalRequest?.url ?? '';
    const isAuthRequest = isPublicAuthUrl(requestUrl);

    // 401이 아니거나 이미 재시도한 요청이면 그대로 에러 반환
    if (
      error.response?.status !== 401 ||
      !originalRequest ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // 로그인/회원가입 등의 인증 API에서 401이면
    // 토큰을 제거하고 종료
    if (isAuthRequest) {
      removeStoredTokens();
      return Promise.reject(error);
    }

    // 공개 GET(예: /api/notice)은 애초에 토큰 없이 보낸 요청이라
    // 401이 나도 "현재 로그인 세션이 무효하다"는 뜻이 아니에요.
    // 로그인 토큰을 지우지 않고 에러만 그대로 반환해요.
    if (isPublicGetUrl(originalRequest)) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(
      REFRESH_TOKEN_KEY
    );

    // refreshToken이 없으면 로그인 상태가 아님
    if (!refreshToken) {
      removeStoredTokens();
      return Promise.reject(error);
    }

    // 동시에 여러 요청에서 401이 발생해도
    // refresh 요청은 하나만 실행
    if (!refreshPromise) {
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

              token?: {
                accessToken?: string;
                refreshToken?: string;
              };
            };

            token?: {
              accessToken?: string;
              refreshToken?: string;
            };
          };

          // 백엔드 응답:
          // {
          //   data: {
          //     token: {
          //       accessToken: "...",
          //       refreshToken: "..."
          //     }
          //   }
          // }

          const newAccessToken =
            data.accessToken ??
            data.token?.accessToken ??
            data.data?.accessToken ??
            data.data?.token?.accessToken ??
            null;

          const newRefreshToken =
            data.refreshToken ??
            data.token?.refreshToken ??
            data.data?.refreshToken ??
            data.data?.token?.refreshToken ??
            null;

          if (!newAccessToken) {
            throw new Error(
              '재발급된 accessToken이 없습니다.'
            );
          }

          localStorage.setItem(
            ACCESS_TOKEN_KEY,
            newAccessToken
          );

          if (newRefreshToken) {
            localStorage.setItem(
              REFRESH_TOKEN_KEY,
              newRefreshToken
            );
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

    // 원래 요청에 새 accessToken 적용
    originalRequest.headers.Authorization =
      `Bearer ${newAccessToken}`;

    // 원래 요청 다시 실행
    return apiClient(originalRequest);
  }
);

export default apiClient;