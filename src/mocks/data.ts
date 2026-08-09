import type { Notice, NoticeDetail } from '../types/notice';
import type {
  CreateStudyPayload,
  Study,
  StudyComment,
  StudyDetail,
  StudyParticipant,
} from '../types/study';
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

export const mockStudies: Study[] = [
  {
    id: '1',
    title: 'Github 기초 클래스',
    status: '개설미정',
    presenters: ['1113 이시우'],
    scheduledAt: '8/12 19:00',
    createdAt: '08-03',
    participantCount: 9,
    capacity: 30,
    commentCount: 8,
  },
  {
    id: '2',
    title: '전공을 잘 선택하는 방법',
    status: '개설미정',
    presenters: ['1410 안율'],
    scheduledAt: '8/6 19:00',
    createdAt: '08-03',
    participantCount: 5,
    capacity: 30,
    commentCount: 21,
  },
  {
    id: '3',
    title: '안드로이드 앱 만들기',
    status: '개설미정',
    presenters: ['1406 박지성'],
    scheduledAt: '8/6 19:00',
    createdAt: '08-03',
    participantCount: 6,
    capacity: 30,
    commentCount: 3,
  },
  {
    id: '4',
    title: '리눅스 명령어 알아보기',
    status: '개설미정',
    presenters: ['1301 김민규', '1410 안율'],
    scheduledAt: '8/3 20:00',
    createdAt: '08-02',
    participantCount: 8,
    capacity: 30,
    commentCount: 2,
  },
  {
    id: '5',
    title: '피그마 2시간 이해하기',
    status: '개설미정',
    presenters: ['1206 김민준'],
    scheduledAt: '8/2 19:00',
    createdAt: '08-01',
    participantCount: 5,
    capacity: 20,
    commentCount: 1,
  },
  {
    id: '6',
    title: '아두이노 회로도 실습 클래스',
    status: '개설미정',
    presenters: ['1308 양지우'],
    scheduledAt: '8/2 13:00',
    createdAt: '08-01',
    participantCount: 2,
    capacity: 30,
    commentCount: 12,
  },
  {
    id: '7',
    title: '프론트엔드 협업 기초',
    status: '개설확정',
    presenters: ['1308 양지우'],
    scheduledAt: '8/1 19:00',
    createdAt: '08-01',
    participantCount: 13,
    capacity: 30,
    commentCount: 8,
  },
  {
    id: '8',
    title: 'AI 프롬프트 잘 짜는 법',
    status: '개설확정',
    presenters: ['1416 임서하'],
    scheduledAt: '7/30 15:00',
    createdAt: '07-29',
    participantCount: 21,
    capacity: 30,
    commentCount: 12,
  },
  {
    id: '9',
    title: '맥북을 이용한 개발 실습',
    status: '종료',
    presenters: ['1113 이시우', '1406 박지성'],
    scheduledAt: '7/25 19:00',
    createdAt: '07-19',
    participantCount: 13,
    capacity: 30,
    commentCount: 3,
  },
  {
    id: '10',
    title: '기능명세서 잘 작성하는법',
    status: '종료',
    presenters: ['1410 안율'],
    scheduledAt: '7/10 15:00',
    createdAt: '07-03',
    participantCount: 21,
    capacity: 30,
    commentCount: 2,
  },
];

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

const PRESENTER_PROFILES: Record<string, Pick<UserProfile, 'department' | 'cohort'>> = {
  '1113 이시우': { department: '소프트웨어개발과', cohort: '10기' },
  '1206 김민준': { department: '스마트IoT과', cohort: '9기' },
  '1301 김민규': { department: '소프트웨어개발과', cohort: '10기' },
  '1308 양지우': { department: '스마트IoT과', cohort: '10기' },
  '1406 박지성': { department: '인공지능과', cohort: '10기' },
  '1410 안율': { department: '인공지능과', cohort: '10기' },
  '1416 임서하': { department: '인공지능과', cohort: '10기' },
};

const PARTICIPANT_NAMES = [
  '김도윤', '이시우', '박지성', '정하윤', '최서준', '한지민', '오유진',
  '윤서아', '장민재', '임서하', '신예린', '고태윤', '배수빈', '문가은',
  '조현우', '권나윤', '황지호', '서지안', '노아름', '유하준', '천민서',
];

