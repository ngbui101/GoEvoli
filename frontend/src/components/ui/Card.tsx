import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hoverable?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className, hoverable = false, padding = 'md', onClick }) => {
  const paddings = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        'bg-white/80 backdrop-blur-sm border border-evoli-primary/10 rounded-evoli shadow-evoli transition-all duration-300',
        hoverable && 'hover:shadow-evoli-hover hover:-translate-y-1 hover:border-evoli-primary/30 cursor-pointer',
        paddings[padding],
        className
      )}
    >
      {children}
    </div>
  );
};
