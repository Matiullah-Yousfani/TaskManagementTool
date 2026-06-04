import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowUpRight, CheckCircle2, Clock, Loader } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getDashboardCounts } from '../api/dashboard';
import { ApiClientError } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useTaskHub } from '../hooks/useTaskHub';
import { StatusBarChart, StatusDonutChart } from '../components/charts/TaskCharts';
import { Alert, GlassPanel, PageHeader, Spinner } from '../components/ui/GlassPanel';
import type { DashboardCounts } from '../types';

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  to,
  delay,
}: {
  label: string;
  value: number | string;
  icon: typeof Clock;
  color: string;
  to: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
    >
      <Link to={to} className="group block">
        <GlassPanel className="relative overflow-hidden p-6 transition hover:border-white/20">
          <div className={`absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl ${color}`} />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-slate-400">{label}</p>
              <p className="mt-2 text-4xl font-bold text-white">{value}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <Icon className="h-5 w-5 text-white" />
            </div>
          </div>
          <span className="mt-4 inline-flex items-center gap-1 text-xs text-brand-400 opacity-0 transition group-hover:opacity-100">
            View tasks <ArrowUpRight className="h-3 w-3" />
          </span>
        </GlassPanel>
      </Link>
    </motion.div>
  );
}

export function DashboardPage() {
  const { isAdmin } = useAuth();
  const [counts, setCounts] = useState<DashboardCounts | null>(null);
  const [error, setError] = useState('');

  const load = () => {
    getDashboardCounts()
      .then(setCounts)
      .catch((err) =>
        setError(err instanceof ApiClientError ? err.message : 'Failed to load dashboard'),
      );
  };

  useEffect(() => load(), []);
  useTaskHub(load);

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle={
          isAdmin
            ? 'Organization-wide task analytics'
            : 'Your assigned tasks at a glance'
        }
      />
      {error && <Alert message={error} />}

      {!counts ? (
        <div className="flex h-48 items-center justify-center">
          <Spinner className="h-10 w-10" />
        </div>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-1 gap-5 md:grid-cols-3">
            <StatCard
              label="Pending"
              value={counts.pending}
              icon={Clock}
              color="bg-amber-500/20"
              to="/tasks?status=Pending"
              delay={0}
            />
            <StatCard
              label="In progress"
              value={counts.inProgress}
              icon={Loader}
              color="bg-sky-500/20"
              to="/tasks?status=InProgress"
              delay={0.1}
            />
            <StatCard
              label="Completed"
              value={counts.completed}
              icon={CheckCircle2}
              color="bg-emerald-500/20"
              to="/tasks?status=Completed"
              delay={0.2}
            />
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <StatusDonutChart counts={counts} />
            <StatusBarChart counts={counts} />
          </div>
        </>
      )}
    </div>
  );
}
