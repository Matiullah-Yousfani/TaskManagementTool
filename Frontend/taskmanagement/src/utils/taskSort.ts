import type { TaskItem, TaskItemStatus, TaskPriority } from '../types';

/** Lower number = shown first (top of list / column). */
export const PRIORITY_RANK: Record<TaskPriority, number> = {
  High: 0,
  Medium: 1,
  Low: 2,
};

export function sortTasksByPriority(tasks: TaskItem[]): TaskItem[] {
  return [...tasks].sort(
    (a, b) =>
      PRIORITY_RANK[a.priority] - PRIORITY_RANK[b.priority] ||
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export function groupAndSortByStatus(
  tasks: TaskItem[],
): Record<TaskItemStatus, TaskItem[]> {
  const g: Record<TaskItemStatus, TaskItem[]> = {
    Pending: [],
    InProgress: [],
    Completed: [],
  };
  for (const t of tasks) g[t.status].push(t);
  for (const status of Object.keys(g) as TaskItemStatus[]) {
    g[status] = sortTasksByPriority(g[status]);
  }
  return g;
}
