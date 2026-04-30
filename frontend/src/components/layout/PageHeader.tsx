import React from 'react';
import { clsx } from 'clsx';
import { LayoutDashboard } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  icon = <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" />, 
  actions, 
  className 
}) => {
  return (
    <div className={clsx("w-full flex justify-center py-1 flex-shrink-0 z-40 relative px-2 sm:px-0", className)}>
      <div className="w-full sm:w-[95%] max-w-7xl bg-white/70 backdrop-blur-md border border-evoli-primary/10 rounded-evoli shadow-evoli px-3 sm:px-10 py-2 sm:py-1.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-6">
          <div className="flex items-center gap-2 sm:gap-6 min-w-0 w-full sm:w-auto">
            <div className="w-6 h-6 sm:w-10 sm:h-10 bg-evoli-primary rounded-evoli text-evoli-bg flex items-center justify-center shadow-card-game border-2 border-white/20 flex-shrink-0">
              {icon}
            </div>
            <div className="min-w-0">
              <h1 className="text-xs sm:text-lg font-black text-evoli-primary mb-0 leading-tight uppercase tracking-tight line-clamp-2 break-words">{title}</h1>
              {subtitle && (
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.12em] sm:tracking-[0.2em] mt-0.5 sm:mt-1 line-clamp-2 break-words opacity-60">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className="flex items-center gap-1.5 sm:gap-4 flex-shrink-0 w-full sm:w-auto">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
