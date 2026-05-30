import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Layout() {
  const { profile, isAdmin, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">✓</span>
          <span>Task Management</span>
        </div>
        <nav className="nav-links">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/tasks">Tasks</NavLink>
          {isAdmin && <NavLink to="/categories">Categories</NavLink>}
          <NavLink to="/profile">Profile</NavLink>
        </nav>
        <div className="topbar-user">
          <span>{profile?.userName}</span>
          <button type="button" className="btn btn-ghost btn-sm" onClick={logout}>
            Logout
          </button>
        </div>
      </header>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
