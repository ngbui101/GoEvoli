import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input: React.FC<InputProps> = ({ label, error, className, id, ...props }) => {
  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-xs font-black uppercase tracking-widest text-evoli-text/70 ml-1">
          {label}
        </label>
      )}
      <input
        id={id}
        className={cn(
          'w-full px-5 py-3.5 bg-evoli-secondary/30 border border-evoli-primary/20 rounded-evoli text-evoli-text placeholder:text-evoli-text/40 focus:outline-none focus:ring-2 focus:ring-evoli-primary/30 focus:border-evoli-primary transition-all duration-200 shadow-inner font-medium',
          error && 'border-red-500 focus:ring-red-500/30 focus:border-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-[10px] font-bold text-red-600 ml-1">{error}</p>}
    </div>
  );
};
