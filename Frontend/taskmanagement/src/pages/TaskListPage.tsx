import { type FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Download, Plus, Search, Upload, User } from 'lucide-react';
import { getCategories } from '../api/categories';
import { exportTasks, getTasks, importTasks } from '../api/tasks';
import { ApiClientError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTaskHub } from '../hooks/useTaskHub';
import { FormSelect } from '../components/ui/FormControls';
import {
  Alert,
  GlassPanel,
  PageHeader,
  PriorityBadge,
  Spinner,
  StatusBadge,
} from '../components/ui/GlassPanel';
import { sortTasksByPriority } from '../utils/taskSort';
import type { Category, TaskExportRow, TaskItem, TaskItemStatus, TaskPriority } from '../types';

function listRowClass(task: TaskItem): string {
  const base =
    'block rounded-xl border p-5 transition hover:border-brand-500/40 hover:bg-white/[0.08]';
  if (task.priority === 'High') {
    return `${base} list-row--high border-l-4 border-l-rose-500 bg-gradient-to-r from-rose-950/70 via-slate-900/80 to-slate-900 ring-1 ring-rose-500/30`;
  }
  if (task.priority === 'Medium') {
    return `${base} list-row--medium border-l-4 border-l-amber-500/80 border-white/10`;
  }
  return `${base} glass border-white/10`;
}

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
      setTasks(sortTasksByPriority(result.items));
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

  const handleExport = async () => {
    try {
      const rows = await exportTasks();
      const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tasks-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Export failed');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const rows = JSON.parse(await file.text()) as TaskExportRow[];
      const result = await importTasks(rows);
      setSuccess(`Imported ${result.imported}, skipped ${result.skipped}`);
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Import failed');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <PageHeader
        title="Task list"
        subtitle={`${totalCount} tasks · sorted High → Medium → Low`}
        action={
          <Link to="/tasks/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            New task
          </Link>
        }
      />
      {error && <Alert message={error} />}
      {success && <Alert message={success} type="success" />}

      <GlassPanel className="mb-6 p-5">
        <form
          onSubmit={(e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            updateFilter('search', String(fd.get('search') ?? ''));
          }}
          className="mb-4 flex flex-wrap gap-3"
        >
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              name="search"
              defaultValue={search}
              placeholder="Search title…"
              className="glass-input pl-10"
            />
          </div>
          <button type="submit" className="btn-primary">
            Search
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <FormSelect
            className="filter-select"
            value={status ?? ''}
            onChange={(e) => updateFilter('status', e.target.value)}
          >
            <option value="">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="InProgress">In progress</option>
            <option value="Completed">Completed</option>
          </FormSelect>
          <FormSelect
            className="filter-select"
            value={priority ?? ''}
            onChange={(e) => updateFilter('priority', e.target.value)}
          >
            <option value="">All priorities</option>
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </FormSelect>
          <FormSelect
            className="filter-select"
            value={categoryId ?? ''}
            onChange={(e) => updateFilter('categoryId', e.target.value)}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </FormSelect>
          <button type="button" className="btn-ghost" onClick={handleExport}>
            <Download className="h-4 w-4" /> Export
          </button>
          {isAdmin && (
            <>
              <input ref={fileInputRef} type="file" accept=".json" hidden onChange={handleImport} />
              <button type="button" className="btn-ghost" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" /> Import
              </button>
            </>
          )}
        </div>
      </GlassPanel>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner />
        </div>
      ) : tasks.length === 0 ? (
        <GlassPanel className="flex flex-col items-center justify-center p-12 text-center">
          <p className="text-lg font-medium text-white">No tasks found</p>
          <p className="mt-2 max-w-sm text-sm text-slate-400">
            {search || status || priority || categoryId
              ? 'Try adjusting your filters or search term.'
              : isAdmin
                ? 'Create a task and assign it to a team member.'
                : 'Create a task — it will be assigned to you automatically.'}
          </p>
          <Link to="/tasks/new" className="btn-primary mt-6">
            <Plus className="h-4 w-4" />
            Create task
          </Link>
        </GlassPanel>
      ) : (
        <div className="space-y-3">
          {tasks.map((task, i) => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <Link to={`/tasks/${task.id}`} className={listRowClass(task)}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3
                      className={`truncate font-semibold ${
                        task.priority === 'High' ? 'text-rose-50' : 'text-white'
                      }`}
                    >
                      {task.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm text-slate-400">
                      {task.description || 'No description'}
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </span>
                      )}
                      {task.categoryName && (
                        <span className="rounded-md bg-white/5 px-2 py-0.5 text-slate-400">
                          {task.categoryName}
                        </span>
                      )}
                      {isAdmin && task.assignedToUserName && (
                        <span className="flex items-center gap-1 text-indigo-300/90">
                          <User className="h-3 w-3" />
                          {task.assignedToUserName}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-2">
                    <StatusBadge status={task.status === 'InProgress' ? 'In progress' : task.status} />
                    <PriorityBadge priority={task.priority} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-3">
          <button
            type="button"
            className="btn-ghost"
            disabled={page <= 1}
            onClick={() => {
              const n = new URLSearchParams(searchParams);
              n.set('page', String(page - 1));
              setSearchParams(n);
            }}
          >
            Previous
          </button>
          <span className="flex items-center text-sm text-slate-400">
            Page {page} / {totalPages}
          </span>
          <button
            type="button"
            className="btn-ghost"
            disabled={page >= totalPages}
            onClick={() => {
              const n = new URLSearchParams(searchParams);
              n.set('page', String(page + 1));
              setSearchParams(n);
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
