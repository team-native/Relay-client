import { apiClient } from './client';
import type { CreateStudyPayload, Study, StudyComment, StudyDetail } from '../types/study';
import { createMockStudy, mockProfile, mockStudies, mockStudyDetails } from '../mocks/data';
import { mockDelay } from '../mocks/delay';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function getStudies(): Promise<Study[]> {
  if (USE_MOCK) return mockStudies;

  const res = await apiClient.get<Study[]>('/studies');
  return res.data;
}

export async function getStudyDetail(studyId: string): Promise<StudyDetail> {
  if (USE_MOCK) {
    const detail = mockStudyDetails[studyId];
    if (!detail) throw new Error('해당 릴레이 스터디를 찾을 수 없어요.');
    return detail;
  }

  const res = await apiClient.get<StudyDetail>(`/studies/${studyId}`);
  return res.data;
}

export async function createStudy(payload: CreateStudyPayload): Promise<Study> {
  if (USE_MOCK) return mockDelay(createMockStudy(payload, String(Date.now())));

  const res = await apiClient.post<Study>('/studies', payload);
  return res.data;
}

export async function applyStudy(studyId: string): Promise<void> {
  if (USE_MOCK) return mockDelay(undefined);

  await apiClient.post(`/studies/${studyId}/applications`);
}

export async function createStudyComment(
  studyId: string,
  content: string
): Promise<StudyComment> {
  if (USE_MOCK) {
    return mockDelay({
      id: String(Date.now()),
      author: mockProfile.name,
      department: mockProfile.department,
      cohort: mockProfile.cohort,
      content,
      createdAt: '방금 전',
    });
  }

  const res = await apiClient.post<StudyComment>(`/studies/${studyId}/comments`, { content });
  return res.data;
}
