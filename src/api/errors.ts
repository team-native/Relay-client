import axios from 'axios';

/** 서버가 인증되지 않은 요청에 내려주는 메시지 */
export const LOGIN_REQUIRED_MESSAGE = '로그인 후 이용해주세요.';

/** 서버가 내려준 오류 메시지를 그대로 보여주고, 없으면 기본 문구로 대체해요. */
export function getServerErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError(error)) return fallback;

  const serverMessage = (error.response?.data as { message?: string } | undefined)?.message;
  if (serverMessage) return serverMessage;
  if (error.response?.status === 401) return LOGIN_REQUIRED_MESSAGE;

  return fallback;
}
