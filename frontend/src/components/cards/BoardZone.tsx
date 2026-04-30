import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { TaskStack } from './TaskStack';
import type { Task, TaskStatus } from '../../types';
import { twMerge } from 'tailwind-merge';
import { AlertCircle } from 'lucide-react';

interface BoardZoneProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  storyId: string;
  wipLimit?: number;
  wipCount?: number;
  projectId: string;
  hideHeader?: boolean;
}

export const BoardZone: React.FC<BoardZoneProps> = ({ 
  id, title, tasks, storyId, wipLimit, wipCount, projectId, hideHeader = false 
}) => {
  const droppableId = `${storyId}-${id}`;
  const { setNodeRef, isOver } = useDroppable({
    id: droppableId,
    data: { type: 'Column', status: id },
  });

  const isWipWarning = wipLimit !== undefined && wipCount !== undefined && wipCount > wipLimit;

  return (
    <div
      className={twMerge(
        "flex-shrink-0 w-[190px] sm:w-[168px] flex flex-col transition-all duration-300 relative group/zone hover:z-50 snap-start",
        isOver && "scale-[1.01]"
      )}
      style={{ containerType: 'inline-size' }}
    >
      <svg className="absolute inset-0 w-full h-full -z-10" preserveAspectRatio="none" viewBox="0 0 100 100">
        <rect 
          x="2" y="2" width="96" height="96" rx="4" 
          fill="white" fillOpacity={isOver ? "0.15" : "0.05"} 
          stroke={isWipWarning ? "#EF4444" : "#4D3122"} 
          strokeWidth="0.5" 
          strokeDasharray="2 2"
        />
        <path d="M2 10V2H10" fill="none" stroke="#4D3122" strokeWidth="0.5" strokeOpacity="0.2" />
        <path d="M90 2H98V10" fill="none" stroke="#4D3122" strokeWidth="0.5" strokeOpacity="0.2" />
        <path d="M2 90V98H10" fill="none" stroke="#4D3122" strokeWidth="0.5" strokeOpacity="0.2" />
        <path d="M90 98H98V90" fill="none" stroke="#4D3122" strokeWidth="0.5" strokeOpacity="0.2" />
        {isOver && (
          <rect x="1" y="1" width="98" height="98" rx="5" fill="none" stroke="#925D3B" strokeWidth="2" strokeOpacity="0.3" className="animate-pulse" />
        )}
      </svg>
      {!hideHeader && (
        <div className="px-4 py-3 flex justify-between items-center border-b border-evoli-card-border/5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-evoli-text/40">{title}</span>
            {isWipWarning && <AlertCircle className="w-3.5 h-3.5 text-red-500 animate-pulse" />}
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2 py-0.5 bg-evoli-bg/50 rounded-full border border-evoli-primary/10 shadow-inner">
               <span className={twMerge("text-[10px] font-black", isWipWarning ? "text-red-600" : "text-evoli-text/60")}>
                 {tasks.length}
               </span>
               {wipLimit !== undefined && (
                 <span className="text-[10px] font-black text-evoli-text/20 ml-1">/ {wipLimit}</span>
               )}
            </div>
          </div>
        </div>
      )}
      {wipLimit !== undefined && (
        <div className="absolute inset-x-4 top-12 flex gap-1.5 h-1 opacity-40">
          {Array.from({ length: wipLimit }).map((_, i) => (
            <div key={i} className={twMerge(
              "flex-1 rounded-full shadow-inner",
              i < (wipCount || 0) ? "bg-evoli-primary shadow-[0_0_5px_rgba(146,93,59,0.5)]" : "bg-evoli-text/10"
            )} />
          ))}
        </div>
      )}
      <div
        ref={setNodeRef}
        className={twMerge(
          "flex-1 p-1 flex flex-col gap-1",
          isOver && "bg-evoli-primary/5"
        )}
      >
        <TaskStack
          tasks={tasks}
          projectId={projectId}
        />
        
        {tasks.length === 0 && !isOver && (
          <div className="flex-1 flex items-center justify-center opacity-10 group-hover/zone:opacity-20 transition-opacity">
            <div className="relative">
               <div className="w-16 h-24 rounded-lg border-2 border-dashed border-evoli-text" />
               <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-evoli-text/50 border-t-transparent animate-spin-slow" />
               </div>
            </div>
          </div>
        )}
      </div>
      {isOver && tasks.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="px-6 py-3 bg-evoli-primary text-white rounded-full border-2 border-white/20 shadow-2xl text-[11px] font-black uppercase tracking-[0.4em] animate-bounce">
            Drop Card
          </div>
        </div>
      )}
    </div>
  );
};
