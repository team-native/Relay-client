export interface UserProfile {
  name: string;
  email: string;
  department: string;
  cohort: string;
}

export interface EnrolledCourse {
  id: string;
  title: string;
  status: '개설미정' | '개설확정' | '종료';
  scheduledAt: string;
}