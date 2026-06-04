import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DragDropContext, type DropResult } from '@hello-pangea/dnd';
import { Plus } from 'lucide-react';
import { getTasks, updateTaskStatus } from '../../api/tasks';
import { ApiClientError } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useTaskHub } from '../../hooks/useTaskHub';
import { Alert, PageHeader, Spinner } from '../ui/GlassPanel';
import { KanbanColumn } from './KanbanColumn';
import { groupAndSortByStatus } from '../../utils/taskSort';
import type { TaskItem, TaskItemStatus } from '../../types';

const COLUMNS: { id: TaskItemStatus; title: string; accent: string }[] = [
  { id: 'Pending', title: 'Pending', accent: 'border-t-amber-400' },
  { id: 'InProgress', title: 'In Progress', accent: 'border-t-sky-400' },
  { id: 'Completed', title: 'Completed', accent: 'border-t-emerald-400' },
];

export function KanbanBoard() {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);

  const draggingRef = useRef(false);
  const pauseHubRef = useRef(0);
  const dragEndRef = useRef(0);
  const tasksRef = useRef(tasks);
  tasksRef.current = tasks;

  const byStatus = useMemo(() => groupAndSortByStatus(tasks), [tasks]);

  const skipHub = useCallback(
    () => draggingRef.current || Date.now() < pauseHubRef.current,
    [],
  );

  const load = useCallback(async () => {
    if (skipHub()) return;
    setError('');
    try {
      const res = await getTasks({ page: 1, pageSize: 200 });
      setTasks(res.items);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : 'Failed to load board');
    } finally {
      setLoading(false);
    }
  }, [skipHub]);

  useEffect(() => {
    void load();
  }, [load]);

  useTaskHub(() => void load(), { shouldSkip: skipHub });

  const openTask = useCallback(
    (id: string) => {
      if (draggingRef.current || Date.now() - dragEndRef.current < 150) return;
      navigate(`/tasks/${id}`);
    },
    [navigate],
  );

  const onDragStart = useCallback(() => {
    draggingRef.current = true;
    setError('');
  }, []);

  const onDragEnd = useCallback(async (result: DropResult) => {
    draggingRef.current = false;
    dragEndRef.current = Date.now();

    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index)
      return;

    const newStatus = destination.droppableId as TaskItemStatus;
    const prev = tasksRef.current;
    const task = prev.find((t) => t.id === draggableId);
    if (!task || task.status === newStatus) return;

    setTasks((curr) =>
      curr.map((t) => (t.id === draggableId ? { ...t, status: newStatus } : t)),
    );
    setSavingTaskId(draggableId);
    pauseHubRef.current = Date.now() + 800;

    try {
      const updated = await updateTaskStatus(draggableId, newStatus);
      setTasks((curr) =>
        curr.map((t) => (t.id === draggableId ? { ...t, ...updated } : t)),
      );
    } catch (err) {
      pauseHubRef.current = 0;
      setTasks(prev);
      setError(
        err instanceof ApiClientError
          ? err.message
          : 'Could not save status. You must be assigned to this task.',
      );
    } finally {
      setSavingTaskId(null);
      pauseHubRef.current = Date.now() + 400;
    }
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="kanban-page">
      <PageHeader
        title="Kanban board"
        subtitle="Drag between columns · High priority tasks appear at the top"
        action={
          <Link to="/tasks/new" className="btn-primary">
            <Plus className="h-4 w-4" />
            Create task
          </Link>
        }
      />
      {error && <Alert message={error} />}

      <div className="mb-4 flex flex-wrap gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.7)]" />
          High priority
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-amber-500" />
          Medium
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-sm bg-slate-500" />
          Low
        </span>
      </div>

      <DragDropContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="kanban-scroll">
          <div className="kanban-board">
            {COLUMNS.map((col) => (
              <KanbanColumn
                key={col.id}
                id={col.id}
                title={col.title}
                accent={col.accent}
                tasks={byStatus[col.id]}
                isAdmin={isAdmin}
                savingTaskId={savingTaskId}
                onOpenTask={openTask}
              />
            ))}
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
