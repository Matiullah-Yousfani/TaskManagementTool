import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, User } from 'lucide-react';
import { updateCurrentUserProfile } from '../api/users';
import { syncStoredAuthUser } from '../api/auth';
import { ApiClientError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { FormField, FormInput, FormSection, ReadOnlyField } from '../components/ui/FormControls';
import { Alert, GlassPanel, PageHeader, Spinner } from '../components/ui/GlassPanel';

export function ProfilePage() {
  const { profile, logout, refreshProfile } = useAuth();
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!profile) return;
    setUserName(profile.userName);
    setEmail(profile.email ?? '');
    setPhoneNumber(profile.phoneNumber ?? '');
  }, [profile]);

  if (!profile) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner />
      </div>
    );
  }

  const roleLabel = profile.roles.includes('Admin') ? 'Admin' : 'User';
  const isDirty =
    userName.trim() !== profile.userName ||
    email.trim() !== (profile.email ?? '') ||
    phoneNumber.trim() !== (profile.phoneNumber ?? '');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await updateCurrentUserProfile({
        userName: userName.trim(),
        email: email.trim(),
        phoneNumber: phoneNumber.trim() || undefined,
      });
      syncStoredAuthUser({
        userName: updated.userName,
        email: updated.email ?? undefined,
      });
      await refreshProfile();
      setSuccess('Profile updated successfully.');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <PageHeader
        title="Profile"
        subtitle="Update your name and contact details. Role is managed by an administrator."
      />

      {error && <Alert message={error} />}
      {success && <Alert message={success} type="success" />}

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <GlassPanel className="p-8">
          <form onSubmit={handleSave} className="space-y-6">
            <FormSection title="Account" description="Changes apply to your login email and display name.">
              <FormField label="Name" required>
                <FormInput
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="Your display name"
                  required
                  maxLength={256}
                  autoComplete="name"
                />
              </FormField>
              <FormField label="Email" required>
                <FormInput
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  maxLength={256}
                  autoComplete="email"
                />
              </FormField>
              <FormField label="Phone" hint="Optional">
                <FormInput
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="+1 555 000 0000"
                  maxLength={50}
                  autoComplete="tel"
                />
              </FormField>
            </FormSection>

            <FormSection title="Access">
              <ReadOnlyField label="Role" value={roleLabel} />
              <ReadOnlyField
                label="Member since"
                value={new Date(profile.createdAt).toLocaleDateString()}
              />
            </FormSection>

            <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-6">
              <button
                type="submit"
                className="btn-primary"
                disabled={saving || !isDirty}
              >
                {saving ? <Spinner className="h-4 w-4" /> : <Save className="h-4 w-4" />}
                Save changes
              </button>
              <button type="button" className="btn-danger" onClick={logout}>
                Logout
              </button>
            </div>
          </form>
        </GlassPanel>
      </motion.div>

      <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
        <User className="h-3.5 w-3.5" />
        Administrators can change roles from the Users screen.
      </p>
    </div>
  );
}
