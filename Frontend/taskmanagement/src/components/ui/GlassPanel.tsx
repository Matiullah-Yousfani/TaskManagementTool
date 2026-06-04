import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  className?: string;
  strong?: boolean;
  delay?: number;
}

export function GlassPanel({ children, className = '', strong, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      className={`${strong ? 'glass-strong' : 'glass'} ${className}`}
    >
      {children}
    </motion.div>
  );
}

export function Spinner({ className = 'h-8 w-8' }: { className?: string }) {
  return (
    <div
      className={`animate-spin rounded-full border-2 border-white/10 border-t-brand-500 ${className}`}
      role="status"
      aria-label="Loading"
    />
  );
}

export function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      className="mb-8 flex flex-wrap items-end justify-between gap-4"
    >
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-400">{subtitle}</p>}
      </div>
      {action}
    </motion.div>
  );
}

export function Alert({
  message,
  type = 'error',
}: {
  message: string;
  type?: 'error' | 'success';
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`mb-4 rounded-xl border px-4 py-3 text-sm ${
        type === 'error'
          ? 'border-rose-500/30 bg-rose-500/10 text-rose-200'
          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
      }`}
    >
      {message}
    </motion.div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Pending: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    'In progress': 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    InProgress: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
    Completed: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  };
  const label = status === 'InProgress' ? 'In progress' : status;
  return (
    <span className={`badge border ${map[status] ?? map.Pending}`}>{label}</span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    Low: 'bg-slate-500/20 text-slate-300',
    Medium: 'bg-orange-500/20 text-orange-300',
    High: 'bg-rose-500/20 text-rose-300',
  };
  return <span className={`badge ${map[priority] ?? map.Medium}`}>{priority}</span>;
}
