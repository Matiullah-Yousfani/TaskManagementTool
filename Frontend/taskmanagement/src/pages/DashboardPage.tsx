import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardCounts } from '../api/dashboard';
import { ApiClientError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTaskHub } from '../hooks/useTaskHub';
import { Alert, PageHeader } from '../components/Ui';
import type { DashboardCounts } from '../types';

export function DashboardPage() {
  const { isAdmin } = useAuth();
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    getDashboardCounts()
      .then(setCounts)
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load dashboard'),
      );
  };

  useEffect(() => {
    load();
  }, []);

  useTaskHub(load);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={
          isAdmin
            ? 'All tasks across every employee (admin view)'
            : 'Tasks assigned to you'
        }
        action={isAdmin ? { label: 'New task', to: '/tasks/new' } : undefined}
      />
      {error && <Alert message={error} />}
      <div className="stats-grid">
        <Link to="/tasks?status=Pending" className="stat-card stat-pending">
          <span className="stat-label">Pending</span>
          <span className="stat-value">{counts?.pending ?? '—'}</span>
        </Link>
        <Link to="/tasks?status=InProgress" className="stat-card stat-progress">
          <span className="stat-label">In progress</span>
          <span className="stat-value">{counts?.inProgress ?? '—'}</span>
        </Link>
        <Link to="/tasks?status=Completed" className="stat-card stat-completed">
          <span className="stat-label">Completed</span>
          <span className="stat-value">{counts?.completed ?? '—'}</span>
        </Link>
      </div>
    </div>
  );
}
