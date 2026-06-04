import { motion } from 'framer-motion';
import { GlassPanel } from '../ui/GlassPanel';
import type { DashboardCounts } from '../../types';

const COLORS = {
  pending: '#fbbf24',
  inProgress: '#38bdf8',
  completed: '#34d399',
} as const;

const RADIUS = 72;
const STROKE = 22;
const CENTER = 100;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function DonutSegment({
  value,
  total,
  offset,
  color,
  delay,
}: {
  value: number;
  total: number;
  offset: number;
  color: string;
  delay: number;
}) {
  if (value <= 0 || total <= 0) return null;

  const length = (value / total) * CIRCUMFERENCE;
  const gap = CIRCUMFERENCE - length;
  const dashOffset = -offset * CIRCUMFERENCE;

  return (
    <motion.circle
      r={RADIUS}
      cx={CENTER}
      cy={CENTER}
      fill="none"
      stroke={color}
      strokeWidth={STROKE}
      strokeLinecap="round"
      strokeDasharray={`${length} ${gap}`}
      strokeDashoffset={dashOffset}
      transform={`rotate(-90 ${CENTER} ${CENTER})`}
      initial={{ opacity: 0, strokeDasharray: `0 ${CIRCUMFERENCE}` }}
      animate={{ opacity: 1, strokeDasharray: `${length} ${gap}` }}
      transition={{ duration: 0.8, delay, ease: 'easeOut' }}
    />
  );
}

export function StatusDonutChart({ counts }: { counts: DashboardCounts }) {
  const segments = [
    { name: 'Pending', value: counts.pending, color: COLORS.pending },
    { name: 'In Progress', value: counts.inProgress, color: COLORS.inProgress },
    { name: 'Completed', value: counts.completed, color: COLORS.completed },
  ].filter((s) => s.value > 0);

  const total = counts.pending + counts.inProgress + counts.completed;

  if (total === 0) {
    return (
      <GlassPanel className="flex h-72 items-center justify-center p-6">
        <p className="text-sm text-slate-500">No task data yet</p>
      </GlassPanel>
    );
  }

  let running = 0;

  return (
    <GlassPanel className="p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
        Status distribution
      </h3>
      <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
        <div className="relative h-[200px] w-[200px] shrink-0">
          <svg viewBox="0 0 200 200" className="h-full w-full">
            <circle
              r={RADIUS}
              cx={CENTER}
              cy={CENTER}
              fill="none"
              stroke="rgba(255,255,255,0.06)"
              strokeWidth={STROKE}
            />
            {segments.map((seg, i) => {
              const offset = running / total;
              running += seg.value;
              return (
                <DonutSegment
                  key={seg.name}
                  value={seg.value}
                  total={total}
                  offset={offset}
                  color={seg.color}
                  delay={i * 0.12}
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-bold text-white">{total}</span>
            <span className="text-xs text-slate-500">tasks</span>
          </div>
        </div>
        <ul className="flex w-full flex-col gap-3 sm:w-auto">
          {segments.map((seg, i) => (
            <motion.li
              key={seg.name}
              className="flex items-center justify-between gap-6 text-sm"
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            >
              <span className="flex items-center gap-2 text-slate-300">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: seg.color }}
                />
                {seg.name}
              </span>
              <span className="font-semibold text-white">{seg.value}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </GlassPanel>
  );
}

export function StatusBarChart({ counts }: { counts: DashboardCounts }) {
  const data = [
    { name: 'Pending', count: counts.pending, fill: COLORS.pending },
    { name: 'In Progress', count: counts.inProgress, fill: COLORS.inProgress },
    { name: 'Done', count: counts.completed, fill: COLORS.completed },
  ];

  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <GlassPanel className="p-6">
      <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
        Task overview
      </h3>
      <div className="flex h-56 items-end justify-around gap-4 px-2">
        {data.map((entry, i) => (
          <div key={entry.name} className="flex flex-1 flex-col items-center gap-2">
            <motion.span
              className="text-lg font-bold text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              {entry.count}
            </motion.span>
            <div className="relative flex h-40 w-full max-w-[72px] items-end justify-center">
              <motion.div
                className="w-full rounded-t-xl shadow-lg"
                style={{ backgroundColor: entry.fill, boxShadow: `0 8px 24px ${entry.fill}40` }}
                initial={{ height: 0 }}
                animate={{ height: `${(entry.count / max) * 100}%` }}
                transition={{ duration: 0.7, delay: i * 0.1, ease: 'easeOut' }}
              />
            </div>
            <span className="text-center text-xs text-slate-400">{entry.name}</span>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}
