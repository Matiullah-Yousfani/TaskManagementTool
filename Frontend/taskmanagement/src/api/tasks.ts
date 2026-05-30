import { apiRequest } from './client';
import type {
  CreateTaskPayload,
  PagedResult,
  TaskExportRow,
  TaskImportResult,
  TaskItem,
  TaskItemStatus,
  TaskQueryParams,
  UpdateTaskPayload,
} from '../types';

function toQuery(params: TaskQueryParams) {
  const q = new URLSearchParams();
  if (params.page) q.set('page', String(params.page));
  if (params.pageSize) q.set('pageSize', String(params.pageSize));
  if (params.status) q.set('status', params.status);
  if (params.priority) q.set('priority', params.priority);
  if (params.categoryId) q.set('categoryId', params.categoryId);
  if (params.search) q.set('search', params.search);
  const s = q.toString();
  return s ? `?${s}` : '';
}

export function getTasks(params: TaskQueryParams = {}) {
  return apiRequest<PagedResult<TaskItem>>(`/tasks${toQuery(params)}`);
}

export function getMyTasks() {
  return apiRequest<TaskItem[]>('/tasks/my-tasks');
}

export function getTask(id: string) {
  return apiRequest<TaskItem>(`/tasks/${id}`);
}

export function createTask(payload: CreateTaskPayload) {
  return apiRequest<TaskItem>('/tasks', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateTask(id: string, payload: UpdateTaskPayload) {
  return apiRequest<TaskItem>(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function updateTaskStatus(id: string, status: TaskItemStatus) {
  return apiRequest<TaskItem>(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function deleteTask(id: string) {
  return apiRequest<void>(`/tasks/${id}`, { method: 'DELETE' });
}

export function exportTasks() {
  return apiRequest<TaskExportRow[]>('/tasks/export');
}

export function importTasks(tasks: TaskExportRow[]) {
  return apiRequest<TaskImportResult>('/tasks/import', {
    method: 'POST',
    body: JSON.stringify({ tasks }),
  });
}
