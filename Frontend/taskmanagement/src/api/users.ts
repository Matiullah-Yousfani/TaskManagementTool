import { apiRequest } from './client';
import type { UserAdmin, UserProfile, UserSummary } from '../types';

export function getCurrentUser() {
  return apiRequest<UserProfile>('/users/me');
}

export function updateCurrentUserProfile(payload: {
  userName: string;
  email: string;
  phoneNumber?: string;
}) {
  return apiRequest<UserProfile>('/users/me', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function getAllUsers() {
  return apiRequest<UserSummary[]>('/users');
}

export function getUsersForManagement() {
  return apiRequest<UserAdmin[]>('/users/manage');
}

export function updateManagedUser(
  id: string,
  payload: { email: string; role: 'Admin' | 'User' },
) {
  return apiRequest<UserAdmin>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
