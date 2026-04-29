import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  className 
}) => {
  const variants = {
    primary: 'bg-evoli-primary/10 text-evoli-primary border-evoli-primary/20',
    secondary: 'bg-evoli-secondary text-evoli-text border-evoli-primary/10',
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    danger: 'bg-red-100 text-red-700 border-red-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    info: 'bg-sky-100 text-sky-700 border-sky-200',
  };

  const sizes = {
    sm: 'px-1.5 py-0 rounded text-[9px]',
    md: 'px-2.5 py-0.5 rounded-full text-[10px]',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center font-black uppercase tracking-wider border',
        variants[variant],
        sizes[size],
        className
      )}
    >
      {children}
    </span>
  );
};
