import type { StudyStatus } from '../types/study';

export const STUDY_STATUSES = ['개설미정', '개설확정', '종료'] as const;

export const STATUS_BADGE_STYLES: Record<StudyStatus, string> = {
  개설미정: 'bg-white text-black border border-[#D9D9D9]',
  개설확정: 'bg-[#FFDD86] text-black border border-[#D9D9D9]',
  종료: 'bg-[#D9D9D9] text-black border border-[#BCBCBC]',
};
