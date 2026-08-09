import { apiClient } from './client';
import type {
  CreateStudyPayload,
  Study,
  StudyComment,
  StudyDetail,
} from '../types/study';
import {
  createMockStudy,
  mockProfile,
  mockStudies,
  mockStudyDetails,
} from '../mocks/data';
import { mockDelay } from '../mocks/delay';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
const CONFIRMED_PARTICIPANT_COUNT = 10;

const mockStudyStore = mockStudies;
const mockStudyDetailStore = mockStudyDetails;

// 릴레이 스터디 목록 조회
export async function getStudies(): Promise<Study[]> {
  if (USE_MOCK) {
    return mockDelay(mockStudyStore.map((study) => ({ ...study })));
  }

  const res = await apiClient.get<Study[]>('/studies');
  return res.data;
}

// 릴레이 스터디 상세 조회
export async function getStudyDetail(
  studyId: string
): Promise<StudyDetail> {
  if (USE_MOCK) {
    const detail = mockStudyDetailStore[studyId];

    if (!detail) {
      throw new Error('해당 릴레이 스터디를 찾을 수 없어요.');
    }

    return mockDelay({
      ...detail,
      author: { ...detail.author },
      participants: detail.participants.map((participant) => ({
        ...participant,
      })),
      comments: detail.comments.map((comment) => ({
        ...comment,
      })),
    });
  }

  const res = await apiClient.get<StudyDetail>(`/studies/${studyId}`);
  return res.data;
}

export async function createStudy(
  payload: CreateStudyPayload
): Promise<Study> {
  if (USE_MOCK) {
    const created = createMockStudy(payload, String(Date.now()));

    mockStudyStore.unshift(created);

    return mockDelay({ ...created });
  }

  const res = await apiClient.post<Study>('/studies', payload);
  return res.data;
}

export async function applyStudy(studyId: string): Promise<void> {
  if (USE_MOCK) {
    const study = mockStudyStore.find((item) => item.id === studyId);
    const detail = mockStudyDetailStore[studyId];

    if (study && detail && !detail.isApplied) {
      const participant = {
        id: `me-${Date.now()}`,
        name: mockProfile.name,
        department: mockProfile.department,
        cohort: mockProfile.cohort,
      };

      study.participantCount += 1;
      detail.participantCount += 1;

      if (study.participantCount >= CONFIRMED_PARTICIPANT_COUNT) {
        study.status = '개설확정';
        detail.status = '개설확정';
      }

      detail.isApplied = true;
      detail.participants = [participant, ...detail.participants];
    }

    return mockDelay(undefined);
  }

  await apiClient.post('/enrollments', {
    lectureId: studyId,
  });
}

export async function cancelStudyApplication(
  studyId: string
): Promise<void> {
  if (USE_MOCK) {
    const study = mockStudyStore.find((item) => item.id === studyId);
    const detail = mockStudyDetailStore[studyId];

    if (study && detail && detail.isApplied) {
      study.participantCount = Math.max(
        0,
        study.participantCount - 1
      );

      detail.participantCount = Math.max(
        0,
        detail.participantCount - 1
      );

      detail.isApplied = false;

      detail.participants = detail.participants.filter(
        (participant) => !participant.id.startsWith('me-')
      );
    }

    return mockDelay(undefined);
  }

  await apiClient.delete(`/enrollments/${studyId}`);
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

  const res = await apiClient.post<StudyComment>(
    `/studies/${studyId}/comments`,
    { content }
  );

  return res.data;
}