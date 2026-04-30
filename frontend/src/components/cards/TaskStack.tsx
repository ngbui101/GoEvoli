import React from 'react';
import { TaskCard } from './TaskCard';
import type { Task } from '../../types';
import { clsx } from 'clsx';

interface TaskStackProps {
  tasks: Task[];
  projectId: string;
}

export const TaskStack: React.FC<TaskStackProps> = ({ tasks, projectId }) => {
  if (tasks.length === 0) return null;
  const STACK_OFFSET_CQW = 17.5;

  return (
    <div 
      className="relative w-full px-1 pt-3"
      style={{ 
        paddingBottom: `${(tasks.length - 1) * STACK_OFFSET_CQW}cqw` 
      }}
    >
      {tasks.map((task, index) => {
        const isFirst = index === 0;
        const zIndex = index + 10;
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
              "hover:!z-[100] hover:scale-[1.05] hover:-translate-y-2 hover:shadow-2xl"
            )}
            style={{ 
              zIndex,
              top: isFirst ? undefined : `${index * STACK_OFFSET_CQW}cqw`,
            }}
          >
            <TaskCard 
              task={task} 
              projectId={projectId} 
            />
          </div>
        );
      })}
    </div>
  );
};
