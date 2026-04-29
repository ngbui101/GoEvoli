import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { boardApi } from '../api/board';
import { projectsApi } from '../api/projects';
import type { UserStory, Task, Project, TaskStatus } from '../types';
import { Swimlane } from '../components/board/Swimlane';
import { StoryDetailModal } from '../components/story/StoryDetailModal';
import { Loader2, Plus, Search, Settings, LayoutDashboard } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Panel } from '../components/ui/Panel';
import { PageHeader } from '../components/layout/PageHeader';

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: 'BACKLOG', title: 'Backlog' },
  { id: 'NEXT', title: 'Next' },
  { id: 'DOING', title: 'Doing' },
  { id: 'TEST', title: 'Test' },
  { id: 'DONE', title: 'Done' },
];

export const Board: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [stories, setStories] = useState<UserStory[]>([]);
  const [tasksByStory, setTasksByStory] = useState<Record<string, Task[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const fetchData = async () => {
    if (!projectId) return;
    setIsLoading(true);
    try {
      const p = await projectsApi.getById(projectId);
      setProject(p);

      const fetchedStories = await boardApi.getStories(projectId) || [];
      setStories(fetchedStories);

      const tasksMap: Record<string, Task[]> = {};
      const tasksResults = await Promise.all(
        fetchedStories.map(story => boardApi.getTasks(story.id).then(t => t || []))
      );
      
      fetchedStories.forEach((story, index) => {
        tasksMap[story.id] = tasksResults[index];
      });

      setTasksByStory(tasksMap);
    } catch (error: any) {
      console.error("Board fetch error:", error);
      toast.error(error.message || 'Failed to load board data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const handleTaskMove = async (storyId: string, taskId: string, targetStatus: TaskStatus) => {
    try {
      setTasksByStory(prev => {
        const newMap = { ...prev };
        const tasks = [...(newMap[storyId] || [])];
        const taskIdx = tasks.findIndex(t => t.id === taskId);
        if (taskIdx > -1) {
          tasks[taskIdx] = { ...tasks[taskIdx], status: targetStatus };
          newMap[storyId] = tasks;
        }
        return newMap;
      });

      await boardApi.moveTask(taskId, targetStatus);
      toast.success('Task moved');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to move task');
      fetchData();
    }
  };

  const handleStoryClick = (story: UserStory) => {
    setSelectedStory(story);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-evoli-bg flex flex-col items-center justify-center">
        <Loader2 className="w-12 h-12 text-evoli-primary animate-spin mb-4" />
        <p className="text-evoli-text/70 font-black animate-pulse uppercase tracking-widest">Lade Spielfeld...</p>
      </div>
    );
  }

  const allTasks = Object.values(tasksByStory).flat();
  const nextCount = allTasks.filter(t => t.status === 'NEXT').length;
  const doingCount = allTasks.filter(t => t.status === 'DOING').length;

  const filteredStories = stories.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tasksByStory[s.id] || []).some(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-screen bg-evoli-bg pt-24 flex flex-col overflow-hidden playmat-bg">
      {/* Playmat Decorative Layer */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] playmat-pattern z-0" />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-tr from-evoli-primary/5 via-transparent to-evoli-primary/5 z-0" />
      {/* Floating Header (Project Info) */}
      <PageHeader 
        title={project?.name || 'Spielfeld'}
        subtitle={project?.description}
        icon={<LayoutDashboard className="w-6 h-6 sm:w-8 sm:h-8" />}
        actions={
          <>
            <div className="relative flex-1 lg:w-80 lg:flex-none">
              <Search className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-evoli-text/30" />
              <input 
                placeholder="Suchen..." 
                className="w-full pl-9 sm:pl-11 pr-3 sm:pr-4 py-2 sm:py-3 bg-white/60 border-2 border-evoli-card-border/10 rounded-evoli-card text-[10px] sm:text-xs focus:outline-none focus:border-evoli-primary/40 transition-all font-black uppercase tracking-widest placeholder:text-evoli-text/20"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
              <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${projectId}/settings`)} className="p-2 sm:p-3">
                <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button size="sm" onClick={() => navigate(`/projects/${projectId}/stories/new`)} className="flex items-center justify-center p-2 sm:px-6 sm:py-3">
                <Plus className="w-4 h-4 sm:mr-3" />
                <span className="hidden sm:inline">Neue Karte</span>
              </Button>
            </div>
          </>
        }
      />

      {/* Scrollable Area (Headers + Body) */}
      <div className="flex-1 overflow-auto pt-0 pb-2">
        <div className="min-w-max w-full flex justify-center px-4 sm:px-10">
          <div className="w-max">
          {/* Global Column Headers - Integrated into the Playmat */}
          <div className="pt-0 pb-2 mb-2 border-b border-evoli-card-border/5">
            <div className="flex gap-2">
              <div className="w-[168px] flex-shrink-0">
                <div className="px-1 py-1 bg-evoli-primary/10 text-evoli-primary rounded-evoli-card border border-evoli-primary/20 shadow-sm flex items-center justify-center h-full">
                  <span className="text-[10px] font-black uppercase tracking-tight">User Story</span>
                </div>
              </div>
              <div className="flex gap-2 flex-1">
                {COLUMNS.map(col => {
                  const wipLimit = col.id === 'NEXT' ? project?.wipLimits.next : col.id === 'DOING' ? project?.wipLimits.doing : undefined;
                  const wipCount = col.id === 'NEXT' ? nextCount : col.id === 'DOING' ? doingCount : undefined;
                  const isWipWarning = wipLimit !== undefined && wipCount !== undefined && wipCount >= wipLimit;
                  
                  return (
                    <div key={col.id} className={clsx(
                      "w-[168px] flex-shrink-0 flex items-center justify-between px-2 py-2 rounded-evoli-card border-2 shadow-sm transition-all duration-300",
                      isWipWarning ? "bg-red-50 border-red-400" : "bg-white/40 border-evoli-card-border/10"
                    )}>
                      <span className={clsx(
                        "text-[10px] font-black uppercase tracking-tighter",
                        isWipWarning ? 'text-red-600' : 'text-evoli-text/40'
                      )}>
                        {col.title}
                      </span>
                      {wipLimit !== undefined && (
                        <div className="flex items-center gap-1">
                           <Badge variant={isWipWarning ? 'danger' : 'secondary'} size="sm" className="text-[7px] h-3 px-1">
                            {wipCount}/{wipLimit}
                          </Badge>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Board Body */}
          <div className="space-y-6 pb-20">
            {filteredStories.length === 0 ? (
              <Panel className="flex flex-col items-center justify-center py-32 bg-white/20 border-dashed border-4 border-evoli-card-border/10 rounded-[2rem]">
                <p className="text-evoli-text/30 text-lg font-black uppercase tracking-[0.3em] mb-10">Das Spielfeld ist leer</p>
                <Button 
                  onClick={() => navigate(`/projects/${projectId}/stories/new`)} 
                  variant="primary"
                  className="px-10 py-6 text-sm"
                >
                  <Plus className="w-5 h-5 mr-3" /> Erste Story beschwören
                </Button>
              </Panel>
            ) : (
              <div className="space-y-16">
                {filteredStories.map(story => (
                  <Swimlane
                    key={story.id}
                    story={story}
                    tasks={tasksByStory[story.id] || []}
                    wipCounts={{ next: nextCount, doing: doingCount }}
                    wipLimits={project ? project.wipLimits : { next: 99, doing: 99 }}
                    onTaskMove={(taskId, targetStatus) => handleTaskMove(story.id, taskId, targetStatus)}
                    onStoryClick={handleStoryClick}
                    projectId={projectId!}
                  />
                ))}
              </div>
            )}
          </div>
          </div>
        </div>
      </div>

      {selectedStory && (
        <StoryDetailModal 
          story={selectedStory} 
          tasks={tasksByStory[selectedStory.id] || []} 
          onClose={() => setSelectedStory(null)} 
          onUpdate={fetchData} 
        />
      )}
    </div>
  );
};
