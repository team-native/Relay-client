import { apiClient } from './client';
import type { Study } from '../types/study';
import { mockStudies } from '../mocks/data';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export async function getStudies(): Promise<Study[]> {
  if (USE_MOCK) return mockStudies;

  const res = await apiClient.get<Study[]>('/studies');
  return res.data;
}
