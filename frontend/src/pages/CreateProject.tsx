import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import { Plus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';
import { CardShell } from '../components/cards/CardShell';
import { CardArtwork, FINAL_EVOLUTIONS } from '../components/cards/CardArtwork';
import { Button } from '../components/ui/Button';

import { CardOverlay } from '../components/cards/CardOverlay';

export const CreateProject: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const evo = React.useMemo(() => FINAL_EVOLUTIONS[Math.floor(Math.random() * FINAL_EVOLUTIONS.length)], []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await projectsApi.create({ name, description });
      toast.success('Project created successfully!');
      navigate('/projects');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => navigate('/projects');

  return (
    <CardOverlay isOpen={true} onClose={handleClose}>
        <CardShell
          size="active"
          title={
            <input 
              className="bg-transparent border-none focus:ring-0 w-full text-[min(18px,4cqi)] font-black uppercase tracking-tight text-evoli-text placeholder:text-evoli-text/20 p-0"
              placeholder="Projekt Name..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoFocus
            />
          }
          headerRight={
            <div className="flex items-center gap-1 px-2 py-0.5 bg-evoli-primary/10 rounded-full border border-evoli-primary/20 text-[7px] font-black uppercase tracking-widest text-evoli-primary">
               <Sparkles className="w-2 h-2" />
               Expansion Pack
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
              <span className="text-[8px] font-black uppercase text-evoli-text/40 tracking-widest italic">"Erschaffe dein Spielfeld"</span>
              <div className="flex items-center gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-evoli-primary animate-pulse" />
                 <span className="text-[7px] font-black uppercase text-evoli-primary">Entwurf</span>
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
                      onClick={handleSubmit}
                      disabled={isSubmitting || !name.trim()}
                      className="flex-1 h-10 text-[9px] uppercase font-black tracking-widest shadow-lg"
                      isLoading={isSubmitting}
                   >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Projekt Erstellen
                   </Button>
                </div>
                <p className="text-[7px] font-black uppercase tracking-widest text-evoli-text/20">Projekt Builder Tool v2.0</p>
             </div>
          }
          className="shadow-2xl"
        >
          <div className="space-y-4 py-1 h-full flex flex-col">
            <div className="relative flex-1 flex flex-col">
              <label className="absolute -top-2.5 left-2 px-1 bg-[#FFF6DD] text-[8px] font-black uppercase tracking-widest text-evoli-primary/60 z-10">Beschreibung</label>
              <textarea 
                className="w-full flex-1 bg-white/40 border border-evoli-primary/10 rounded-md p-3 text-xs font-medium text-evoli-text focus:ring-2 focus:ring-evoli-primary/20 focus:border-evoli-primary/40 transition-all outline-none resize-none"
                placeholder="Beschreibe die Vision deines Projekts..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>
        </CardShell>
    </CardOverlay>
  );
};
