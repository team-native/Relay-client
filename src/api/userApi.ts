import { apiClient } from './client';
import type { UserProfile } from '../types/user';
import { mockProfile } from '../mocks/data';
import { mockDelay } from '../mocks/delay';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export async function getMyProfile(): Promise<UserProfile> {
  if (USE_MOCK) return mockDelay(mockProfile);

  const res = await apiClient.get<ApiEnvelope<UserProfile>>('/api/users/myPage');
  return res.data.data;
}

export type UpdateProfilePayload = Pick<UserProfile, 'name' | 'department' | 'cohort'>;

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  if (USE_MOCK) return mockDelay({ ...mockProfile, ...payload });

  const res = await apiClient.patch<ApiEnvelope<UserProfile>>('/api/users/myPage/profile', payload);
  return res.data.data;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export async function changePassword(payload: ChangePasswordPayload): Promise<void> {
  if (USE_MOCK) {
    if (payload.currentPassword === 'wrongpass') {
      return Promise.reject(new Error('현재 비밀번호가 일치하지 않아요.'));
    }
    return mockDelay(undefined);
  }

  await apiClient.patch('/api/users/myPage/password', payload);
}