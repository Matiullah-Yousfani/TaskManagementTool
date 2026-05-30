import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { deleteTask, getTask, updateTaskStatus } from '../api/tasks';
import { ApiClientError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTaskHub } from '../hooks/useTaskHub';
import { Alert, PageHeader, PriorityBadge, StatusBadge } from '../components/Ui';
import type { TaskItem, TaskItemStatus } from '../types';

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, profile } = useAuth();
  const [task, setTask] = useState<TaskItem | null>(null);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [status, setStatus] = useState<TaskItemStatus>('Pending');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = () => {
    if (!id) return;
    getTask(id)
      .then((t) => {
        setTask(t);
        setStatus(t.status);
      })
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load task'),
      );
  };

  useEffect(() => {
    load();
  }, [id]);

  useTaskHub(load);

  const canUpdateStatus =
    task &&
    (isAdmin || profile?.id === task.assignedToUserId);

  const handleStatusSubmit = async () => {
    if (!id || !task) return;
    setUpdatingStatus(true);
    setError('');
    try {
      const updated = await updateTaskStatus(id, status);
      setTask(updated);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Status update failed');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Delete this task?')) return;
    setDeleting(true);
    try {
      await deleteTask(id);
      navigate('/tasks');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Delete failed');
      setDeleting(false);
    }
  };

  if (!task && !error) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Task detail" />
      {error && <Alert message={error} />}
      {task && (
        <div className="card detail-card">
          <div className="detail-header">
            <h2>{task.title}</h2>
            <div className="detail-badges">
              <StatusBadge status={task.status === 'InProgress' ? 'In progress' : task.status} />
              <PriorityBadge priority={task.priority} />
            </div>
          </div>
          <p className="detail-description">{task.description || 'No description provided.'}</p>
          <dl className="detail-grid">
            <div><dt>Category</dt><dd>{task.categoryName ?? '—'}</dd></div>
            <div><dt>Due date</dt><dd>{task.dueDate ? new Date(task.dueDate).toLocaleString() : '—'}</dd></div>
            <div><dt>Created by</dt><dd>{task.createdByUserName ?? task.createdByUserId}</dd></div>
            <div><dt>Assigned to</dt><dd>{task.assignedToUserName ?? task.assignedToUserId}</dd></div>
            <div><dt>Created</dt><dd>{new Date(task.createdAt).toLocaleString()}</dd></div>
            <div><dt>Updated</dt><dd>{new Date(task.updatedAt).toLocaleString()}</dd></div>
          </dl>

          {canUpdateStatus && (
            <div className="status-update card">
              <h3>Update status</h3>
              <p className="muted small">
                {isAdmin
                  ? 'Change task status (employees are notified in real time).'
                  : 'Update your progress and mark the task complete when done.'}
              </p>
              <div className="filter-row">
                <select value={status} onChange={(e) => setStatus(e.target.value as TaskItemStatus)}>
                  <option value="Pending">Pending</option>
                  <option value="InProgress">In progress</option>
                  <option value="Completed">Completed</option>
                </select>
                <button
                  type="button"
                  className="btn btn-primary"
                  disabled={updatingStatus || status === task.status}
                  onClick={handleStatusSubmit}
                >
                  {updatingStatus ? 'Saving…' : 'Submit status'}
                </button>
              </div>
            </div>
          )}

          <div className="detail-actions">
            {isAdmin && (
              <>
                <Link to={`/tasks/${task.id}/edit`} className="btn btn-primary">Edit task</Link>
                <button type="button" className="btn btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </>
            )}
            <Link to="/tasks" className="btn btn-secondary">Back to list</Link>
          </div>
        </div>
      )}
    </div>
  );
}