const COMMENT_POOL: Omit<StudyComment, 'id'>[] = [
  {
    author: '이시우',
    department: '소프트웨어개발과',
    cohort: '10기',
    content: '저도 듣고싶습니다..',
    createdAt: '2시간 전',
  },
  {
    author: '안율',
    department: '인공지능과',
    cohort: '10기',
    content: '혹시 노트북 필수인가요? 실습 위주라고 하셔서 여쭤봐요!',
    createdAt: '3시간 전',
  },
  {
    author: '박지성',
    department: '인공지능과',
    cohort: '10기',
    content: '기다리던 주제네요. 신청했습니다 👍',
    createdAt: '5시간 전',
  },
  {
    author: '김민규',
    department: '소프트웨어개발과',
    cohort: '10기',
    content: '1학년도 따라갈 수 있는 난이도인지 궁금합니다.',
    createdAt: '7시간 전',
  },
  {
    author: '임서하',
    department: '인공지능과',
    cohort: '10기',
    content: '자료는 미리 공유해주실 수 있을까요?',
    createdAt: '9시간 전',
  },
  {
    author: '김민준',
    department: '스마트IoT과',
    cohort: '9기',
    content: '지난번 연사도 정말 좋았어요. 이번에도 기대할게요!',
    createdAt: '12시간 전',
  },
  {
    author: '정하윤',
    department: '스마트IoT과',
    cohort: '10기',
    content: '석식 끝나고 바로 가면 늦지 않을까요?',
    createdAt: '1일 전',
  },
  {
    author: '최서준',
    department: '소프트웨어개발과',
    cohort: '10기',
    content: '장소가 어디인지 다시 알려주실 수 있나요?',
    createdAt: '1일 전',
  },
];

const STUDY_DESCRIPTIONS: Record<string, string> = {
  '7': 'Git 브랜치 전략부터 PR 리뷰 문화까지, 팀 프로젝트에서 바로 써먹을 수 있는 프론트엔드 협업 방식을 다룹니다.\n실습 위주로 진행되며, 발표 후 Q&A 시간을 가집니다.\n\n연사 대상 : 1~2학년 (1학년 20명, 2학년 10명, 최대 총 30명)\n1학년은 석식 시간 7시 10분부터 선착순으로 신청해주길 바랍니다.',
};

const DEFAULT_DESCRIPTION =
  '이번 릴레이 스터디에서 다룰 내용을 간단하게 정리했습니다.\n처음 접하는 분들도 따라올 수 있도록 기초부터 차근차근 진행하고, 마지막에는 Q&A 시간을 가집니다.\n\n연사 대상 : 전 학년\n노트북을 챙겨오시면 실습을 함께 진행할 수 있어요.';

function buildParticipants(count: number): StudyParticipant[] {
  return Array.from({ length: count }, (_, index) => ({
    id: String(index + 1),
    name: PARTICIPANT_NAMES[index % PARTICIPANT_NAMES.length],
    department: index % 3 === 0 ? '소프트웨어개발과' : index % 3 === 1 ? '스마트IoT과' : '인공지능과',
    cohort: index % 2 === 0 ? '10기' : '9기',
  }));
}

function buildComments(count: number): StudyComment[] {
  return Array.from({ length: count }, (_, index) => ({
    ...COMMENT_POOL[index % COMMENT_POOL.length],
    id: String(index + 1),
  }));
}

function buildStudyDetail(study: Study): StudyDetail {
  const presenter = study.presenters[0];
  const [studentId, name] = presenter.split(' ');
  const profile = PRESENTER_PROFILES[presenter] ?? mockProfile;

  return {
    ...study,
    description: STUDY_DESCRIPTIONS[study.id] ?? DEFAULT_DESCRIPTION,
    author: {
      studentId,
      name,
      department: profile.department,
      cohort: profile.cohort,
    },
    participants: buildParticipants(study.participantCount),
    comments: buildComments(study.commentCount),
    isApplied: false,
  };
}

export const mockStudyDetails: Record<string, StudyDetail> = Object.fromEntries(
  mockStudies.map((study) => [study.id, buildStudyDetail(study)])
);

/** 등록 API 목업 응답 — 홈 카드에 바로 얹을 수 있는 형태로 만들어요. */
export function createMockStudy(payload: CreateStudyPayload, id: string): Study {
  const [date, time] = payload.scheduledAt.split('T');
  const [, month, day] = date.split('-').map(Number);

  return {
    id,
    title: payload.title,
    status: '개설미정',
    presenters: [payload.presenter],
    scheduledAt: `${month}/${day} ${time}`,
    createdAt: date.slice(5),
    participantCount: 0,
    capacity: payload.capacity,
    commentCount: 0,
  };
}
