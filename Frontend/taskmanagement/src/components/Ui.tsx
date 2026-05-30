import { Link } from 'react-router-dom';

interface Props {
  title: string;
  subtitle?: string;
  action?: { label: string; to: string };
}

export function PageHeader({ title, subtitle, action }: Props) {
  return (
    <div className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p className="muted">{subtitle}</p>}
      </div>
      {action && (
        <Link to={action.to} className="btn btn-primary">
          {action.label}
        </Link>
      )}
    </div>
  );
}

export function Alert({ message, type = 'error' }: { message: string; type?: 'error' | 'success' }) {
  return <div className={`alert alert-${type}`}>{message}</div>;
}

export function StatusBadge({ status }: { status: string }) {
  const cls = status.toLowerCase().replace(/\s/g, '');
  return <span className={`badge badge-${cls}`}>{status}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const cls = priority.toLowerCase();
  return <span className={`badge badge-priority-${cls}`}>{priority}</span>;
}
