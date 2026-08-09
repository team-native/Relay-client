export type StudyStatus = '개설미정' | '개설확정' | '종료';

export interface Study {
  id: string;
  title: string;
  status: StudyStatus;
  presenters: string[];
  scheduledAt: string;
  createdAt: string;
  participantCount: number;
  capacity: number;
  commentCount: number;
}

export interface StudyAuthor {
  studentId: string;
  name: string;
  department: string;
  cohort: string;
}

export interface StudyParticipant {
  id: string;
  name: string;
  department?: string;
  cohort?: string;
}

export interface StudyComment {
  id: string;
  author: string;
  department: string;
  cohort: string;
  content: string;
  createdAt: string;
}

export interface StudyDetail extends Study {
  description: string;
  author: StudyAuthor;
  participants: StudyParticipant[];
  comments: StudyComment[];
  isApplied: boolean;
}

export interface CreateStudyPayload {
  title: string;
  presenter: string;
  /** 서버 LocalDateTime 포맷 (예: 2026-08-03T19:00) */
  scheduledAt: string;
  capacity: number;
  description: string;
}
