import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getCategories } from '../api/categories';
import { createTask, getTask, updateTask } from '../api/tasks';
import { getAllUsers } from '../api/users';
import { ApiClientError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Alert, PageHeader } from '../components/Ui';
import type { Category, TaskItemStatus, TaskPriority, UserSummary } from '../types';

const emptyForm = {
  title: '',
  description: '',
  status: 'Pending' as TaskItemStatus,
  priority: 'Medium' as TaskPriority,
  dueDate: '',
  categoryId: '',
  assignedToUserId: '',
};

export function TaskFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [form, setForm] = useState(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/tasks', { replace: true });
      return;
    }

    const load = async () => {
      try {
        const [cats, u] = await Promise.all([getCategories(), getAllUsers()]);
        setCategories(cats);
        setUsers(u);
        if (id) {
          const task = await getTask(id);
          setForm({
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            dueDate: task.dueDate ? task.dueDate.slice(0, 16) : '',
            categoryId: task.categoryId ?? '',
            assignedToUserId: task.assignedToUserId,
          });
        } else if (u.length > 0) {
          const firstEmployee = u.find((x) => x.email) ?? u[0];
          setForm((f) => ({ ...f, assignedToUserId: firstEmployee.id }));
        }
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Failed to load form data');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, isEdit, isAdmin, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!form.assignedToUserId) {
      setError('Please select an employee to assign this task to.');
      return;
    }
    setError('');
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      categoryId: form.categoryId || null,
      assignedToUserId: form.assignedToUserId,
    };
    try {
      if (isEdit && id) {
        await updateTask(id, payload);
        navigate(`/tasks/${id}`);
      } else {
        const created = await createTask(payload);
        navigate(`/tasks/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Save failed');
      setSaving(false);
    }
  };

  if (!isAdmin || loading) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit task (admin)' : 'Create & assign task (admin)'} />
      {error && <Alert message={error} />}
      <form onSubmit={handleSubmit} className="card form-card">
        <label>
          Title *
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required maxLength={256} />
        </label>
        <label>
          Description
          <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={4} maxLength={4000} />
        </label>
        <div className="form-row">
          <label>
            Status
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TaskItemStatus })}>
              <option value="Pending">Pending</option>
              <option value="InProgress">In progress</option>
              <option value="Completed">Completed</option>
            </select>
          </label>
          <label>
            Priority *
            <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </label>
        </div>
        <div className="form-row">
          <label>
            Due date
            <input type="datetime-local" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
          </label>
          <label>
            Category
            <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              <option value="">None</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Assign to employee *
          <select
            value={form.assignedToUserId}
            onChange={(e) => setForm({ ...form, assignedToUserId: e.target.value })}
            required
          >
            <option value="">Select employee…</option>
            {users.map((u) => (
              <option key={u.id} value={u.id}>{u.userName} ({u.email})</option>
            ))}
          </select>
        </label>
        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : isEdit ? 'Update task' : 'Create & assign'}
          </button>
          <Link to={isEdit && id ? `/tasks/${id}` : '/tasks'} className="btn btn-secondary">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
