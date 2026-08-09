import { apiClient } from './client';
import type { UserProfile, EnrolledCourse } from '../types/user';
import { mockProfile, mockCourses } from '../mocks/data';
import { mockDelay } from '../mocks/delay';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function getMyProfile(): Promise<UserProfile> {
  if (USE_MOCK) return mockProfile;

  const res = await apiClient.get<UserProfile>('/api/users/myPage');
  return res.data;
}

export async function getEnrolledCourses(): Promise<EnrolledCourse[]> {
  if (USE_MOCK) return mockCourses;

  const res = await apiClient.get<EnrolledCourse[]>('/api/enrollments');
  return res.data;
}

export type UpdateProfilePayload = Pick<UserProfile, 'name' | 'department' | 'cohort'>;

export async function updateMyProfile(payload: UpdateProfilePayload): Promise<UserProfile> {
  if (USE_MOCK) return mockDelay({ ...mockProfile, ...payload });

  const res = await apiClient.put<UserProfile>('/api/users/myPage/profile', payload);
  return res.data;
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

  await apiClient.put('/api/users/myPage/password', payload);
}
