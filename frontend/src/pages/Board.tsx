import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { boardApi } from '../api/board';
import { projectsApi } from '../api/projects';
import type { UserStory, Task, Project, TaskStatus, Bug, Severity, EntityType } from '../types';
import { Swimlane } from '../components/board/Swimlane';
import { StoryDetailModal } from '../components/story/StoryDetailModal';
import { Loader2, Plus, Search, Settings, LayoutDashboard, Bug as BugIcon, ShieldAlert, XCircle } from 'lucide-react';
import { clsx } from 'clsx';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Panel } from '../components/ui/Panel';
import { PageHeader } from '../components/layout/PageHeader';
import { Modal } from '../components/ui/Modal';
import { BugCard } from '../components/cards/BugCard';

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
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isBugModalOpen, setIsBugModalOpen] = useState(false);
  const [isSubmittingBug, setIsSubmittingBug] = useState(false);
  const [closingBugId, setClosingBugId] = useState<string | null>(null);
  const [bugForm, setBugForm] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM' as Severity,
    blocksWork: true,
    affectedEntity: '',
  });
  const navigate = useNavigate();

  const fetchData = useCallback(async () => {
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
      const fetchedBugs = await boardApi.getBugs(projectId) || [];
      setBugs(fetchedBugs);
    } catch (error: any) {
      console.error("Board fetch error:", error);
      toast.error(error.message || 'Failed to load board data');
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  const entityOptions = stories.flatMap(story => {
    const taskOptions = (tasksByStory[story.id] || []).map(task => ({
      label: `TASK: ${task.title}`,
      value: `TASK:${task.id}`,
    }));

    return [
      { label: `STORY: ${story.title}`, value: `USER_STORY:${story.id}` },
      ...taskOptions,
    ];
  });

  const openBugModal = () => {
    setBugForm({
      title: '',
      description: '',
      severity: 'MEDIUM',
      blocksWork: true,
      affectedEntity: entityOptions[0]?.value || '',
    });
    setIsBugModalOpen(true);
  };

  const handleCreateBug = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!projectId || !bugForm.affectedEntity) return;

    const [affectedEntityType, affectedEntityId] = bugForm.affectedEntity.split(':') as [EntityType, string];
    setIsSubmittingBug(true);

    try {
      await boardApi.createBug(projectId, {
        title: bugForm.title.trim(),
        description: bugForm.description.trim(),
        severity: bugForm.severity,
        blocksWork: bugForm.blocksWork,
        affectedEntityType,
        affectedEntityId,
      });
      toast.success('Bug gemeldet');
      setIsBugModalOpen(false);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Bug konnte nicht gemeldet werden');
    } finally {
      setIsSubmittingBug(false);
    }
  };

  const handleCloseBug = async (bugId: string) => {
    setClosingBugId(bugId);
    try {
      await boardApi.closeBug(bugId);
      toast.success('Bug geschlossen');
      setSelectedBug(null);
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Bug konnte nicht geschlossen werden');
    } finally {
      setClosingBugId(null);
    }
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
  const activeBugs = bugs.filter(bug => bug.status !== 'CLOSED');
  const blockingBugs = activeBugs.filter(bug => bug.blocksWork);

  const filteredStories = stories.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (tasksByStory[s.id] || []).some(t => t.title.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="h-screen bg-evoli-bg pt-24 flex flex-col overflow-hidden playmat-bg">
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] playmat-pattern z-0" />
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-tr from-evoli-primary/5 via-transparent to-evoli-primary/5 z-0" />
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
              <Button variant="danger" size="sm" onClick={openBugModal} disabled={entityOptions.length === 0} className="flex items-center justify-center p-2 sm:px-4 sm:py-3">
                <BugIcon className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Bug melden</span>
              </Button>
              <Button size="sm" onClick={() => navigate(`/projects/${projectId}/stories/new`)} className="flex items-center justify-center p-2 sm:px-6 sm:py-3">
                <Plus className="w-4 h-4 sm:mr-3" />
                <span className="hidden sm:inline">Neue Karte</span>
              </Button>
            </div>
          </>
        }
      />
      {activeBugs.length > 0 && (
        <div className="relative z-10 px-3 sm:px-10 pb-3">
          <div className="mx-auto max-w-[1400px] rounded-evoli-card border-2 border-red-300/50 bg-red-50/70 px-3 py-3 shadow-sm">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-red-800">
                <ShieldAlert className="w-4 h-4" />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  Bug Board
                </span>
                <Badge variant="danger" size="sm" className="text-[8px]">
                  {activeBugs.length} offen
                </Badge>
                {blockingBugs.length > 0 && (
                  <Badge variant="danger" size="sm" className="text-[8px]">
                    {blockingBugs.length} blockierend
                  </Badge>
                )}
              </div>
              <Button variant="danger" size="sm" onClick={openBugModal} className="px-3 py-1 text-[10px]">
                <Plus className="w-3 h-3 mr-1" /> Bug melden
              </Button>
            </div>
            <div className="flex gap-3 overflow-x-auto custom-scrollbar pb-1">
              {activeBugs.map(bug => (
                <div key={bug.id} className="w-[150px] flex-shrink-0">
                  <BugCard bug={bug} onClick={() => setSelectedBug(bug)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-auto pt-0 pb-2 custom-scrollbar overscroll-x-contain">
        <div className="min-w-max w-full flex sm:justify-center px-3 sm:px-10">
          <div className="w-max">
          <div className="pt-0 pb-2 mb-2 border-b border-evoli-card-border/5">
            <div className="flex gap-3 sm:gap-2">
              <div className="w-[184px] sm:w-[168px] flex-shrink-0">
                <div className="px-1 py-1 bg-evoli-primary/10 text-evoli-primary rounded-evoli-card border border-evoli-primary/20 shadow-sm flex items-center justify-center h-full">
                  <span className="text-[10px] font-black uppercase tracking-tight">User Story</span>
                </div>
              </div>
              <div className="flex gap-3 sm:gap-2 flex-1 snap-x snap-mandatory">
                {COLUMNS.map(col => {
                  const wipLimit = col.id === 'NEXT' ? project?.wipLimits.next : col.id === 'DOING' ? project?.wipLimits.doing : undefined;
                  const wipCount = col.id === 'NEXT' ? nextCount : col.id === 'DOING' ? doingCount : undefined;
                  const isWipWarning = wipLimit !== undefined && wipCount !== undefined && wipCount > wipLimit;
                  
                  return (
                    <div key={col.id} className={clsx(
                      "w-[190px] sm:w-[168px] flex-shrink-0 flex items-center justify-between px-2 py-2 rounded-evoli-card border-2 shadow-sm transition-all duration-300 snap-start",
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
              <div className="space-y-10 sm:space-y-16">
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

      {selectedBug && (
        <Modal isOpen={true} onClose={() => setSelectedBug(null)} title="Bug Details" maxWidth="md">
          <div className="p-6 flex justify-center">
            <BugCard
              bug={selectedBug}
              size="active"
              onCloseBug={handleCloseBug}
              isClosing={closingBugId === selectedBug.id}
            />
          </div>
        </Modal>
      )}

      <Modal isOpen={isBugModalOpen} onClose={() => setIsBugModalOpen(false)} title="Bug melden" maxWidth="lg">
        <form onSubmit={handleCreateBug} className="p-6 space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5 sm:col-span-2">
              <span className="block text-xs font-black uppercase tracking-widest text-evoli-text/70">Titel</span>
              <input
                className="w-full rounded-evoli border border-evoli-primary/20 bg-evoli-secondary/30 px-4 py-3 text-sm font-bold text-evoli-text outline-none focus:border-evoli-primary focus:ring-2 focus:ring-evoli-primary/20"
                value={bugForm.title}
                onChange={event => setBugForm({ ...bugForm, title: event.target.value })}
                required
              />
            </label>
            <label className="space-y-1.5">
              <span className="block text-xs font-black uppercase tracking-widest text-evoli-text/70">Betroffene Karte</span>
              <select
                className="evoli-select w-full"
                value={bugForm.affectedEntity}
                onChange={event => setBugForm({ ...bugForm, affectedEntity: event.target.value })}
                required
              >
                {entityOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="block text-xs font-black uppercase tracking-widest text-evoli-text/70">Schwere</span>
              <select
                className="evoli-select w-full"
                value={bugForm.severity}
                onChange={event => setBugForm({ ...bugForm, severity: event.target.value as Severity })}
              >
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </label>
            <label className="space-y-1.5 sm:col-span-2">
              <span className="block text-xs font-black uppercase tracking-widest text-evoli-text/70">Beschreibung</span>
              <textarea
                className="min-h-[120px] w-full resize-none rounded-evoli border border-evoli-primary/20 bg-evoli-secondary/30 px-4 py-3 text-sm font-medium text-evoli-text outline-none focus:border-evoli-primary focus:ring-2 focus:ring-evoli-primary/20"
                value={bugForm.description}
                onChange={event => setBugForm({ ...bugForm, description: event.target.value })}
                required
              />
            </label>
            <label className="flex items-center gap-3 rounded-evoli border border-red-200 bg-red-50/60 px-4 py-3 sm:col-span-2">
              <input
                type="checkbox"
                className="h-4 w-4 accent-red-600"
                checked={bugForm.blocksWork}
                onChange={event => setBugForm({ ...bugForm, blocksWork: event.target.checked })}
              />
              <span className="text-xs font-black uppercase tracking-widest text-red-700">Blockiert Arbeit</span>
            </label>
          </div>
          <div className="flex justify-end gap-3">
            <Button type="button" variant="ghost" onClick={() => setIsBugModalOpen(false)}>
              <XCircle className="w-4 h-4 mr-2" /> Abbrechen
            </Button>
            <Button type="submit" variant="danger" isLoading={isSubmittingBug} disabled={!bugForm.title.trim() || !bugForm.description.trim() || !bugForm.affectedEntity}>
              <BugIcon className="w-4 h-4 mr-2" /> Bug speichern
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
