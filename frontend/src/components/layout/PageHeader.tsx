import React from 'react';
import { clsx } from 'clsx';
import { LayoutDashboard } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  compact?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  icon = <LayoutDashboard className="w-5 h-5 sm:w-6 sm:h-6" />, 
  actions, 
  className,
  compact = false,
}) => {
  return (
    <div className={clsx("w-full flex justify-center py-1 flex-shrink-0 z-40 relative px-2 sm:px-0", className)}>
      <div className={clsx(
        "w-full sm:w-[95%] max-w-7xl bg-white/70 backdrop-blur-md border border-evoli-primary/10 rounded-evoli shadow-evoli",
        compact ? "px-2 sm:px-4 py-1" : "px-3 sm:px-10 py-2 sm:py-1.5"
      )}>
        <div className={clsx(
          "flex sm:flex-row sm:items-center justify-between",
          compact ? "flex-row items-center gap-2 sm:gap-3" : "flex-col gap-2 sm:gap-6"
        )}>
          <div className={clsx("flex items-center min-w-0", compact ? "gap-2" : "gap-2 sm:gap-6 w-full sm:w-auto")}>
            <div className={clsx(
              "bg-evoli-primary rounded-evoli text-evoli-bg flex items-center justify-center shadow-card-game border-2 border-white/20 flex-shrink-0",
              compact ? "w-7 h-7" : "w-6 h-6 sm:w-10 sm:h-10"
            )}>
              {icon}
            </div>
            <div className="min-w-0">
              <h1 className={clsx(
                "font-black text-evoli-primary mb-0 leading-tight uppercase tracking-tight break-words",
                compact ? "text-[11px] sm:text-xs line-clamp-1" : "text-xs sm:text-lg line-clamp-2"
              )}>{title}</h1>
              {subtitle && !compact && (
                <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.12em] sm:tracking-[0.2em] mt-0.5 sm:mt-1 line-clamp-2 break-words opacity-60">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {actions && (
            <div className={clsx(
              "flex items-center flex-shrink-0",
              compact ? "gap-1.5 w-auto" : "gap-1.5 sm:gap-4 w-full sm:w-auto"
            )}>
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
