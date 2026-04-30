import React from 'react';
import { 
  DndContext, 
  closestCorners, 
  PointerSensor, 
  MouseSensor,
  TouchSensor,
  useSensor, 
  useSensors, 
  DragOverlay 
} from '@dnd-kit/core';
import { useState } from 'react';
import type { DragEndEvent } from '@dnd-kit/core';
import type { UserStory, Task, TaskStatus } from '../../types';
import { StoryCard } from '../cards/StoryCard';
import { BoardZone } from '../cards/BoardZone';
import { TaskCard } from '../cards/TaskCard';

interface SwimlaneProps {
  story: UserStory;
  tasks: Task[];
  wipCounts: { next: number; doing: number };
  wipLimits: { next: number; doing: number };
  onTaskMove: (taskId: string, targetStatus: TaskStatus) => void;
  onStoryClick: (story: UserStory) => void;
  projectId: string;
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'BACKLOG', title: 'Backlog' },
  { id: 'NEXT', title: 'Next' },
  { id: 'DOING', title: 'Doing' },
  { id: 'TEST', title: 'Test' },
  { id: 'DONE', title: 'Done' },
];

export const Swimlane: React.FC<SwimlaneProps> = ({
  story, tasks, wipCounts, wipLimits, onTaskMove, onStoryClick, projectId
}) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 200, tolerance: 10 },
    }),
    useSensor(PointerSensor)
  );

  const handleDragStart = (event: any) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;
    const parts = overId.split('-');
    const targetStatus = parts[parts.length - 1] as TaskStatus;

    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === targetStatus) return;

    onTaskMove(taskId, targetStatus);
  };

  return (
    <div className="flex gap-3 sm:gap-2 pb-8 sm:pb-10 last:pb-0 relative snap-start">
      <div className="absolute left-[188px] sm:left-[172px] top-0 bottom-10 w-1 bg-evoli-card-border/5 rounded-full" />
      <div className="w-[184px] sm:w-[168px] flex-shrink-0 flex flex-col sticky left-0 z-30 bg-evoli-bg/95 backdrop-blur-sm pr-2 sm:pr-0 sm:static sm:bg-transparent sm:backdrop-blur-none relative pt-0">
         <div className="absolute inset-x-0 top-0 bottom-0 -z-10 px-0.5">
            <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
               <rect 
                  x="2" y="2" width="96" height="96" rx="4" 
                  fill="white" fillOpacity="0.05" 
                  stroke="#4D3122" 
                  strokeWidth="0.5" 
                  strokeDasharray="2 2"
               />
               <path d="M2 10V2H10" fill="none" stroke="#4D3122" strokeWidth="0.5" strokeOpacity="0.2" />
               <path d="M90 2H98V10" fill="none" stroke="#4D3122" strokeWidth="0.5" strokeOpacity="0.2" />
            </svg>
         </div>
         <div className="p-1 pt-4 flex flex-col h-full">
            <StoryCard size="board" story={story} tasks={tasks} onClick={() => onStoryClick(story)} />
         </div>
      </div>
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCorners} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-3 sm:gap-2 flex-1 min-w-max pt-0 snap-x snap-mandatory">
          {COLUMNS.map(col => (
            <BoardZone
              key={col.id}
              id={col.id}
              title={col.title}
              storyId={story.id}
              tasks={tasks.filter(t => t.status === col.id)}
              wipLimit={col.id === 'NEXT' ? wipLimits.next : col.id === 'DOING' ? wipLimits.doing : undefined}
              wipCount={col.id === 'NEXT' ? wipCounts.next : col.id === 'DOING' ? wipCounts.doing : undefined}
              projectId={projectId}
              hideHeader={true}
            />
          ))}
        </div>
        
        <DragOverlay zIndex={1000}>
          {activeId ? (
            <div className="rotate-3 scale-105 shadow-2xl opacity-90 cursor-grabbing">
              <TaskCard 
                task={tasks.find(t => t.id === activeId)!} 
                projectId={projectId}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
};
