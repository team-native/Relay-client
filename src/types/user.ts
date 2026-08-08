import type { StudyStatus } from './study';

export interface UserProfile {
  name: string;
  email: string;
  department: string;
  cohort: string;
}

export interface EnrolledCourse {
  id: string;
  title: string;
  status: StudyStatus;
  scheduledAt: string;
}