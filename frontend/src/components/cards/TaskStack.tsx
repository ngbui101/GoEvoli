import React from 'react';
import { TaskCard } from './TaskCard';
import type { Task } from '../../types';
import { clsx } from 'clsx';

interface TaskStackProps {
  tasks: Task[];
  isMobile?: boolean;
  projectId: string;
}

export const TaskStack: React.FC<TaskStackProps> = ({ tasks, isMobile, projectId }) => {
  if (tasks.length === 0) return null;

  // Offset ensures the card header (title) of the card above is fully visible.
  // Using 17.5cqw (which equals ~28px on a 160px wide card) allows the offset to scale perfectly with the column width.
  const STACK_OFFSET_CQW = 17.5;

  return (
    <div 
      className="relative w-full px-1 pt-3"
      style={{ 
        // Expand the container's height by the total offset of all stacked cards.
        paddingBottom: `${(tasks.length - 1) * STACK_OFFSET_CQW}cqw` 
      }}
    >
      {tasks.map((task, index) => {
        const isFirst = index === 0;
        const zIndex = index + 10;
        
        // Deterministic jitter to make it look like a real physical stack
        const jitterClasses = [
          "rotate-[-1deg] -translate-x-[1%]",
          "rotate-[1deg] translate-x-[2%]",
          "rotate-[-0.5deg] translate-x-[1%]",
          "rotate-[1.5deg] -translate-x-[2%]",
          "rotate-0 translate-x-0"
        ][index % 5];
        
        return (
          <div 
            key={task.id}
            className={clsx(
              "w-full transition-all duration-300 ease-out group/stackcard",
              isFirst ? "relative" : "absolute left-1 right-1",
              jitterClasses,
              // When hovering ANY card in the stack, bring it to the absolute front and pop it out
              "hover:!z-[100] hover:scale-[1.05] hover:-translate-y-2 hover:shadow-2xl"
            )}
            style={{ 
              zIndex,
              top: isFirst ? undefined : `${index * STACK_OFFSET_CQW}cqw`,
            }}
          >
            <TaskCard 
              task={task} 
              isMobile={isMobile} 
              projectId={projectId} 
            />
          </div>
        );
      })}
    </div>
  );
};
