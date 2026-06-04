import { memo } from 'react';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { KanbanTaskCard, mergeDragStyle } from './KanbanTaskCard';
import type { TaskItem, TaskItemStatus } from '../../types';

type Props = {
  id: TaskItemStatus;
  title: string;
  accent: string;
  tasks: TaskItem[];
  isAdmin: boolean;
  savingTaskId: string | null;
  onOpenTask: (id: string) => void;
};

function KanbanColumnInner({ id, title, accent, tasks, isAdmin, savingTaskId, onOpenTask }: Props) {
  return (
    <div className="kanban-column">
      <div className={`kanban-column-panel border-t-4 ${accent}`}>
        <div className="kanban-column-header">
          <h3>{title}</h3>
          <span className="kanban-count">{tasks.length}</span>
        </div>
        <Droppable droppableId={id}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`kanban-drop-area ${snapshot.isDraggingOver ? 'kanban-drop-area--active' : ''}`}
            >
              {tasks.length === 0 && (
                <div className="kanban-empty">
                  {snapshot.isDraggingOver ? 'Release to drop' : 'Drop tasks here'}
                </div>
              )}
              <div className="kanban-card-list" data-priority-sorted="high-first">
                {tasks.map((task, index) => (
                  <Draggable
                    key={task.id}
                    draggableId={task.id}
                    index={index}
                    isDragDisabled={savingTaskId === task.id}
                  >
                    {(drag, snap) => (
                      <KanbanTaskCard
                        task={task}
                        isAdmin={isAdmin}
                        isDragging={snap.isDragging}
                        isSaving={savingTaskId === task.id}
                        innerRef={drag.innerRef}
                        draggableProps={drag.draggableProps}
                        dragHandleProps={drag.dragHandleProps}
                        style={mergeDragStyle(drag.draggableProps.style, snap.isDragging)}
                        onOpen={onOpenTask}
                      />
                    )}
                  </Draggable>
                ))}
              </div>
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </div>
    </div>
  );
}

export const KanbanColumn = memo(KanbanColumnInner);
