import type { Notice, NoticeDetail } from '../types/notice';
import type { UserProfile, EnrolledCourse } from '../types/user';

export const mockNotices: Notice[] = [
  { id: '1', title: '1학기 릴스 운영 마무리', date: '2026.07.26', isNew: true },
  { id: '2', title: '시스템 점검 안내 (8/5 새벽)', date: '2026.07.16' },
  { id: '3', title: '신입생 대상 연사 안내', date: '2026.07.10' },
];

export const mockNoticeDetails: Record<string, NoticeDetail> = {
  '1': {
    id: '1',
    title: '1학기 릴스 운영 마무리',
    date: '2026.07.26',
    isNew: true,
    author: '관리자',
    content:
      '안녕하세요, 운영팀입니다.\n1학기동안 릴레이 스터디가 원활하게 운영되도록 해주신 GSM 학생 여러분 감사합니다!\n\n2학기에도 많은 연사자들과 다양한 연사 내용을 기대하겠습니다!',
  },
  '2': {
    id: '2',
    title: '시스템 점검 안내 (8/5 새벽)',
    date: '2026.07.16',
    author: '관리자',
    content: '8월 5일 새벽 시간대에 시스템 점검이 진행될 예정입니다.\n서비스 이용에 참고 부탁드립니다.',
  },
  '3': {
    id: '3',
    title: '신입생 대상 연사 안내',
    date: '2026.07.10',
    author: '관리자',
    content: '신입생을 대상으로 한 연사 프로그램을 안내드립니다.\n많은 관심 부탁드립니다.',
  },
};

export const mockProfile: UserProfile = {
  name: '양지우',
  email: 's26040@gsm.hs.kr',
  department: '스마트IoT과',
  cohort: '10기',
};

export const mockCourses: EnrolledCourse[] = [
  { id: '1', title: '프론트엔드 협업 기초', status: '개설확정', scheduledAt: '8/1 19:00' },
  { id: '2', title: 'AI 프롬프트 잘 짜는 법', status: '개설확정', scheduledAt: '7/30 15:00' },
  { id: '3', title: '맥북을 이용한 개발 실습', status: '종료', scheduledAt: '7/25 19:00' },
];