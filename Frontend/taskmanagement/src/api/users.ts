import { apiRequest } from './client';
import type { UserProfile, UserSummary } from '../types';

export function getCurrentUser() {
  return apiRequest<UserProfile>('/users/me');
}

export function getAllUsers() {
  return apiRequest<UserSummary[]>('/users');
}
