import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Gauge, Save, Settings, Sparkles, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { projectsApi } from '../api/projects';
import type { Project } from '../types';
import { Button } from '../components/ui/Button';
import { CardArtwork, FINAL_EVOLUTIONS } from '../components/cards/CardArtwork';
import { CardOverlay } from '../components/cards/CardOverlay';
import { CardShell } from '../components/cards/CardShell';

export const ProjectSettings: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    wipLimits: {
      next: 5,
      doing: 3
    }
  });

  const evo = React.useMemo(() => {
    const source = projectId || 'settings';
    const hash = source.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FINAL_EVOLUTIONS[hash % FINAL_EVOLUTIONS.length];
  }, [projectId]);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      try {
        const data = await projectsApi.getById(projectId);
        setProject(data);
        setFormData({
          name: data.name,
          description: data.description,
          wipLimits: data.wipLimits
        });
      } catch {
        toast.error('Projekt konnte nicht geladen werden');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProject();
  }, [projectId]);

  const handleClose = () => navigate(`/projects/${projectId}/board`);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId) return;
    try {
      toast.success('Projekt-Konfiguration aktualisiert!');
      navigate(`/projects/${projectId}/board`);
    } catch {
      toast.error('Fehler beim Speichern');
    }
  };

  const handleDeleteComingSoon = () => {
    toast('Projekt löschen kommt bald!');
  };

  if (isLoading) return null;

  return (
    <CardOverlay isOpen={true} onClose={handleClose}>
      <CardShell
        size="active"
        title={
          <input
            className="bg-transparent border-none focus:ring-0 w-full text-[min(16px,3.5cqi)] font-black uppercase tracking-tight text-evoli-text placeholder:text-evoli-text/20 p-0"
            placeholder="Projekt Name..."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            autoFocus
          />
        }
        headerRight={
          <div className="flex items-center gap-1 px-2 py-0.5 bg-evoli-primary/10 rounded-full border border-evoli-primary/20 text-[7px] font-black uppercase tracking-widest text-evoli-primary">
            <Settings className="w-2 h-2" />
            Config
          </div>
        }
        artwork={
          <CardArtwork
            imageName={evo.file}
            imageLabel={evo.label}
            holo={evo.holo}
            status="FINAL_EVOLUTION"
            isBoard={false}
          />
        }
        meta={
          <div className="flex justify-between w-full items-center px-1">
            <span className="text-[8px] font-black uppercase text-evoli-text/40 tracking-widest italic">"{project?.name || 'Projekt'} feinjustieren"</span>
            <div className="flex items-center gap-1">
              <Sparkles className="w-2 h-2 text-evoli-primary" />
              <span className="text-[7px] font-black uppercase text-evoli-primary">Setup</span>
            </div>
          </div>
        }
        footer={
          <div className="flex flex-col items-center justify-center w-full gap-3 pt-1">
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="secondary"
                onClick={handleClose}
                className="flex-1 h-10 text-[9px] uppercase font-black tracking-widest border border-evoli-primary/10"
              >
                Abbrechen
              </Button>
              <Button
                type="submit"
                form="project-settings-form"
                disabled={!formData.name.trim()}
                className="flex-1 h-10 text-[9px] uppercase font-black tracking-widest shadow-lg"
              >
                <Save className="w-3.5 h-3.5 mr-1" />
                Speichern
              </Button>
            </div>
            <p className="text-[7px] font-black uppercase tracking-widest text-evoli-text/20">Projekt Config Tool v2.0</p>
          </div>
        }
        className="shadow-2xl aspect-[63/96]"
      >
        <form id="project-settings-form" onSubmit={handleSubmit} className="h-full min-h-0 overflow-y-auto custom-scrollbar pr-1 flex flex-col gap-2">
          <div className="relative flex-none pt-2">
            <label className="absolute top-0 left-2 px-1 bg-[#FFF6DD] text-[8px] font-black uppercase tracking-widest text-evoli-primary/60 z-10">Beschreibung</label>
            <textarea
              className="w-full h-16 bg-white/40 border border-evoli-primary/10 rounded-md p-3 text-xs font-medium text-evoli-text focus:ring-2 focus:ring-evoli-primary/20 focus:border-evoli-primary/40 transition-all outline-none resize-none"
              placeholder="Beschreibe die Vision deines Projekts..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="bg-white/40 border border-evoli-primary/10 rounded-md p-2 min-h-[58px]">
              <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-evoli-primary/60">
                <Gauge className="w-3 h-3" />
                Next
              </span>
              <input
                type="number"
                min={1}
                value={formData.wipLimits.next}
                onChange={(e) => setFormData({
                  ...formData,
                  wipLimits: { ...formData.wipLimits, next: parseInt(e.target.value) || 1 }
                })}
                className="mt-0.5 w-full bg-transparent text-base font-black text-evoli-text outline-none"
              />
            </label>

            <label className="bg-white/40 border border-evoli-primary/10 rounded-md p-2 min-h-[58px]">
              <span className="flex items-center gap-1 text-[8px] font-black uppercase tracking-widest text-evoli-primary/60">
                <Gauge className="w-3 h-3" />
                Doing
              </span>
              <input
                type="number"
                min={1}
                value={formData.wipLimits.doing}
                onChange={(e) => setFormData({
                  ...formData,
                  wipLimits: { ...formData.wipLimits, doing: parseInt(e.target.value) || 1 }
                })}
                className="mt-0.5 w-full bg-transparent text-base font-black text-evoli-text outline-none"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleDeleteComingSoon}
            className="flex flex-none items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50/50 px-3 py-2 text-left transition hover:bg-red-50"
          >
            <span className="flex items-center gap-2 min-w-0">
              <Trash2 className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span className="min-w-0">
                <span className="block text-[9px] font-black uppercase tracking-widest text-red-800">Projekt löschen</span>
                <span className="block text-[8px] font-black uppercase tracking-widest text-red-700/50">Coming soon</span>
              </span>
            </span>
            <span className="rounded-full border border-red-200 bg-white/70 px-2 py-0.5 text-[7px] font-black uppercase tracking-widest text-red-500">Soon</span>
          </button>
        </form>
      </CardShell>
    </CardOverlay>
  );
};
