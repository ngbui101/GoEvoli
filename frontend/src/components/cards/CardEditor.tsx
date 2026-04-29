import React from 'react';
import { CardShell } from './CardShell';
import { CardArtwork, FINAL_EVOLUTIONS, resolveTaskArtwork } from './CardArtwork';
import { Save, Sparkles } from 'lucide-react';
import { cn } from '../../utils/cn';

interface CardEditorProps {
  variant: 'story' | 'task' | 'bug';
  onSave: (data: any, type: 'story' | 'task') => void;
  onCancel: () => void;
  initialData?: any;
  stories?: any[];
}

export const CardEditor: React.FC<CardEditorProps> = ({ 
  variant: initialVariant, 
  onSave, 
  onCancel, 
  initialData = {},
  stories = []
}) => {
  const [currentVariant, setCurrentVariant] = React.useState<'story' | 'task'>(
    initialVariant === 'bug' ? 'task' : initialVariant as any
  );
  const [formData, setFormData] = React.useState({
    ...initialData,
    priority: initialData.priority || 'MEDIUM',
    type: initialData.type || 'FUNCTIONALITY',
    workload: initialData.workload || 1,
    storyId: initialData.storyId || (stories.length > 0 ? stories[0].id : '')
  });

  const [activeTab, setActiveTab] = React.useState<'beschreibung' | 'details' | 'assigned'>('beschreibung');

  const artworkInfo = React.useMemo(() => {
    if (currentVariant === 'task') {
      return resolveTaskArtwork(formData.type as any);
    }
    return { file: 'egg', label: 'Ei', holo: { from: '#c084fc', via: '#7c3aed', to: '#4f46e5' } };
  }, [currentVariant, formData.type]);

  const isFormValid = formData.title?.trim() && formData.description?.trim() && (currentVariant === 'story' || formData.storyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData, currentVariant);
  };

  const headerRight = (
    <div className="flex items-center gap-2">
       <select 
         className="evoli-select !bg-evoli-primary/10 !border-evoli-primary/20 !px-2 !py-1 !pr-7 !text-[9px] h-auto"
         value={currentVariant}
         onChange={(e) => {
            setCurrentVariant(e.target.value as any);
            setActiveTab('beschreibung');
         }}
       >
         <option value="task">Task</option>
         <option value="story">User Story</option>
       </select>
    </div>
  );

  return (
    <div className="w-full flex justify-center animate-in fade-in zoom-in-95 duration-500">
      <form onSubmit={handleSubmit} className="w-full">
        <CardShell
          size="active"
          title={
            <input 
              className="bg-transparent border-none focus:ring-0 w-full text-[min(18px,4cqi)] font-black uppercase tracking-tight text-evoli-text placeholder:text-evoli-text/20 p-0"
              placeholder={currentVariant === 'story' ? "Story name eingeben..." : "Task titel eingeben..."}
              value={formData.title || ''}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
              autoFocus
            />
          }
          headerRight={headerRight}
          artwork={
            <CardArtwork
              imageName={artworkInfo.file}
              imageLabel={artworkInfo.label}
              holo={artworkInfo.holo}
              status={currentVariant === 'task' ? 'TASK' : 'EGG'}
              isBoard={false}
            />
          }
          footer={
            <div className="flex justify-center items-center w-full">
               <button 
                 type="submit"
                 disabled={!isFormValid}
                 className="flex items-center gap-2 bg-evoli-primary text-white px-8 py-2 rounded-sm shadow-lg hover:scale-105 active:scale-95 transition-all text-[10px] font-black uppercase tracking-widest w-full disabled:opacity-50 disabled:grayscale disabled:hover:scale-100 cursor-pointer disabled:cursor-not-allowed"
               >
                  <Save className="w-3 h-3" /> {currentVariant === 'story' ? 'Story beschwören' : 'Task erstellen'}
               </button>
            </div>
          }
        >
          <div className="flex flex-col h-full gap-3">
             {/* Tab Navigation */}
             <div className="flex gap-1 border-b border-evoli-primary/10 mb-1">
                {['beschreibung', 'details', 'assigned'].map(tab => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab as any)}
                    className={cn(
                      "text-[8px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all",
                      activeTab === tab ? "border-evoli-primary text-evoli-primary" : "border-transparent text-evoli-text/30"
                    )}
                  >
                    {tab}
                  </button>
                ))}
             </div>

             <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                {activeTab === 'beschreibung' && (
                  <div className="space-y-4 pt-2">
                    {currentVariant === 'task' && (
                      <div className="relative">
                        <label className="absolute -top-2.5 left-2 px-1 bg-[#FFF6DD] text-[8px] font-black uppercase tracking-widest text-evoli-primary/60 z-10">Gehört zu Story</label>
                        <select 
                          className="evoli-select w-full"
                          value={formData.storyId}
                          onChange={e => setFormData({...formData, storyId: e.target.value})}
                          required
                        >
                          <option value="" disabled>BITTE STORY WÄHLEN...</option>
                          {stories.map(s => (
                            <option key={s.id} value={s.id}>{s.title.toUpperCase()}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="relative">
                      <label className="absolute -top-2.5 left-2 px-1 bg-[#FFF6DD] text-[8px] font-black uppercase tracking-widest text-evoli-primary/60 z-10">Beschreibung</label>
                      <textarea 
                        className="w-full bg-white/40 border border-evoli-primary/10 rounded-md p-3 text-xs font-medium text-evoli-text focus:ring-2 focus:ring-evoli-primary/20 focus:border-evoli-primary/40 transition-all outline-none min-h-[100px] resize-none"
                        placeholder={currentVariant === 'story' ? "Als Benutzer ... möchte ich .... um ......" : "Beschreibe die Aufgabe..."}
                        value={formData.description || ''}
                        onChange={e => setFormData({...formData, description: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-4 pt-2">
                    <div className="grid grid-cols-2 gap-4">
                       <div className="relative">
                         <label className="absolute -top-2.5 left-2 px-1 bg-[#FFF6DD] text-[8px] font-black uppercase tracking-widest text-evoli-primary/60 z-10">Priorität</label>
                         <select 
                           className="evoli-select w-full"
                           value={formData.priority || 'MEDIUM'}
                           onChange={e => setFormData({...formData, priority: e.target.value})}
                         >
                           <option value="LOW">LOW ENERGY</option>
                           <option value="MEDIUM">MEDIUM ENERGY</option>
                           <option value="HIGH">HIGH ENERGY</option>
                           <option value="CRITICAL">OVERCHARGE</option>
                         </select>
                       </div>

                       {currentVariant === 'task' ? (
                         <div className="relative">
                           <label className="absolute -top-2.5 left-2 px-1 bg-[#FFF6DD] text-[8px] font-black uppercase tracking-widest text-evoli-primary/60 z-10">Typ</label>
                           <select 
                             className="evoli-select w-full"
                             value={formData.type || 'FUNCTIONALITY'}
                             onChange={e => setFormData({...formData, type: e.target.value})}
                           >
                             <option value="FUNCTIONALITY">FUNCTION</option>
                             <option value="UI_UX">DESIGN</option>
                             <option value="STABILITY">STABILITY</option>
                           </select>
                         </div>
                       ) : (
                         <div className="flex items-center justify-center border-2 border-dashed border-evoli-primary/5 rounded-md p-2 opacity-20">
                            <Sparkles className="w-4 h-4 text-evoli-primary" />
                         </div>
                       )}

                       {currentVariant === 'task' && (
                         <div className="relative col-span-2">
                           <label className="absolute -top-2.5 left-2 px-1 bg-[#FFF6DD] text-[8px] font-black uppercase tracking-widest text-evoli-primary/60 z-10">Workload (Stunden)</label>
                           <input 
                             type="number"
                             className="w-full bg-white/40 border border-evoli-primary/10 rounded-md p-2 text-[10px] font-black uppercase tracking-widest text-evoli-text outline-none focus:ring-2 focus:ring-evoli-primary/20"
                             value={formData.workload || 1}
                             onChange={e => setFormData({...formData, workload: parseFloat(e.target.value)})}
                             min="0.5"
                             step="0.5"
                           />
                         </div>
                       )}
                    </div>
                  </div>
                )}

                {activeTab === 'assigned' && (
                  <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-20 space-y-2">
                     <Sparkles className="w-8 h-8 text-evoli-primary" />
                     <p className="text-[10px] font-black uppercase tracking-widest">Trainer-Zuweisung folgt...</p>
                  </div>
                )}
             </div>
          </div>
        </CardShell>
      </form>
    </div>
  );
};
