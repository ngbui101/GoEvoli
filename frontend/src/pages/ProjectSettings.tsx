import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import type { Project } from '../types';
import { Settings, Save, ArrowLeft, Gauge, Trash2 } from 'lucide-react';
import { Panel } from '../components/ui/Panel';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Textarea } from '../components/ui/Textarea';
import toast from 'react-hot-toast';

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

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-evoli-bg pt-32 pb-20 px-6 sm:px-10 playmat-grid">
      <div className="max-w-4xl mx-auto">
        <button 
          onClick={() => navigate(`/projects/${projectId}/board`)}
          className="flex items-center gap-3 text-evoli-text/40 hover:text-evoli-primary mb-10 transition-all text-[11px] font-black uppercase tracking-widest group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-2 transition-transform" />
          Spielfeld betreten
        </button>

        <div className="flex items-center gap-8 mb-16">
          <div className="w-20 h-20 bg-evoli-primary rounded-evoli text-evoli-bg flex items-center justify-center shadow-card-game border-4 border-white/20">
            <Settings className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-evoli-primary mb-0 uppercase tracking-tighter leading-none">Projekt-Konfiguration</h1>
            <p className="text-evoli-text/40 text-[11px] font-black uppercase tracking-[0.3em] mt-2">Feintuning für {project?.name}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-12">
          <Panel title="Projekt-Stammdaten" className="bg-white/40 border-none shadow-sm rounded-3xl p-8">
            <div className="space-y-8">
              <Input 
                label="Projekt Name" 
                value={formData.name} 
                onChange={e => setFormData({...formData, name: e.target.value})} 
                id="settings-name"
                required
                className="h-12 bg-white/50 font-bold"
              />
              <Textarea 
                label="Missionsbeschreibung" 
                value={formData.description} 
                onChange={e => setFormData({...formData, description: e.target.value})} 
                id="settings-desc"
                rows={4}
                className="bg-white/50 font-medium"
              />
            </div>
          </Panel>

          <Panel title="Spielregeln & Limits" className="bg-white/40 border-none shadow-sm rounded-3xl p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <div className="flex items-center gap-3 text-evoli-primary mb-2">
                  <Gauge className="w-5 h-5" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Next Zone Limit</span>
                </div>
                <Input 
                  type="number"
                  label="Max. Karten in 'Next'" 
                  value={formData.wipLimits.next} 
                  onChange={e => setFormData({
                    ...formData, 
                    wipLimits: { ...formData.wipLimits, next: parseInt(e.target.value) }
                  })} 
                  id="settings-wip-next"
                  className="h-12 bg-white/50 font-black"
                />
                <p className="text-[10px] text-evoli-text/40 font-bold uppercase tracking-wide leading-relaxed">
                  Bestimmt die Kapazität des Vorbereitungsstapels.
                </p>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-3 text-evoli-primary mb-2">
                  <Gauge className="w-5 h-5" />
                  <span className="text-[11px] font-black uppercase tracking-widest">Doing Zone Limit</span>
                </div>
                <Input 
                  type="number"
                  label="Max. Karten in 'Doing'" 
                  value={formData.wipLimits.doing} 
                  onChange={e => setFormData({
                    ...formData, 
                    wipLimits: { ...formData.wipLimits, doing: parseInt(e.target.value) }
                  })} 
                  id="settings-wip-doing"
                  className="h-12 bg-white/50 font-black"
                />
                <p className="text-[10px] text-evoli-text/40 font-bold uppercase tracking-wide leading-relaxed">
                  Fokus ist der Schlüssel! Begrenze die aktiven Karten auf dem Feld.
                </p>
              </div>
            </div>
          </Panel>

          <Panel className="border-4 border-red-200 border-dashed bg-red-50/20 rounded-3xl p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-red-100 rounded-2xl text-red-600 flex items-center justify-center shadow-sm">
                  <Trash2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-red-900 mb-0 uppercase tracking-tight">Kartenvernichtung</h3>
                  <p className="text-[10px] font-black text-red-700/60 uppercase tracking-widest mt-1">Permanent aus dem Projekt entfernen.</p>
                </div>
              </div>
              <Button variant="danger" size="sm" className="h-12 px-8 shadow-sm">Projekt löschen</Button>
            </div>
          </Panel>

          <div className="flex justify-end gap-6 pt-8 border-t border-evoli-card-border/10">
            <Button variant="ghost" type="button" onClick={() => navigate(`/projects/${projectId}/board`)} className="h-14 px-8 text-evoli-text/40">Abbrechen</Button>
            <Button type="submit" className="h-14 px-12 shadow-lg">
              <Save className="w-5 h-5 mr-3" />
              Regeln besiegeln
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
