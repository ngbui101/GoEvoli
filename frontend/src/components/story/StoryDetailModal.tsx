import React, { useEffect, useState } from 'react';
import { boardApi } from '../../api/board';
import { StoryCard } from '../cards/StoryCard';
import { CardOverlay } from '../cards/CardOverlay';
import type { UserStory, Task } from '../../types';
import toast from 'react-hot-toast';

interface StoryDetailModalProps {
  story: UserStory;
  tasks?: Task[];
  onClose: () => void;
  onUpdate?: () => Promise<void>;
}

export const StoryDetailModal: React.FC<StoryDetailModalProps> = ({ story, tasks: initialTasks, onClose, onUpdate }) => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks || []);
  const [isLoading, setIsLoading] = useState(!initialTasks);

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

  const handleDeleteStory = async (id: string) => {
    if (!confirm('Bist du sicher, dass du diese Story löschen möchtest?')) return;
    try {
      await boardApi.deleteStory(id);
      toast.success('Story gelöscht');
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Failed to delete story', error);
      toast.error('Story konnte nicht gelöscht werden');
    }
  };

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
          onDelete={handleDeleteStory}
        />
      )}
    </CardOverlay>
  );
};
