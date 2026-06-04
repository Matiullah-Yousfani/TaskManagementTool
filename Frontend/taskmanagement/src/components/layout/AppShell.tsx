import { NavLink, Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Kanban,
  List,
  FolderKanban,
  User,
  Users,
  LogOut,
  Plus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/tasks', icon: Kanban, label: 'Kanban' },
  { to: '/tasks/list', icon: List, label: 'List view' },
];

export function AppShell() {
  const { profile, isAdmin, logout } = useAuth();

  return (
    <div className="mesh-bg flex min-h-screen flex-col lg:flex-row">
      <motion.aside
        initial={{ x: -24, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="glass-strong z-40 flex w-full shrink-0 flex-col border-b border-white/10 p-4 lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:w-64 lg:border-b-0 lg:border-r lg:p-5"
      >
        <div className="mb-8 flex items-center gap-3 px-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-500 to-cyan-400 text-lg font-bold text-white shadow-lg shadow-indigo-500/30">
            T
          </div>
          <div>
            <p className="font-bold text-white">TaskFlow</p>
            <p className="text-xs text-slate-500">Management</p>
          </div>
        </div>

        <NavLink to="/tasks/new" className="btn-primary mb-6 w-full text-center">
          <Plus className="h-4 w-4" />
          New task
        </NavLink>

        <nav className="flex flex-1 flex-col gap-1">
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/tasks'}
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <FolderKanban className="h-4 w-4" />
            Categories
          </NavLink>
          {isAdmin && (
            <NavLink
              to="/admin/users"
              className={({ isActive }) =>
                `nav-link ${isActive ? 'nav-link-active' : ''}`
              }
            >
              <Users className="h-4 w-4" />
              Users
            </NavLink>
          )}
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `nav-link ${isActive ? 'nav-link-active' : ''}`
            }
          >
            <User className="h-4 w-4" />
            Profile
          </NavLink>
        </nav>

        <div className="mt-auto border-t border-white/10 pt-4">
          <div className="mb-3 px-2">
            <p className="truncate text-sm font-medium text-white">{profile?.userName}</p>
            <p className="truncate text-xs text-slate-500">{profile?.roles.join(', ')}</p>
          </div>
          <button type="button" onClick={logout} className="btn-ghost w-full">
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      </motion.aside>

      <main className="min-h-screen flex-1 p-4 lg:ml-64 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}
