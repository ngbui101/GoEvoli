import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { boardApi } from '../api/board';
import toast from 'react-hot-toast';
import { CardEditor } from '../components/cards/CardEditor';
import { CardOverlay } from '../components/cards/CardOverlay';

export const CreateStory: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [stories, setStories] = React.useState<any[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    if (projectId) {
      boardApi.getStories(projectId).then(setStories);
    }
  }, [projectId]);

  const handleClose = () => navigate(`/projects/${projectId}/board`);

  const handleSave = async (data: any, type: 'story' | 'task') => {
    if (!projectId) return;
    try {
      if (type === 'story') {
        await boardApi.createStory(projectId, { 
          title: data.title, 
          description: data.description, 
          priority: data.priority || 'MEDIUM' 
        });
        toast.success('User Story erfolgreich beschworen!');
      } else {
        await boardApi.createTask(data.storyId, {
          title: data.title,
          description: data.description,
          type: data.type || 'FUNCTIONALITY',
          priority: data.priority || 'MEDIUM',
          workload: data.workload || 1
        });
        toast.success('Task erfolgreich erstellt!');
      }
      handleClose();
    } catch (error: any) {
      toast.error(error.message || `Fehler beim Erstellen der ${type === 'story' ? 'Story' : 'Karte'}`);
    }
  };

  return (
    <CardOverlay isOpen={true} onClose={handleClose}>
      <CardEditor 
        variant="task"
        stories={stories}
        onSave={handleSave}
        onCancel={handleClose}
      />
    </CardOverlay>
  );
};
