import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AdminRoute } from './components/AdminRoute';
import { AppShell } from './components/layout/AppShell';
import { KanbanBoard } from './components/kanban/KanbanBoard';
import { ProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import { CategoriesPage } from './pages/CategoriesPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProfilePage } from './pages/ProfilePage';
import { TaskDetailPage } from './pages/TaskDetailPage';
import { TaskFormPage } from './pages/TaskFormPage';
import { TaskListPage } from './pages/TaskListPage';
import { UserManagePage } from './pages/UserManagePage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          <Route element={<ProtectedRoute />}>
            <Route element={<AppShell />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/tasks" element={<KanbanBoard />} />
              <Route path="/tasks/list" element={<TaskListPage />} />
              <Route path="/tasks/new" element={<TaskFormPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route element={<AdminRoute />}>
                <Route path="/admin/users" element={<UserManagePage />} />
                <Route path="/tasks/:id/edit" element={<TaskFormPage />} />
              </Route>
              <Route path="/tasks/:id" element={<TaskDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
