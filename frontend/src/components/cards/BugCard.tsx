import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CardShell } from './CardShell';
import { CardArtwork } from './CardArtwork';
import type { CardSize } from './CardShell';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { Bug as BugIcon, User, Shield, ShieldAlert, MessageCircle, MoreHorizontal, History } from 'lucide-react';
import type { Bug } from '../../types';

interface BugCardProps {
  bug: Bug;
  className?: string;
  size?: CardSize;
}

export const BugCard: React.FC<BugCardProps> = ({ 
  bug, 
  className,
  size = "board"
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: bug.id,
    data: { type: 'Bug', bug },
  });

  const isBoard = size === "board";

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : 10,
  } as React.CSSProperties : undefined;

  const headerRight = (
    <div className="flex items-center gap-1">
      <div className={cn(
        "rounded-sm bg-red-600 text-white font-black uppercase tracking-tighter shadow-md border border-red-800",
        bug.severity === 'CRITICAL' && "animate-pulse",
        isBoard ? "px-[3.75cqw] py-[1.25cqh] text-[4.3cqw]" : "px-3 py-1 text-[10px]"
      )}>
        {isBoard ? bug.severity.slice(0, 4) : bug.severity}
      </div>
      {!isBoard && bug.blocksWork && (
        <div className="w-6 h-6 rounded-full bg-red-700 flex items-center justify-center border border-white/20">
           <ShieldAlert className="w-4 h-4 text-white" />
        </div>
      )}
    </div>
  );

  const meta = (
    <div className="flex justify-between items-center w-full px-1">
       <div className={cn("flex items-center", isBoard ? "gap-[2.5cqw]" : "gap-1")}>
          <BugIcon className={isBoard ? "w-[6.25cqw] h-[6.25cqw] text-red-600" : "w-4 h-4 text-red-600"} />
          <span className={cn("font-black uppercase text-evoli-text/40", isBoard ? "text-[4.3cqw]" : "text-[10px]")}>
            {isBoard ? bug.affectedEntityType.slice(0, 8) : bug.affectedEntityType}
          </span>
       </div>
       <Badge variant="danger" size="sm" className={cn("font-black px-1 py-0", isBoard ? "text-[4.3cqw] h-[1.8cqh] px-[2.5cqw]" : "text-[10px] h-5")}>BUG</Badge>
    </div>
  );

  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}>
      <CardShell
        size={size}
        title={bug.title}
        headerRight={headerRight}
        artwork={
          <CardArtwork
            imageName="bug"
            imageLabel="Bug"
            holo={{ from: '#ef4444', via: '#b91c1c', to: '#7f1d1d' }}
            status={'BLOCKED' as any}
            isBoard={isBoard}
          />
        }
        meta={meta}
        className={cn(
          isDragging && "opacity-50 rotate-2 z-[100]",
          className
        )}
        footer={
          <div className="flex justify-between items-center w-full font-black uppercase text-red-900/60">
             <span className={cn("flex items-center gap-1", isBoard ? "text-[4.3cqw]" : "text-[10px]")}>
               <Shield className={isBoard ? "w-[5cqw] h-[5cqw]" : "w-4 h-4"} /> 
               {isBoard ? "Critical" : "System Blocker"}
             </span>
             <span className={isBoard ? "text-[4.3cqw]" : "text-[10px]"}>#{bug.id.slice(-4)}</span>
          </div>
        }
      >
        {isBoard ? (
          <div className="flex flex-col h-full justify-between">
             <div className="relative">
                <p className={cn("line-clamp-3 font-medium text-red-900 leading-tight italic", isBoard ? "text-[5cqw] mb-[2.5cqh]" : "text-[9px] mb-1")}>
                  "{bug.description || "Systemfehler ohne Dokumentation."}"
                </p>
             </div>
             
             <div className={cn("flex items-center justify-between border-t border-red-500/10", isBoard ? "pt-[2.5cqh]" : "pt-1")}>
                <div className={cn("flex items-center", isBoard ? "gap-[2.5cqw]" : "gap-1")}>
                   <User className={isBoard ? "w-[5cqw] h-[5cqw] text-red-900/40" : "w-2 h-2 text-red-900/40"} />
                   <span className={cn("font-black uppercase text-red-900/40 tracking-tighter truncate max-w-[60px]", isBoard ? "text-[3.75cqw]" : "text-[6px]")}>System</span>
                </div>
                <span className={cn("font-black text-red-900/40", isBoard ? "text-[3.75cqw]" : "text-[6px]")}>{new Date(bug.createdAt).toLocaleDateString()}</span>
             </div>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-4">
             <div className="space-y-2">
                <div className="text-[10px] font-black uppercase text-red-600/40 flex items-center gap-1.5">
                   <BugIcon className="w-3 h-3" /> Fehlerbeschreibung
                </div>
                <p className="text-sm leading-relaxed text-red-900 italic bg-red-50/50 p-3 rounded-md border border-red-200">
                   "{bug.description || "Systemfehler ohne Dokumentation."}"
                </p>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="p-2 bg-red-100/50 rounded border border-red-200 flex items-center gap-2">
                   <History className="w-4 h-4 text-red-900/40" />
                   <div className="flex flex-col">
                      <span className="text-[8px] uppercase font-black opacity-30">Status</span>
                      <span className="text-[10px] font-bold text-red-700">{bug.status}</span>
                   </div>
                </div>
                <div className="p-2 bg-red-100/50 rounded border border-red-200 flex items-center gap-2">
                   <User className="w-4 h-4 text-red-900/40" />
                   <div className="flex flex-col">
                      <span className="text-[8px] uppercase font-black opacity-30">Gemeldet</span>
                      <span className="text-[10px] font-bold">{new Date(bug.createdAt).toLocaleDateString()}</span>
                   </div>
                </div>
             </div>

             <div className="mt-auto pt-2 flex gap-2">
                <button className="flex-1 py-2 bg-red-600 text-white text-[10px] font-black uppercase rounded shadow-lg border border-red-800">
                   Fehler Beheben
                </button>
                <div className="flex gap-1">
                   <button className="p-2 bg-red-100 rounded text-red-600 hover:bg-red-200 transition-colors border border-red-200">
                      <MessageCircle className="w-4 h-4" />
                   </button>
                   <button className="p-2 bg-red-100 rounded text-red-600 hover:bg-red-200 transition-colors border border-red-200">
                      <MoreHorizontal className="w-4 h-4" />
                   </button>
                </div>
             </div>
          </div>
        )}
      </CardShell>
    </div>
  );
};
