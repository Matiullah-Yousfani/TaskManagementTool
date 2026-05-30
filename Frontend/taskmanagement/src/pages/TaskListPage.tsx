import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { getCategories } from '../api/categories';
import { exportTasks, getTasks, importTasks } from '../api/tasks';
import { ApiClientError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTaskHub } from '../hooks/useTaskHub';
import { Alert, PageHeader, PriorityBadge, StatusBadge } from '../components/Ui';
import type { Category, TaskExportRow, TaskItem, TaskItemStatus, TaskPriority } from '../types';

export function TaskListPage() {
  const { isAdmin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const page = Number(searchParams.get('page') ?? '1');
  const status = (searchParams.get('status') as TaskItemStatus | null) ?? undefined;
  const priority = (searchParams.get('priority') as TaskPriority | null) ?? undefined;
  const categoryId = searchParams.get('categoryId') ?? undefined;
  const search = searchParams.get('search') ?? '';

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const [result, cats] = await Promise.all([
        getTasks({ page, pageSize: 10, status, priority, categoryId, search: search || undefined }),
        getCategories(),
      ]);
      setTasks(result.items);
      setTotalCount(result.totalCount);
      setTotalPages(result.totalPages);
      setCategories(cats);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [page, status, priority, categoryId, search]);

  useTaskHub(() => void load());

  const updateFilter = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.set('page', '1');
    setSearchParams(next);
  };

  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    updateFilter('search', String(fd.get('search') ?? ''));
  };

  const handleExport = async () => {
    setError('');
    try {
      const rows = await exportTasks();
      const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Export failed');
    }
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError('');
    setSuccess('');
    try {
      const text = await file.text();
      const rows = JSON.parse(text) as TaskExportRow[];
      const result = await importTasks(rows);
      setSuccess(`Imported ${result.imported} task(s). Skipped ${result.skipped}.`);
      if (result.errors.length) setError(result.errors.slice(0, 3).join(' '));
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Import failed — use exported JSON format');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <PageHeader
        title={isAdmin ? 'All tasks' : 'My assigned tasks'}
        subtitle={`${totalCount} task${totalCount === 1 ? '' : 's'} found`}
        action={isAdmin ? { label: 'New task', to: '/tasks/new' } : undefined}
      />
      {error && <Alert message={error} />}
      {success && <Alert message={success} type="success" />}

      <div className="filters card">
        <form onSubmit={handleSearch} className="filter-row">
          <input
            name="search"
            defaultValue={search}
            placeholder="Search by title…"
            className="grow"
          />
          <button type="submit" className="btn btn-secondary">
            Search
          </button>
        </form>
        <div className="filter-row">
          <select value={status ?? ''} onChange={(e) => updateFilter('status', e.target.value)}>
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="InProgress">In progress</option>
            <option value="Completed">Completed</option>
          </select>
          <select value={priority ?? ''} onChange={(e) => updateFilter('priority', e.target.value)}>
            <option value="">All priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <select value={categoryId ?? ''} onChange={(e) => updateFilter('categoryId', e.target.value)}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <button type="button" className="btn btn-secondary" onClick={handleExport}>
            Export JSON
          </button>
          {isAdmin && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                hidden
                onChange={handleImportFile}
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Import JSON
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div className="page-center"><div className="spinner" /></div>
      ) : tasks.length === 0 ? (
        <div className="empty-state card">
          <p>No tasks match your filters.</p>
          {isAdmin && <Link to="/tasks/new" className="btn btn-primary">Create a task</Link>}
        </div>
      ) : (
        <div className="task-list">
          {tasks.map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`} className="task-row card">
              <div className="task-row-main">
                <h3>{task.title}</h3>
                <p className="muted truncate">{task.description || 'No description'}</p>
              </div>
              <div className="task-row-meta">
                <StatusBadge status={task.status === 'InProgress' ? 'In progress' : task.status} />
                <PriorityBadge priority={task.priority} />
                {task.categoryName && <span className="chip">{task.categoryName}</span>}
                {!isAdmin && task.assignedToUserName && (
                  <span className="muted small">Assigned to you</span>
                )}
                {isAdmin && task.assignedToUserName && (
                  <span className="chip">{task.assignedToUserName}</span>
                )}
                {task.dueDate && (
                  <span className="muted small">Due {new Date(task.dueDate).toLocaleDateString()}</span>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="pagination">
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page <= 1}
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.set('page', String(page - 1));
              setSearchParams(next);
            }}
          >
            Previous
          </button>
          <span className="muted">Page {page} of {totalPages}</span>
          <button
            type="button"
            className="btn btn-secondary"
            disabled={page >= totalPages}
            onClick={() => {
              const next = new URLSearchParams(searchParams);
              next.set('page', String(page + 1));
              setSearchParams(next);
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
