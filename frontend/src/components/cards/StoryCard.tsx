import React from 'react';
import type { UserStory, Task } from '../../types';
import { Bug, Shield, Sparkles, ShieldCheck, Zap } from 'lucide-react';
import { Badge } from '../ui/Badge';
import { CardShell } from '../cards/CardShell';
import { CardArtwork, resolveStoryArtwork } from '../cards/CardArtwork';
import type { CardSize } from '../cards/CardShell';
import { cn } from '../../utils/cn';

interface StoryCardProps {
  story: UserStory;
  tasks: Task[];
  onClick?: (story: UserStory) => void;
  onDelete?: (id: string) => void;
  className?: string;
  size?: CardSize;
}

const statusVariants: Record<string, any> = {
  EGG: 'secondary',
  EVOLVING: 'primary',
  READY_FOR_TEST: 'warning',
  FINAL_EVOLUTION: 'info',
  BLOCKED: 'danger',
  DONE: 'success',
};

const priorityStyles: Record<string, string> = {
  LOW: 'border-blue-500/30 text-blue-700 bg-blue-50',
  MEDIUM: 'border-yellow-500/30 text-yellow-700 bg-yellow-50',
  HIGH: 'border-orange-500/30 text-orange-700 bg-orange-50',
  CRITICAL: 'border-red-500/30 text-red-700 bg-red-50',
};

const categoryIcons: Record<string, React.ReactNode> = {
  UI_UX: <Sparkles className="w-3.5 h-3.5" />,
  FUNCTIONALITY: <Zap className="w-3.5 h-3.5" />,
  SECURITY: <Shield className="w-3.5 h-3.5" />,
  STABILITY: <ShieldCheck className="w-3.5 h-3.5" />,
};

const categoryLabels: Record<string, string> = {
  UI_UX: "Design",
  FUNCTIONALITY: "Funktion",
  SECURITY: "Sicherheit",
  STABILITY: "Stabilität",
};

