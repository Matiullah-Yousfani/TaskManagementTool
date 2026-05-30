import { apiRequest, setToken } from './client';
import type { AuthResponse } from '../types';

export async function register(payload: {
  username: string;
  email: string;
  password: string;
}) {
  return apiRequest<{ message: string }>('/UserAuth/Register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function login(payload: { email: string; password: string }) {
  const data = await apiRequest<AuthResponse>('/UserAuth/Login', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  setToken(data.token);
  localStorage.setItem('authUser', JSON.stringify(data));
  return data;
}

export function logout() {
  setToken(null);
  localStorage.removeItem('authUser');
}

export function getStoredAuth(): AuthResponse | null {
  const raw = localStorage.getItem('authUser');
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthResponse;
  } catch {
    return null;
  }
}
