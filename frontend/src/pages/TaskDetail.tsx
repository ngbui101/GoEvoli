import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { boardApi } from '../api/board';
import type { Task } from '../types';
import { AlertCircle } from 'lucide-react';
import { CardOverlay } from '../components/cards/CardOverlay';
import { TaskCard } from '../components/cards/TaskCard';
import { Button } from '../components/ui/Button';
import toast from 'react-hot-toast';

export const TaskDetail: React.FC = () => {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const [task, setTask] = useState<Task | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTask = async () => {
      if (!projectId || !taskId) return;
      try {
        const stories = await boardApi.getStories(projectId);
        let foundTask: Task | null = null;
        
        for (const story of stories) {
          const tasks = await boardApi.getTasks(story.id);
          const t = tasks.find(item => item.id === taskId);
          if (t) {
            foundTask = t;
            break;
          }
        }
        
        setTask(foundTask);
      } catch (error) {
        console.error("Task-Details konnten nicht geladen werden", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTask();
  }, [projectId, taskId]);

  const handleClose = () => navigate(`/projects/${projectId}/board`);

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Bist du sicher, dass du diesen Task löschen möchtest?')) return;
    try {
      await boardApi.deleteTask(id);
      toast.success('Task gelöscht');
      handleClose();
    } catch (error) {
      console.error('Failed to delete task', error);
      toast.error('Task konnte nicht gelöscht werden');
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-evoli-bg/80 backdrop-blur-md flex flex-col items-center justify-center z-[200]">
        <div className="w-16 h-16 border-4 border-evoli-primary border-t-transparent rounded-full animate-spin mb-6 shadow-lg"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-evoli-primary animate-pulse">Analysiere Karte...</p>
      </div>
    );
  }

  if (!task) {
    return (
      <CardOverlay isOpen={true} onClose={handleClose}>
        <div className="p-16 text-center space-y-8 bg-white/90 rounded-evoli-card border-4 border-red-500/20">
          <AlertCircle className="w-20 h-20 text-red-500 mx-auto" />
          <h2 className="text-2xl font-black text-evoli-text uppercase tracking-tighter">Karte nicht gefunden</h2>
          <Button onClick={handleClose} className="px-10 py-5">Zurück zum Spielfeld</Button>
        </div>
      </CardOverlay>
    );
  }

  return (
    <CardOverlay 
      isOpen={true} 
      onClose={handleClose} 
    >
      {task && (
        <TaskCard 
          task={task} 
          projectId={projectId || ''} 
          size="active"
          onDelete={handleDeleteTask}
        />
      )}
    </CardOverlay>
  );
};