export const StoryCard: React.FC<StoryCardProps> = ({ 
  story, 
  tasks, 
  onClick,
  onDelete,
  className,
  size = "board"
}) => {
  const isBoard = size === "board";
  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'DONE').length;
  const progress = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const categoryCounts = tasks.reduce((acc, task) => {
    if (task.type === 'UI_UX') acc.UI_UX = (acc.UI_UX || 0) + 1;
    if (task.type === 'FUNCTIONALITY') acc.FUNCTIONALITY = (acc.FUNCTIONALITY || 0) + 1;
    if (task.type === 'STABILITY') acc.STABILITY = (acc.STABILITY || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const dominantCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0];
  const hasBug = tasks.some(t => t.type === 'BUG');

  // Artwork-Logik: Ei → Evoli (bei Doing) → Entwicklung (alle fertig)
  const hasDoing = tasks.some(t => t.status === 'DOING');
  const allDone  = totalTasks > 0 && doneTasks === totalTasks;
  const artworkInfo = resolveStoryArtwork(story.status, hasDoing, allDone, story.id);

  const headerRight = (
    <div className={cn("flex items-center", isBoard ? "gap-[2.5cqw]" : "gap-1")}>
      {hasBug && <Bug className={cn("text-red-500 animate-pulse", isBoard ? "w-[6.25cqw] h-[6.25cqw]" : "w-2.5 h-2.5")} />}
      <div className={cn(
        "rounded-sm border-b font-black uppercase tracking-tighter shadow-sm",
        isBoard ? "px-[3.75cqw] py-[1.25cqh] text-[5cqw]" : "px-1.5 py-0.5 text-[8px]",
        priorityStyles[story.priority]
      )}>
        {story.priority.slice(0, 3)}
      </div>
    </div>
  );

  const meta = (
    <div className="flex justify-between items-center w-full px-1">
      <div className={cn("flex items-center", isBoard ? "gap-[2.5cqw]" : "gap-1")}>
        <Badge variant={statusVariants[story.status] ?? "primary"} size="sm" className={cn("font-black uppercase tracking-tighter", isBoard ? "text-[4.3cqw] px-[2.5cqw] py-0 h-[1.8cqh]" : "text-[7px] px-1 py-0 h-3")}>
          {story.status.slice(0, 5)}
        </Badge>
      </div>
      <div className={cn("flex items-center", isBoard ? "gap-[2.5cqw]" : "gap-1")}>
         {dominantCategory && (
           <div className={cn("flex items-center bg-white/40 rounded-full border border-evoli-primary/5", isBoard ? "gap-[2.5cqw] px-[2.5cqw] py-0" : "gap-1 px-1 py-0")}>
              <span className="text-evoli-primary scale-75">{categoryIcons[dominantCategory]}</span>
              <span className={cn("font-black uppercase text-evoli-text/60", isBoard ? "text-[3.75cqw]" : "text-[6px]")}>{categoryLabels[dominantCategory]}</span>
           </div>
         )}
      </div>
    </div>
  );

  const [activeTab, setActiveTab] = React.useState<'beschreibung' | 'tasks' | 'bugs' | 'activity' | 'löschen'>('beschreibung');

  return (
    <CardShell
      size={size}
      title={story.title}
      headerRight={headerRight}
      artwork={
        <CardArtwork
          imageName={artworkInfo.file}
          imageLabel={artworkInfo.label}
          holo={artworkInfo.holo}
          status={story.status}
          isBoard={isBoard}
        />
      }
      meta={meta}
      onClick={() => onClick?.(story)}
      className={className}
      footer={
        <div className="flex flex-col gap-1.5 w-full">
          <div className="h-1 w-full bg-evoli-secondary/20 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all duration-1000 ease-out",
                progress === 100 ? "bg-emerald-500" : "bg-evoli-primary"
              )}
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className={cn("flex justify-between items-center w-full font-black uppercase text-evoli-text/30", isBoard ? "text-[3.5cqw]" : "text-[7px]")}>
             <span>{new Date(story.createdAt).toLocaleDateString()}</span>
             <span className="truncate ml-2">Trainer: Admin</span>
          </div>
        </div>
      }
    >
      {isBoard ? (
        <div className="flex flex-col h-full justify-between">
            <p className={cn("line-clamp-3 font-medium leading-tight text-evoli-text/80 italic", isBoard ? "text-[3.75cqw] mb-[2.5cqh]" : "text-[6px] mb-1")}>
              "{story.description}"
            </p>
          
          <div className={cn("flex flex-col border-t border-evoli-primary/5", isBoard ? "gap-[1.25cqh] pt-[2.5cqh]" : "gap-0.5 pt-1")}>
             <div className={cn("flex justify-between font-black uppercase text-evoli-text/30", isBoard ? "text-[3.1cqw]" : "text-[5px]")}>
                <span>Progress</span>
                <span>{doneTasks}/{totalTasks}</span>
             </div>
             <div className={cn("flex items-center", isBoard ? "gap-[2.5cqw]" : "gap-1")}>
                <span className={cn("opacity-40 truncate", isBoard ? "text-[3.1cqw]" : "text-[5px]")}>Admin</span>
             </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col h-full gap-2">
           <div className="flex gap-1 border-b border-evoli-primary/10 mb-2">
              {['beschreibung', 'tasks', 'bugs', 'activity', 'löschen'].map(tab => (
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
              {activeTab === 'beschreibung' && (
                <div className="space-y-4 h-full flex flex-col">
                   <div className="space-y-1 flex-1">
                      <div className="text-[7px] font-black uppercase text-evoli-text/40">Beschreibung</div>
                      <p className="text-[7px] leading-relaxed text-evoli-text/80 italic bg-white/30 p-2 rounded border border-evoli-primary/5 h-full">
                         "{story.description}"
                      </p>
                   </div>
                </div>
              )}

              {activeTab === 'tasks' && (
                <div className="space-y-2">
                   {tasks.filter(t => t.type !== 'BUG').map(t => (
                     <div key={t.id} className="p-2 bg-white/30 border border-evoli-primary/5 rounded flex justify-between items-center">
                        <span className="text-[10px] font-bold truncate pr-2">{t.title}</span>
                        <Badge size="sm" variant={t.status === 'DONE' ? 'success' : 'secondary'} className="text-[7px] h-3 px-1">{t.status.slice(0, 4)}</Badge>
                     </div>
                   ))}
                </div>
              )}

              {activeTab === 'bugs' && (
                <div className="space-y-2">
                   {tasks.filter(t => t.type === 'BUG').map(t => (
                     <div key={t.id} className="p-2 bg-red-50/50 border border-red-100 rounded flex justify-between items-center">
                        <span className="text-[10px] font-bold text-red-900 truncate pr-2">{t.title}</span>
                        <Badge size="sm" variant="danger" className="text-[7px] h-3 px-1">BUG</Badge>
                     </div>
                   ))}
                </div>
              )}

              {activeTab === 'activity' && (
                <div className="text-center py-4 text-[9px] opacity-20 uppercase font-black">Coming Soon</div>
              )}

              {activeTab === 'löschen' && (
                <div className="h-full flex flex-col items-center justify-center p-4 text-center space-y-4">
                   <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 border border-red-100 shadow-sm">
                      <Bug className="w-6 h-6" />
                   </div>
                   <div className="space-y-1">
                      <h3 className="text-[10px] font-black uppercase text-evoli-text">Karte vernichten?</h3>
                      <p className="text-[8px] text-evoli-text/40 leading-relaxed">
                         Diese Aktion kann nicht rückgängig gemacht werden. Die Story wird permanent aus dem Spielfeld entfernt.
                      </p>
                   </div>
                   <button 
                     onClick={() => onDelete?.(story.id)}
                     className="w-full py-2 bg-red-500 hover:bg-red-600 text-white text-[9px] font-black uppercase rounded shadow-lg transition-colors border-b-4 border-red-800 active:border-b-0 active:translate-y-1"
                   >
                      Story löschen
                   </button>
                </div>
              )}
           </div>
        </div>
      )}
    </CardShell>
  );
};
