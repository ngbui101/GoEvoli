import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '../api/projects';
import type { Project } from '../types';
import { AlertCircle, ArrowRight, Clock, FolderKanban, Layers, Loader2, Plus, RefreshCw } from 'lucide-react';
import { CardShell } from '../components/cards/CardShell';
import { CardArtwork, FINAL_EVOLUTIONS } from '../components/cards/CardArtwork';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Panel } from '../components/ui/Panel';
import { PageHeader } from '../components/layout/PageHeader';

export const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSlowLoading, setIsSlowLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const getProjectArtwork = (projectId: string) => {
    const hash = projectId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return FINAL_EVOLUTIONS[hash % FINAL_EVOLUTIONS.length];
  };

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setIsSlowLoading(false);
    setErrorMessage(null);

    try {
      const data = await projectsApi.getAll() || [];
      setProjects(data);
    } catch (error: any) {
      console.error('Failed to load projects', error);
      setProjects([]);
      setErrorMessage(error.message || 'Projektliste konnte nicht geladen werden.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    if (!isLoading) return;

    const timer = window.setTimeout(() => {
      setIsSlowLoading(true);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [isLoading]);

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
          <div className="flex justify-center">
            <Panel className="w-full max-w-2xl bg-white/50 border-evoli-primary/10 shadow-sm rounded-evoli p-8 text-center">
              <Loader2 className="w-10 h-10 text-evoli-primary animate-spin mx-auto mb-5" />
              <h2 className="text-lg sm:text-xl font-black uppercase tracking-widest text-evoli-primary mb-3">Projekte werden geladen</h2>
              <p className="max-w-md mx-auto font-black text-[10px] sm:text-[11px] uppercase tracking-widest text-evoli-text/40 leading-relaxed">
                {isSlowLoading
                  ? 'Die Synchronisation dauert laenger als erwartet. Du kannst den Abruf neu starten.'
                  : 'Einen Moment, wir synchronisieren deine Projektliste.'}
              </p>
              {isSlowLoading && (
                <Button onClick={fetchProjects} variant="secondary" className="mt-6 px-8 py-4">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Erneut versuchen
                </Button>
              )}
            </Panel>
          </div>
        ) : errorMessage ? (
          <Panel className="bg-white/50 border-red-200 shadow-sm rounded-evoli p-10 text-center">
            <AlertCircle className="w-16 h-16 text-red-500/80 mx-auto mb-6" />
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-red-700 mb-4">Projektliste nicht erreichbar</h2>
            <p className="max-w-lg mx-auto font-black text-[10px] sm:text-[11px] uppercase tracking-widest text-evoli-text/45 mb-8 leading-relaxed px-4">
              {errorMessage}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button onClick={fetchProjects} variant="primary" className="px-8 py-4">
                <RefreshCw className="w-4 h-4 mr-2" />
                Erneut versuchen
              </Button>
              <Button onClick={() => navigate('/projects/new')} variant="secondary" className="px-8 py-4">
                <Plus className="w-4 h-4 mr-2" />
                Neues Projekt
              </Button>
            </div>
          </Panel>
        ) : projects.length === 0 ? (
          <Panel className="bg-white/40 border-none shadow-sm rounded-evoli p-12 text-center">
            <FolderKanban className="w-16 h-16 sm:w-24 sm:h-24 text-evoli-text/10 mx-auto mb-6 sm:mb-8" />
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-widest text-evoli-text/40 mb-4 sm:mb-6">Keine Projekte gefunden</h2>
            <p className="max-w-md mx-auto font-black text-[9px] sm:text-[11px] uppercase tracking-widest text-evoli-text/30 mb-8 sm:mb-10 leading-relaxed px-4">
              Du hast noch keine Projekte erstellt. Erstelle dein erstes Projekt, um loszulegen.
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
                  "{project.description || 'Dieses Projekt wartet darauf, bespielt zu werden.'}"
                </p>
              </CardShell>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
