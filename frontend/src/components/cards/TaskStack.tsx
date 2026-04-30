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
  const stackPadding = `${(tasks.length - 1) * STACK_OFFSET_CQW}cqw`;

  return (
    <div 
      className="relative w-full px-1 pt-3 pb-2 sm:[padding-bottom:var(--stack-padding)]"
      style={{ '--stack-padding': stackPadding } as React.CSSProperties}
    >
      {tasks.map((task, index) => {
        const isFirst = index === 0;
        const zIndex = index + 10;
        const stackTop = `${index * STACK_OFFSET_CQW}cqw`;
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
              "w-full transition-all duration-300 ease-out group/stackcard mb-3 sm:mb-0 flex justify-center",
              isFirst ? "relative" : "relative sm:absolute sm:left-1 sm:right-1",
              !isFirst && "sm:top-[var(--stack-top)]",
              "sm:block",
              jitterClasses,
              "sm:hover:!z-[100] sm:hover:scale-[1.05] sm:hover:-translate-y-2 sm:hover:shadow-2xl"
            )}
            style={{ 
              zIndex,
              '--stack-top': stackTop,
            } as React.CSSProperties}
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
