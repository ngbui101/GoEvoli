import React, { useEffect, useState } from 'react';
import { boardApi } from '../../api/board';
import { StoryCard } from '../cards/StoryCard';
import { CardOverlay } from '../cards/CardOverlay';
import type { UserStory, Task } from '../../types';

interface StoryDetailModalProps {
  story: UserStory;
  tasks?: Task[]; // Make optional or handle properly
  onClose: () => void;
  onUpdate?: () => Promise<void>;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({ story, tasks: initialTasks, onClose, onUpdate }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [isLoading, setIsLoading] = useState(!initialTasks);

  useEffect(() => {
    (window as any).onDeleteStory = async (id: string) => {
      if (confirm('Bist du sicher, dass du diese Story löschen möchtest?')) {
        try {
          await boardApi.deleteStory(id);
          // @ts-ignore
          import('react-hot-toast').then(({ default: toast }) => toast.success('Story gelöscht'));
          onUpdate?.();
          onClose();
        } catch (error) {
          console.error('Failed to delete story', error);
        }
      }
    };
    return () => { delete (window as any).onDeleteStory; };
  }, [onUpdate, onClose]);

  useEffect(() => {
    if (initialTasks) return;
    
    const fetchData = async () => {
      try {
        const t = await boardApi.getTasks(story.id);
        setTasks(t);
      } catch (error) {
        console.error('Failed to fetch details', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [story.id, initialTasks]);

  return (
    <CardOverlay
      isOpen={true}
      onClose={onClose}
    >
      {!isLoading && (
        <StoryCard 
          story={story} 
          tasks={tasks} 
          size="active" 
          onClick={() => {}}
        />
      )}
    </CardOverlay>
  );
};
