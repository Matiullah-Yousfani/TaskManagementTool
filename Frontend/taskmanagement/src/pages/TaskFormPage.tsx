import { type FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserCheck, Users } from 'lucide-react';
import { getCategories } from '../api/categories';
import { createTask, getTask, updateTask } from '../api/tasks';
import { getAllUsers } from '../api/users';
import { ApiClientError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  FormField,
  FormInput,
  FormSection,
  FormSelect,
  FormTextarea,
  ReadOnlyField,
} from '../components/ui/FormControls';
import { Alert, GlassPanel, PageHeader, Spinner } from '../components/ui/GlassPanel';
import type { Category, TaskItemStatus, TaskPriority, UserSummary } from '../types';

export function TaskFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const { isAdmin, profile } = useAuth();

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: 'Pending' as TaskItemStatus,
    priority: 'Medium' as TaskPriority,
    dueDate: '',
    categoryId: '',
    assignedToUserId: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isEdit && !isAdmin) {
      navigate('/tasks', { replace: true });
      return;
    }

    const load = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
        if (isAdmin) {
          const u = await getAllUsers();
          setUsers(u);
        }
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
        }
      } catch (err) {
        setError(err instanceof ApiClientError ? err.message : 'Failed to load');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [id, isEdit, isAdmin, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (isAdmin && !form.assignedToUserId) {
      setError('Please select a user to assign this task to.');
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      status: form.status,
      priority: form.priority,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
      categoryId: form.categoryId || null,
      assignedToUserId: isAdmin ? form.assignedToUserId : undefined,
    };
    try {
      if (isEdit && id) {
        await updateTask(id, { ...payload, assignedToUserId: form.assignedToUserId });
        navigate(`/tasks/${id}`);
      } else {
        const created = await createTask(payload as Parameters<typeof createTask>[0]);
        navigate(`/tasks/${created.id}`);
      }
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Save failed');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={isEdit ? 'Edit task' : 'Create task'}
        subtitle={
          isAdmin
            ? 'Assign work to any team member'
            : 'New tasks are automatically assigned to you'
        }
      />
      {error && <Alert message={error} />}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <GlassPanel className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection title="Task details" description="Title and description for the work item">
              <FormField label="Title" required>
                <FormInput
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="What needs to be done?"
                  required
                />
              </FormField>
              <FormField label="Description">
                <FormTextarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Add context, acceptance criteria, links…"
                />
              </FormField>
            </FormSection>

            <FormSection title="Scheduling" description="Priority, due date, and category">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <FormField label="Priority">
                  <FormSelect
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </FormSelect>
                </FormField>
                <FormField label="Due date">
                  <FormInput
                    type="datetime-local"
                    value={form.dueDate}
                    onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  />
                </FormField>
              </div>
              <FormField label="Category">
                <FormSelect
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  <option value="">None</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </FormSelect>
              </FormField>
            </FormSection>

            <FormSection
              title="Assignment"
              description={
                isAdmin
                  ? 'Choose who will work on this task'
                  : 'You can only create tasks assigned to yourself'
              }
            >
              {isAdmin ? (
                <>
                  <FormField label="Assign to" required hint="Admins can assign tasks to any user">
                    <FormSelect
                      required
                      value={form.assignedToUserId}
                      onChange={(e) => setForm({ ...form, assignedToUserId: e.target.value })}
                    >
                      <option value="">Select team member…</option>
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.userName} ({u.email})
                        </option>
                      ))}
                    </FormSelect>
                  </FormField>
                  {users.length === 0 && (
                    <Alert message="No users found. Register team members first." />
                  )}
                  {isEdit && (
                    <FormField label="Status">
                      <FormSelect
                        value={form.status}
                        onChange={(e) =>
                          setForm({ ...form, status: e.target.value as TaskItemStatus })
                        }
                      >
                        <option value="Pending">Pending</option>
                        <option value="InProgress">In progress</option>
                        <option value="Completed">Completed</option>
                      </FormSelect>
                    </FormField>
                  )}
                </>
              ) : (
                <ReadOnlyField
                  label="Assigned to"
                  value={`${profile?.userName ?? 'You'} (automatic)`}
                />
              )}
            </FormSection>

            <div className="flex flex-wrap gap-3 border-t border-white/10 pt-6">
              <button type="submit" className="btn-primary" disabled={saving}>
                {saving ? 'Saving…' : isEdit ? 'Update task' : 'Create task'}
              </button>
              <Link to="/tasks" className="btn-ghost">
                Cancel
              </Link>
            </div>
          </form>
        </GlassPanel>

        {!isAdmin && !isEdit && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-brand-500/20 bg-brand-500/10 p-4 text-sm text-brand-200">
            <UserCheck className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Regular users can create tasks for themselves only. An admin can assign tasks to anyone.</p>
          </div>
        )}
        {isAdmin && !isEdit && (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-4 text-sm text-cyan-100">
            <Users className="mt-0.5 h-4 w-4 shrink-0" />
            <p>As admin, pick any user from the assignee list. They will see this task on their board.</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
