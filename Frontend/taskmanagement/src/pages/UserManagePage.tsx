import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Save, Shield, Users } from 'lucide-react';
import { getUsersForManagement, updateManagedUser } from '../api/users';
import { ApiClientError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { FormField, FormInput, FormSelect } from '../components/ui/FormControls';
import { Alert, GlassPanel, PageHeader, Spinner } from '../components/ui/GlassPanel';
import type { AppRole, UserAdmin } from '../types';

type EditState = Record<string, { email: string; role: AppRole }>;

function primaryRole(roles: string[]): AppRole {
  if (roles.includes('Admin')) return 'Admin';
  return 'User';
}

export function UserManagePage() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<UserAdmin[]>([]);
  const [edit, setEdit] = useState<EditState>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const list = await getUsersForManagement();
      setUsers(list);
      const next: EditState = {};
      for (const u of list) {
        next[u.id] = {
          email: u.email ?? '',
          role: primaryRole(u.roles),
        };
      }
      setEdit(next);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSave = async (userId: string) => {
    const state = edit[userId];
    if (!state) return;

    setSavingId(userId);
    setError('');
    setSuccess('');
    try {
      const updated = await updateManagedUser(userId, {
        email: state.email.trim(),
        role: state.role,
      });
      setUsers((prev) => prev.map((u) => (u.id === userId ? updated : u)));
      setEdit((prev) => ({
        ...prev,
        [userId]: { email: updated.email ?? '', role: primaryRole(updated.roles) },
      }));
      setSuccess('User updated successfully.');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Update failed');
    } finally {
      setSavingId(null);
    }
  };

  const isDirty = (user: UserAdmin) => {
    const state = edit[user.id];
    if (!state) return false;
    return (
      state.email !== (user.email ?? '') || state.role !== primaryRole(user.roles)
    );
  };

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="User management"
        subtitle="Update email addresses and roles (Admin or User)"
      />
      {error && <Alert message={error} />}
      {success && <Alert message={success} type="success" />}

      <GlassPanel className="mb-6 flex items-start gap-3 p-4 text-sm text-slate-400">
        <Shield className="mt-0.5 h-5 w-5 shrink-0 text-brand-400" />
        <p>
          Users sign in with their email. You cannot remove the last administrator.
          {profile?.id && ' Changes to your own account apply on next login.'}
        </p>
      </GlassPanel>

      {loading ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner className="h-10 w-10" />
        </div>
      ) : users.length === 0 ? (
        <GlassPanel className="p-10 text-center text-slate-400">No users found.</GlassPanel>
      ) : (
        <div className="space-y-4">
          {users.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
            >
              <GlassPanel className="p-5">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-500/20 text-brand-300">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold text-white">{user.userName}</p>
                      <p className="text-xs text-slate-500">
                        Joined {new Date(user.createdAt).toLocaleDateString()}
                        {user.id === profile?.id && (
                          <span className="ml-2 text-brand-400">(you)</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-bold uppercase ${
                      primaryRole(user.roles) === 'Admin'
                        ? 'bg-indigo-500/25 text-indigo-200'
                        : 'bg-slate-500/25 text-slate-300'
                    }`}
                  >
                    {primaryRole(user.roles)}
                  </span>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField label="Email">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <FormInput
                        type="email"
                        className="pl-10"
                        value={edit[user.id]?.email ?? ''}
                        onChange={(e) =>
                          setEdit((prev) => ({
                            ...prev,
                            [user.id]: {
                              email: e.target.value,
                              role: prev[user.id]?.role ?? primaryRole(user.roles),
                            },
                          }))
                        }
                      />
                    </div>
                  </FormField>
                  <FormField label="Role">
                    <FormSelect
                      value={edit[user.id]?.role ?? 'User'}
                      onChange={(e) =>
                        setEdit((prev) => ({
                          ...prev,
                          [user.id]: {
                            email: prev[user.id]?.email ?? user.email ?? '',
                            role: e.target.value as AppRole,
                          },
                        }))
                      }
                    >
                      <option value="User">User</option>
                      <option value="Admin">Admin</option>
                    </FormSelect>
                  </FormField>
                </div>

                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    className="btn-primary"
                    disabled={!isDirty(user) || savingId === user.id}
                    onClick={() => void handleSave(user.id)}
                  >
                    <Save className="h-4 w-4" />
                    {savingId === user.id ? 'Saving…' : 'Save changes'}
                  </button>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
