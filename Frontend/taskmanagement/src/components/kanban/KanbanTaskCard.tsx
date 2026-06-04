import { memo, type CSSProperties } from 'react';
import type {
  DraggableProvidedDraggableProps,
  DraggableProvidedDragHandleProps,
} from '@hello-pangea/dnd';
import { Calendar, ExternalLink, GripVertical, Flame } from 'lucide-react';
import { PriorityBadge } from '../ui/GlassPanel';
import type { TaskItem, TaskPriority } from '../../types';

const DRAG_Z = 100000;

const PRIORITY_STYLE: Record<TaskPriority, { card: string; title: string }> = {
  High: {
    card: 'kanban-card--high border-l-4 border-l-rose-500 bg-gradient-to-br from-rose-950/90 via-slate-800 to-slate-900 ring-2 ring-rose-500/40',
    title: 'text-rose-50',
  },
  Medium: {
    card: 'kanban-card--medium border-l-4 border-l-amber-500 bg-gradient-to-br from-amber-950/50 via-slate-800 to-slate-900 ring-1 ring-amber-500/25',
    title: 'text-amber-50',
  },
  Low: {
    card: 'kanban-card--low border-l-4 border-l-slate-500 bg-slate-800/95 ring-1 ring-slate-600/20',
    title: 'text-slate-100',
  },
};

export function mergeDragStyle(
  base: CSSProperties | undefined,
  dragging: boolean,
): CSSProperties | undefined {
  if (!dragging) return base;
  return {
    ...base,
    zIndex: DRAG_Z,
    boxShadow: '0 20px 40px rgba(0,0,0,0.55), 0 0 0 2px rgba(129,140,248,0.45)',
  };
}

type Props = {
  task: TaskItem;
  isDragging: boolean;
  isSaving: boolean;
  isAdmin: boolean;
  innerRef: (el: HTMLElement | null) => void;
  draggableProps: DraggableProvidedDraggableProps;
  dragHandleProps: DraggableProvidedDragHandleProps | null;
  style?: CSSProperties;
  onOpen: (id: string) => void;
};

function KanbanTaskCardInner({
  task,
  isDragging,
  isSaving,
  isAdmin,
  innerRef,
  draggableProps,
  dragHandleProps,
  style,
  onOpen,
}: Props) {
  const p = PRIORITY_STYLE[task.priority] ?? PRIORITY_STYLE.Medium;
  const isHigh = task.priority === 'High';

  return (
    <div
      ref={innerRef}
      {...draggableProps}
      {...(dragHandleProps ?? {})}
      style={style}
      className={[
        'kanban-card rounded-xl',
        p.card,
        isDragging ? 'kanban-card--dragging' : 'kanban-card--idle',
        isSaving ? 'opacity-75' : '',
      ].join(' ')}
      onClick={() => onOpen(task.id)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          onOpen(task.id);
        }
      }}
    >
      {isHigh && !isDragging && (
        <div className="flex items-center gap-1 border-b border-rose-500/30 bg-rose-500/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-rose-300">
          <Flame className="h-3 w-3" />
          High priority
        </div>
      )}
      <div className="flex gap-2 p-3">
        <GripVertical className="mt-1 h-4 w-4 shrink-0 text-slate-500" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-start justify-between gap-2">
            <span className={`font-semibold leading-snug ${p.title}`}>{task.title}</span>
            {!isDragging && <ExternalLink className="h-3.5 w-3.5 shrink-0 text-slate-500" />}
          </div>
          {!isDragging && (
            <>
              <p className="mb-2 line-clamp-2 text-xs text-slate-400">
                {task.description || 'No description'}
              </p>
              <div className="flex flex-wrap gap-2">
                <PriorityBadge priority={task.priority} />
                {task.categoryName && (
                  <span className="rounded bg-black/30 px-2 py-0.5 text-xs text-slate-400">
                    {task.categoryName}
                  </span>
                )}
              </div>
              {task.dueDate && (
                <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <Calendar className="h-3 w-3" />
                  {new Date(task.dueDate).toLocaleDateString()}
                </p>
              )}
              {isAdmin && task.assignedToUserName && (
                <p className="mt-1 text-xs text-indigo-300/90">→ {task.assignedToUserName}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export const KanbanTaskCard = memo(KanbanTaskCardInner);
