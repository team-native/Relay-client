import { apiClient } from './client';
import type { Notice, NoticeDetail } from '../types/notice';
import { mockNotices, mockNoticeDetails } from '../mocks/data';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function getNotices(): Promise<Notice[]> {
  if (USE_MOCK) return mockNotices;

  const res = await apiClient.get<Notice[]>('/api/notice');
  return res.data;
}

export async function getNoticeDetail(noticeId: string): Promise<NoticeDetail> {
  if (USE_MOCK) {
    const detail = mockNoticeDetails[noticeId];
    if (!detail) throw new Error('해당 공지사항을 찾을 수 없어요.');
    return detail;
  }

  const res = await apiClient.get<NoticeDetail>(`/api/notice/${noticeId}`);
  return res.data;
}

export async function createNotice(payload: { title: string; content: string }) {
  const response = await apiClient.post('/api/notice/new', payload);
  return response.data;
}

export async function updateNotice(noticeId: string, payload: { title: string; content: string }) {
  const response = await apiClient.patch(`/api/notice/${noticeId}`, payload);
  return response.data;
}

export async function deleteNotice(noticeId: string) {
  const response = await apiClient.delete(`/api/notice/${noticeId}`);
  return response.data;
}