import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { ApiClientError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { Alert, GlassPanel, Spinner } from '../components/ui/GlassPanel';

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="mb-8 text-center">
          <div className="animate-float mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-cyan-400 shadow-xl shadow-indigo-500/30">
            <Sparkles className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome back</h1>
          <p className="mt-2 text-slate-400">Sign in to TaskFlow</p>
        </div>
        <GlassPanel strong className="p-8">
          {error && <Alert message={error} />}
          <form onSubmit={submit} className="space-y-4">
            <label className="block text-sm text-slate-400">
              Email
              <input type="email" className="glass-input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </label>
            <label className="block text-sm text-slate-400">
              Password
              <input type="password" className="glass-input mt-1" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </label>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? <Spinner className="h-5 w-5 border-2" /> : 'Sign in'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            No account? <Link to="/register" className="text-brand-400 hover:underline">Register</Link>
          </p>
        </GlassPanel>
      </motion.div>
    </div>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      navigate('/login');
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mesh-bg flex min-h-screen items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <GlassPanel strong className="p-8">
          <h1 className="mb-6 text-2xl font-bold text-white">Create account</h1>
          {error && <Alert message={error} />}
          <form onSubmit={submit} className="space-y-4">
            <input className="glass-input" placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} required />
            <input type="email" className="glass-input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" className="glass-input" placeholder="Password (min 6)" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            <button type="submit" className="btn-primary w-full" disabled={loading}>Sign up</button>
          </form>
          <p className="mt-6 text-center text-sm text-slate-500">
            Have an account? <Link to="/login" className="text-brand-400">Sign in</Link>
          </p>
        </GlassPanel>
      </motion.div>
    </div>
  );
}
