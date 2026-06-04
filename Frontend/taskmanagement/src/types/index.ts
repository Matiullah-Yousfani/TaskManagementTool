export type TaskItemStatus = 'Pending' | 'InProgress' | 'Completed';
export type TaskPriority = 'Low' | 'Medium' | 'High';

export interface AuthResponse {
  token: string;
  userId: string;
  userName: string;
  email: string;
  roles: string[];
}

export interface UserProfile {
  id: string;
  userName: string;
  email?: string;
  phoneNumber?: string;
  emailConfirmed: boolean;
  createdAt: string;
  roles: string[];
}

export interface UserSummary {
  id: string;
  userName: string;
  email?: string;
}

export type AppRole = 'Admin' | 'User';

export interface UserAdmin {
  id: string;
  userName: string;
  email?: string;
  roles: string[];
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: TaskItemStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  createdByUserName?: string;
  createdByEmail?: string;
  assignedToUserId: string;
  assignedToUserName?: string;
  assignedToEmail?: string;
  categoryId?: string | null;
  categoryName?: string;
}

export interface PagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface DashboardCounts {
  pending: number;
  inProgress: number;
  completed: number;
}

export interface TaskQueryParams {
  page?: number;
  pageSize?: number;
  status?: TaskItemStatus;
  priority?: TaskPriority;
  categoryId?: string;
  search?: string;
}

export interface CreateTaskPayload {
  title: string;
  description: string;
  status: TaskItemStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  categoryId?: string | null;
  assignedToUserId?: string;
}

export interface UpdateTaskPayload extends CreateTaskPayload {}

export interface TaskExportRow {
  title: string;
  description: string;
  status: TaskItemStatus;
  priority: TaskPriority;
  dueDate?: string | null;
  categoryName?: string | null;
  assignedToEmail?: string | null;
}

export interface TaskImportResult {
  imported: number;
  skipped: number;
  errors: string[];
}

export interface ApiError {
  message: string;
  details?: string;
}
