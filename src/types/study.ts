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
