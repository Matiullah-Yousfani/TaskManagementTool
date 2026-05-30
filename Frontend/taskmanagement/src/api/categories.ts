import { apiRequest } from './client';
import type { Category } from '../types';

export function getCategories() {
  return apiRequest<Category[]>('/categories');
}

export function createCategory(name: string) {
  return apiRequest<Category>('/categories', {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function updateCategory(id: string, name: string) {
  return apiRequest<Category>(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ name }),
  });
}

export function deleteCategory(id: string) {
  return apiRequest<void>(`/categories/${id}`, { method: 'DELETE' });
}
