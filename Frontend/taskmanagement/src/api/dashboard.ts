import { apiRequest } from './client';
import type { DashboardCounts } from '../types';

export function getDashboardCounts() {
  return apiRequest<DashboardCounts>('/dashboard/task-counts');
}
