import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { deleteTask, getTask, updateTaskStatus } from '../api/tasks';
import { ApiClientError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTaskHub } from '../hooks/useTaskHub';
import {
  Alert,
  GlassPanel,
  PageHeader,
  PriorityBadge,
  Spinner,
  StatusBadge,
} from '../components/ui/GlassPanel';
import { FormSelect } from '../components/ui/FormControls';
import type { TaskItem, TaskItemStatus } from '../types';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, profile } = useAuth();
  const [task, setTask] = useState<TaskItem | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState<TaskItemStatus>('Pending');
  const [saving, setSaving] = useState(false);

  const load = () => {
    if (!id) return;
    getTask(id)
      .then((t) => {
        setTask(t);
        setStatus(t.status);
      })
      .catch((err) => setError(err instanceof ApiClientError ? err.message : 'Failed to load'));
  };

  useEffect(() => load(), [id]);
  useTaskHub(load);

  const canUpdateStatus = task && (isAdmin || profile?.id === task.assignedToUserId);

  const submitStatus = async () => {
    if (!id || !task) return;
    setSaving(true);
    try {
      const updated = await updateTaskStatus(id, status);
      setTask(updated);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Delete this task?')) return;
    try {
      await deleteTask(id);
      navigate('/tasks');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Delete failed');
    }
  };

  if (!task && !error) {
    return <div className="flex h-64 items-center justify-center"><Spinner className="h-10 w-10" /></div>;
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="Task details" />
      {error && <Alert message={error} />}
      {task && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <GlassPanel strong className="p-8">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <h2 className="text-2xl font-bold text-white">{task.title}</h2>
              <div className="flex gap-2">
                <StatusBadge status={task.status === 'InProgress' ? 'In progress' : task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
            </div>
            <p className="mb-8 whitespace-pre-wrap text-slate-300">{task.description || 'No description'}</p>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Category', task.categoryName ?? '—'],
                ['Due', task.dueDate ? new Date(task.dueDate).toLocaleString() : '—'],
                ['Created by', task.createdByUserName ?? '—'],
                ['Assigned to', task.assignedToUserName ?? '—'],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl bg-white/5 p-3">
                  <dt className="text-xs uppercase tracking-wide text-slate-500">{k}</dt>
                  <dd className="mt-1 font-medium text-white">{v}</dd>
                </div>
              ))}
            </dl>

            {canUpdateStatus && (
              <GlassPanel className="mt-8 p-4">
                <p className="mb-3 text-sm font-medium text-slate-300">Update status</p>
                <div className="flex flex-wrap gap-3">
                  <FormSelect
                    className="w-auto min-w-[180px]"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as TaskItemStatus)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="InProgress">In progress</option>
                    <option value="Completed">Completed</option>
                  </FormSelect>
                  <button type="button" className="btn-primary" disabled={saving || status === task.status} onClick={submitStatus}>
                    {saving ? 'Saving…' : 'Submit'}
                  </button>
                </div>
              </GlassPanel>
            )}

            <div className="mt-8 flex flex-wrap gap-3">
              {isAdmin && (
                <>
                  <Link to={`/tasks/${task.id}/edit`} className="btn-primary">Edit</Link>
                  <button type="button" className="btn-danger" onClick={handleDelete}>Delete</button>
                </>
              )}
              <Link to="/tasks" className="btn-ghost">Back to board</Link>
            </div>
          </GlassPanel>
        </motion.div>
      )}
    </div>
  );
}
