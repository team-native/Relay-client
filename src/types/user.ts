import type { StudyStatus } from './study';

export interface UserProfile {
  name: string;
  email: string;
  department: string;
  cohort: string;
  enrolledLectures: EnrolledCourse[];
}

export interface EnrolledCourse {
  id: string;
  title: string;
  status: StudyStatus;
  scheduledAt: string;
}