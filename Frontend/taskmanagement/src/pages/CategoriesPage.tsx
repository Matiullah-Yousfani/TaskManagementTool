import { type FormEvent, useEffect, useState } from 'react';
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../api/categories';
import { ApiClientError } from '../api/client';
import { Alert, PageHeader } from '../components/Ui';
import type { Category } from '../types';

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      setCategories(await getCategories());
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await createCategory(name.trim());
      setName('');
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Create failed');
    }
  };

  const handleUpdate = async (id: string) => {
    setError('');
    try {
      await updateCategory(id, editName.trim());
      setEditingId(null);
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Update failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Tasks will be unlinked.')) return;
    setError('');
    try {
      await deleteCategory(id);
      await load();
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Delete failed');
    }
  };

  return (
    <div>
      <PageHeader title="Categories" subtitle="Admin — manage task categories" />
      {error && <Alert message={error} />}

      <form onSubmit={handleCreate} className="card form-inline">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          required
          maxLength={128}
        />
        <button type="submit" className="btn btn-primary">
          Add category
        </button>
      </form>

      {loading ? (
        <div className="page-center"><div className="spinner" /></div>
      ) : (
        <ul className="category-list">
          {categories.map((cat) => (
            <li key={cat.id} className="card category-item">
              {editingId === cat.id ? (
                <>
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    maxLength={128}
                  />
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => handleUpdate(cat.id)}
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingId(null)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <span>{cat.name}</span>
                  <div className="category-actions">
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditName(cat.name);
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(cat.id)}
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
