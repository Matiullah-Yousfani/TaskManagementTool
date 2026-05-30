import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/Ui';

export function ProfilePage() {
  const { profile, logout } = useAuth();

  if (!profile) {
    return (
      <div className="page-center">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Profile" subtitle="Your account details" />
      <div className="card detail-card">
        <dl className="detail-grid">
          <div>
            <dt>Username</dt>
            <dd>{profile.userName}</dd>
          </div>
          <div>
            <dt>Email</dt>
            <dd>{profile.email ?? '—'}</dd>
          </div>
          <div>
            <dt>Roles</dt>
            <dd>{profile.roles.join(', ') || 'User'}</dd>
          </div>
          <div>
            <dt>Email confirmed</dt>
            <dd>{profile.emailConfirmed ? 'Yes' : 'No'}</dd>
          </div>
          <div>
            <dt>Member since</dt>
            <dd>{new Date(profile.createdAt).toLocaleDateString()}</dd>
          </div>
          <div>
            <dt>User ID</dt>
            <dd className="mono small">{profile.id}</dd>
          </div>
        </dl>
        <div className="detail-actions">
          <button type="button" className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
