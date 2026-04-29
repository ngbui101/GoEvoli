import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PanelProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  variant?: 'default' | 'raised' | 'flat';
}

export const Panel: React.FC<PanelProps> = ({ children, title, className, variant = 'default' }) => {
  const variants = {
    default: 'bg-evoli-secondary/20 border-evoli-primary/10',
    raised: 'bg-white/50 border-evoli-primary/10 shadow-evoli',
    flat: 'bg-transparent border-evoli-primary/20',
  };

  return (
    <div className={cn('rounded-evoli border transition-all duration-300', variants[variant], className)}>
      {title && (
        <div className="px-6 py-4 border-b border-evoli-primary/10">
          <h3 className="text-xs font-black uppercase tracking-widest text-evoli-primary/70 mb-0">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
};
