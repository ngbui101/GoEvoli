import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useDraggable } from '@dnd-kit/core';
import { CardShell } from '../cards/CardShell';
import { CardArtwork, resolveTaskArtwork } from '../cards/CardArtwork';
import type { CardSize } from '../cards/CardShell';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/cn';
import { Bug, Cog, Paintbrush, ShieldCheck } from 'lucide-react';
import type { Task } from '../../types';

interface TaskCardProps {
  task: Task;
  isMobile?: boolean;
  projectId: string;
  onDelete?: (id: string) => void;
  className?: string;
  size?: CardSize;
}

const statusVariants: Record<string, any> = {
  DONE: 'success',
  DOING: 'primary',
  NEXT: 'info',
  BACKLOG: 'secondary',
  TEST: 'warning',
  BLOCKED: 'danger',
};

const typeStoneStyles: Record<string, string> = {
  BUG: "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]",
  FUNCTIONALITY: "bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.4)]",
  UI_UX: "bg-pink-500 shadow-[0_0_8px_rgba(236,72,153,0.4)]",
  STABILITY: "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
};

export const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  isMobile = false, 
  projectId, 
  onDelete,
  className,
  size = "board"
}) => {
  const navigate = useNavigate();
  const isBoard = size === "board";
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { type: 'Task', task },
    disabled: !isBoard,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 999 : 10,
    position: isDragging ? 'relative' : undefined,
  } as React.CSSProperties : undefined;

  const getTypeIcon = (iconSize = "w-3 h-3") => {
    switch (task.type) {
      case 'BUG': return <Bug className={cn(iconSize, "text-white")} />;
      case 'FUNCTIONALITY': return <Cog className={cn(iconSize, "text-white")} />;
      case 'UI_UX': return <Paintbrush className={cn(iconSize, "text-white")} />;
      case 'STABILITY': return <ShieldCheck className={cn(iconSize, "text-white")} />;
      default: return null;
    }
  };

  const headerRight = (
    <div className={cn("flex items-center", isBoard ? "gap-[2.5cqw]" : "gap-1")}>
      <div className={cn(
        "rounded-full flex items-center justify-center border border-white/20 shadow-sm",
        typeStoneStyles[task.type],
        isBoard ? "w-[10cqw] h-[10cqw]" : "w-6 h-6"
      )}>
        <span className={isBoard ? "scale-75" : "scale-100"}>{getTypeIcon(isBoard ? "w-[6.25cqw] h-[6.25cqw]" : "w-4 h-4")}</span>
      </div>
      <div className={cn(
        "px-1 rounded-sm bg-[#925D3B] flex items-center justify-center border border-[#4D3122]/20",
        isBoard ? "min-w-[10cqw] h-[10cqw]" : "min-w-[24px] h-6 px-2"
      )}>
        <span className={cn("font-black text-[#F7E6B2]", isBoard ? "text-[4.3cqw]" : "text-[10px]")}>{task.workload}</span>
      </div>
    </div>
  );

  const meta = (
    <div className="flex justify-between items-center w-full px-1">
      <div className={cn("flex items-center", isBoard ? "gap-[2.5cqw]" : "gap-1")}>
         <div className={cn("rounded-full", isBoard ? "w-[3.75cqw] h-[3.75cqw]" : "w-2.5 h-2.5", task.priority === 'CRITICAL' ? 'bg-red-500' : 'bg-evoli-primary/40')} />
         <span className={cn("font-black uppercase text-evoli-text/40", isBoard ? "text-[4.3cqw]" : "text-[10px]")}>{task.priority}</span>
      </div>
      <Badge variant={statusVariants[task.status] ?? 'secondary'} size="sm" className={cn("uppercase font-black px-1 py-0", isBoard ? "text-[4.3cqw] h-5" : "text-[10px] h-5")}>
        {task.status}
      </Badge>
    </div>
  );

  const artworkInfo = resolveTaskArtwork(task.type);

  const artwork = (
    <CardArtwork
      imageName={artworkInfo.file}
      imageLabel={artworkInfo.label}
      holo={artworkInfo.holo}
      status={'TASK' as any}
      isBoard={isBoard}
    />
  );

  const [activeTab, setActiveTab] = React.useState<'zusammenfassung' | 'beschreibung' | 'assigned' | 'löschen'>('zusammenfassung');

  return (
    <div ref={setNodeRef} style={style} {...(isBoard ? listeners : {})} {...(isBoard ? attributes : {})}>
      <CardShell
        size={size}
        title={task.title}
        headerRight={headerRight}
        artwork={artwork}
        meta={meta}
        onClick={() => {
          if (isDragging) return;
          if (isBoard) {
             navigate(`/projects/${projectId}/tasks/${task.id}`);
          }
        }}
        className={cn(
          isDragging && "opacity-50 rotate-3 z-[100]",
          isBoard && "cursor-grab active:cursor-grabbing",
          className
        )}
        footer={
          <div className="flex flex-col gap-1.5 w-full">
            <div className="h-1 w-full bg-evoli-secondary/20 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  task.status === 'DONE' ? "bg-emerald-500" : "bg-evoli-primary"
                )}
                style={{ width: task.status === 'DONE' ? '100%' : '30%' }}
              />
            </div>
            <div className={cn("flex justify-between items-center w-full font-black uppercase text-evoli-text/30", isBoard ? "text-[3.5cqw]" : "text-[7px]")}>
               <span>{new Date(task.createdAt).toLocaleDateString()}</span>
               <span className="truncate ml-2">Trainer: Admin</span>
            </div>
          </div>
        }
      >
        {isBoard ? (
          <div className="flex flex-col h-full justify-between">
             <div className="relative">
                <p className={cn("line-clamp-2 font-medium text-evoli-text leading-tight italic", isBoard ? "text-[4.3cqw] mb-[2.5cqh]" : "text-[9px] mb-1")}>
                  "{task.description || "Keine Beschreibung verfügbar."}"
                </p>
             </div>
             
             <div className={cn("flex items-center border-t border-evoli-primary/5", isBoard ? "gap-[2.5cqw] pt-[2.5cqh]" : "gap-1 pt-1")}>
                <div className="flex -space-x-1">
                   {task.assigned?.slice(0, 5).map((u, i) => (
                     <div key={i} className={cn("rounded-full bg-evoli-primary/10 border border-evoli-primary/20", isBoard ? "w-[4.5cqw] h-[4.5cqw]" : "w-3 h-3")} title={u.name} />
                   )) || (
                     <div className={cn("rounded-full bg-evoli-primary/5 border border-evoli-primary/10", isBoard ? "w-[3.75cqw] h-[3.75cqw]" : "w-1.5 h-1.5")} />
                   )}
                </div>
                <span className={cn("font-black uppercase text-evoli-text/20 tracking-tighter ml-2", isBoard ? "text-[3.1cqw]" : "text-[5px]")}>
                  {task.assigned?.length ? `${task.assigned.length} Trainer` : 'Bereit'}
                </span>
             </div>
          </div>
        ) : (
          <div className="flex flex-col h-full gap-2">
             <div className="flex gap-1 border-b border-evoli-primary/10 mb-2">
                {['zusammenfassung', 'beschreibung', 'assigned', 'löschen'].map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={cn(
                      "text-[7px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all",
                      activeTab === tab ? "border-evoli-primary text-evoli-primary" : "border-transparent text-evoli-text/30"
                    )}
                  >
                    {tab}
                  </button>
                ))}
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {activeTab === 'zusammenfassung' && (
                  <div className="p-3 bg-white/40 rounded-md border border-evoli-primary/5">
                     <p className="text-[10px] leading-relaxed text-evoli-text/80 font-medium italic">
                       Die Aufgabe <span className="font-black text-evoli-primary">"{task.title}"</span> gehört zur Kategorie <span className="font-black text-evoli-primary">{task.type}</span>, 
                       hat einen Workload von <span className="font-black text-evoli-primary">{task.workload} Stunden</span> und die Priorität <span className="font-black text-evoli-primary">{task.priority}</span>. 
                       Sie befindet sich aktuell im Status <span className="font-black text-evoli-primary uppercase">{task.status}</span>.
                     </p>
                  </div>
                )}

                {activeTab === 'beschreibung' && (
                  <div className="space-y-1">
                     <div className="text-[7px] font-black uppercase text-evoli-text/40">Aufgabenstellung</div>
                     <p className="text-[9px] leading-relaxed text-evoli-text/80 italic bg-white/30 p-3 rounded-md border border-evoli-primary/5">
                        "{task.description || "Keine detaillierte Beschreibung hinterlegt."}"
                     </p>
                  </div>
                )}

                {activeTab === 'assigned' && (
                  <div className="space-y-2">
                     <div className="text-[7px] font-black uppercase text-evoli-text/40 mb-1">Zugewiesene Trainer</div>
                     {task.assigned && task.assigned.length > 0 ? (
                        <div className="space-y-1.5">
                           {task.assigned.slice(0, 5).map(user => (
                             <div key={user.id} className="flex items-center gap-2 p-2 bg-white/30 rounded border border-evoli-primary/5">
                                <div className="w-5 h-5 rounded-full bg-evoli-primary/10 flex items-center justify-center text-[8px] font-black text-evoli-primary border border-evoli-primary/20">
                                   {user.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                   <span className="text-[9px] font-black text-evoli-text leading-none">{user.name}</span>
                                   <span className="text-[7px] opacity-40 leading-none">{user.email}</span>
                                </div>
                             </div>
                           ))}
                        </div>
                     ) : (
                        <div className="text-center py-4 text-[9px] opacity-20 uppercase font-black">Kein Trainer zugewiesen</div>
                     )}
                  </div>
                )}

                {activeTab === 'löschen' && (
                  <div className="h-full flex flex-col items-center justify-center p-4 text-center space-y-4">
                     <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 border border-red-100 shadow-sm">
                        <Bug className="w-6 h-6" />
                     </div>
                     <div className="space-y-1">
                        <h3 className="text-[10px] font-black uppercase text-evoli-text">Karte vernichten?</h3>
                        <p className="text-[8px] text-evoli-text/40 leading-relaxed">
                           Diese Aktion kann nicht rückgängig gemacht werden. Der Task wird permanent aus der Story entfernt.
                        </p>
                     </div>
                     <button 
                       onClick={() => onDelete?.(task.id)}
                       className="w-full py-2 bg-red-500 hover:bg-red-600 text-white text-[9px] font-black uppercase rounded shadow-lg transition-colors border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
                     >
                        Task löschen
                     </button>
                  </div>
                )}
             </div>
          </div>
        )}
      </CardShell>
    </div>
  );
};
