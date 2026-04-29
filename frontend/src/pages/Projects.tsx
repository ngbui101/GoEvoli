import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import type { Project } from '../types';
import { Layers, FolderKanban, Plus, Clock, ArrowRight, Layout } from 'lucide-react';
import { CardShell } from '../components/cards/CardShell';
import { CardArtwork, FINAL_EVOLUTIONS } from '../components/cards/CardArtwork';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Panel } from '../components/ui/Panel';
import { PageHeader } from '../components/layout/PageHeader';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const getProjectArtwork = (projectId: string) => {
    // Generate a consistent index based on the ID string
    const hash = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FINAL_EVOLUTIONS[hash % FINAL_EVOLUTIONS.length];
  };

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const data = await projectsApi.getAll() || [];
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  return (
    <div className="min-h-screen bg-evoli-bg pt-24 pb-12 playmat-grid">
      <PageHeader 
        title="Deine Projekte"
        subtitle="Projektverwaltung"
        icon={<Layers className="w-6 h-6 sm:w-8 sm:h-8" />}
        actions={
          <Button 
            onClick={() => navigate('/projects/new')}
            className="flex items-center justify-center gap-2 px-6 py-3 text-[10px] sm:text-xs font-black uppercase tracking-widest shadow-md"
          >
            <Plus className="w-4 h-4 mr-2" />
            Neues Projekt
          </Button>
        }
        className="mb-8 lg:mb-12"
      />

      <div className="w-full sm:w-[95%] max-w-7xl mx-auto px-4 sm:px-0">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-evoli-card-surface/40 border-4 border-evoli-card-border/10 rounded-evoli-card aspect-card animate-pulse w-full max-w-[320px] mx-auto sm:max-w-none"></div>
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Panel className="bg-white/40 border-none shadow-sm rounded-3xl p-12 text-center">
            <FolderKanban className="w-16 h-16 sm:w-24 sm:h-24 text-evoli-text/10 mx-auto mb-6 sm:mb-8" />
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-evoli-text/40 mb-4 sm:mb-6">Keine Projekte gefunden</h2>
            <p className="max-w-md mx-auto font-black text-[9px] sm:text-[11px] uppercase tracking-widest text-evoli-text/30 mb-8 sm:mb-10 leading-relaxed px-4">
              Du hast noch keine Projekte erstellt. Beschwöre dein erstes Projekt, um loszulegen!
            </p>
            <Button onClick={() => navigate('/projects/new')} variant="secondary" className="px-8 py-4 sm:px-10 sm:py-5">
              Erstes Projekt erstellen
            </Button>
          </Panel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-12 justify-items-center">
            {projects.map(project => (
              <CardShell
                key={project.id}
                size="active"
                title={project.name}
                onClick={() => navigate(`/projects/${project.id}/board`)}
                artwork={
                  (() => {
                    const evo = getProjectArtwork(project.id);
                    return (
                      <CardArtwork
                        imageName={evo.file}
                        imageLabel={evo.label}
                        holo={evo.holo}
                        status="FINAL_EVOLUTION"
                        isBoard={false}
                      />
                    );
                  })()
                }
                meta={
                  <div className="flex justify-between w-full items-center px-1">
                    <Badge variant="primary" size="sm" className="text-[7px] sm:text-[9px]">Projekt</Badge>
                    <span className="text-[7px] sm:text-[9px] font-black uppercase text-evoli-text/40">Klasse: Agile</span>
                  </div>
                }
                footer={
                  <div className="flex justify-between items-center w-full px-1">
                    <div className="flex items-center gap-1.5 sm:gap-2 text-[8px] sm:text-[10px]">
                      <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                      <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1.5 sm:gap-2 text-evoli-primary font-black uppercase tracking-widest text-[8px] sm:text-[10px]">
                       <span>Spielfeld</span>
                       <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </div>
                  </div>
                }
              >
                <p className="text-[10px] sm:text-[12px] line-clamp-4 mb-0 italic opacity-80 leading-relaxed font-medium">
                  "{project.description || "Dieses Projekt wartet darauf, bespielt zu werden."}"
                </p>
              </CardShell>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
