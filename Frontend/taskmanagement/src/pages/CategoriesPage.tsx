import { type FormEvent, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FolderPlus, Pencil, Trash2 } from 'lucide-react';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../api/categories';
import { ApiClientError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import {
  FormField,
  FormInput,
  FormSection,
} from '../components/ui/FormControls';
import { Alert, GlassPanel, PageHeader, Spinner } from '../components/ui/GlassPanel';
import type { Category } from '../types';

export function CategoriesPage() {
  const { isAdmin } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      setCategories(await getCategories());
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Load failed');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await createCategory(name.trim());
      setName('');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Create failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="Categories"
        subtitle={
          isAdmin
            ? 'Everyone can add categories · admins can edit or delete'
            : 'Create categories to organize your tasks'
        }
      />
      {error && <Alert message={error} />}

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <GlassPanel className="mb-6 p-6">
          <FormSection title="Add category" description="Create a label for grouping tasks">
            <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <FormField label="Category name" required>
                  <FormInput
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Marketing, Engineering…"
                    required
                  />
                </FormField>
              </div>
              <button type="submit" className="btn-primary shrink-0" disabled={saving}>
                <FolderPlus className="h-4 w-4" />
                {saving ? 'Adding…' : 'Add category'}
              </button>
            </form>
          </FormSection>
        </GlassPanel>

        {loading ? (
          <div className="flex h-32 items-center justify-center">
            <Spinner />
          </div>
        ) : categories.length === 0 ? (
          <GlassPanel className="p-10 text-center text-slate-400">
            No categories yet. Add one above.
          </GlassPanel>
        ) : (
          <div className="space-y-3">
            {categories.map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <GlassPanel className="flex flex-wrap items-center justify-between gap-3 p-4">
                  {isAdmin && editingId === cat.id ? (
                    <>
                      <FormInput
                        className="flex-1"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          type="button"
                          className="btn-primary"
                          onClick={async () => {
                            try {
                              await updateCategory(cat.id, editName);
                              setEditingId(null);
                              await load();
                            } catch (err) {
                              setError(err instanceof ApiClientError ? err.message : 'Update failed');
                            }
                          }}
                        >
                          Save
                        </button>
                        <button type="button" className="btn-ghost" onClick={() => setEditingId(null)}>
                          Cancel
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-white">{cat.name}</span>
                      {isAdmin && (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="btn-ghost"
                            onClick={() => {
                              setEditingId(cat.id);
                              setEditName(cat.name);
                            }}
                          >
                            <Pencil className="h-4 w-4" />
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-danger"
                            onClick={async () => {
                              if (confirm('Delete category?')) {
                                try {
                                  await deleteCategory(cat.id);
                                  await load();
                                } catch (err) {
                                  setError(err instanceof ApiClientError ? err.message : 'Delete failed');
                                }
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
