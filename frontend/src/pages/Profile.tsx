import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Mail, Shield, Calendar, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CardShell } from '../components/cards/CardShell';
import { CardArtwork, FINAL_EVOLUTIONS } from '../components/cards/CardArtwork';
import { Badge } from '../components/ui/Badge';
import { CardOverlay } from '../components/cards/CardOverlay';

export const Profile: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleClose = () => navigate('/projects');

  const getProfileArtwork = (userId: string) => {
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const trainerNum = (hash % 3) + 1;
    const holos = Object.values(FINAL_EVOLUTIONS).map(e => e.holo);
    const holo = holos[hash % holos.length];
    
    return {
      file: `trainer${trainerNum}`,
      label: `Trainer ${user.name}`,
      holo,
      status: 'NEUTRAL'
    };
  };

  const profileData = getProfileArtwork(user.id);

  return (
    <CardOverlay isOpen={true} onClose={handleClose}>
        <CardShell
          size="active"
          title="Trainer Profil"
          headerRight={
            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-400/10 rounded-full border border-amber-400/20 text-[7px] font-black uppercase tracking-widest text-amber-600">
               <Star className="w-2 h-2 fill-current" />
               Elite Rank
            </div>
          }
          artwork={
            <CardArtwork
              imageName={profileData.file}
              imageLabel={profileData.label}
              holo={profileData.holo}
              status={profileData.status as any}
              isBoard={false}
            />
          }
          meta={
            <div className="flex justify-between w-full items-center px-1">
              <Badge variant="primary" size="sm" className="text-[8px]">Standard Benutzer</Badge>
              <div className="flex items-center gap-2">
                <span className="text-[8px] font-black uppercase text-evoli-text/40 tracking-widest">Status: Aktiv</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
              </div>
            </div>
          }
          footer={
             <div className="flex flex-col items-center justify-center w-full gap-2">
                <div className="flex justify-around w-full opacity-60">
                   <div className="flex flex-col items-center">
                      <span className="text-[6px] font-black uppercase text-evoli-text/40">Projekte</span>
                      <span className="text-[10px] font-black text-evoli-primary">12</span>
                   </div>
                   <div className="w-px h-6 bg-evoli-primary/10" />
                   <div className="flex flex-col items-center">
                      <span className="text-[6px] font-black uppercase text-evoli-text/40">Tasks</span>
                      <span className="text-[10px] font-black text-evoli-primary">148</span>
                   </div>
                   <div className="w-px h-6 bg-evoli-primary/10" />
                   <div className="flex flex-col items-center">
                      <span className="text-[6px] font-black uppercase text-evoli-text/40">XP</span>
                      <span className="text-[10px] font-black text-evoli-primary">2.4k</span>
                   </div>
                </div>
                <div className="w-full h-1 bg-evoli-primary/5 rounded-full overflow-hidden">
                   <div className="w-3/4 h-full bg-evoli-primary" />
                </div>
                <p className="text-[7px] font-black uppercase tracking-widest text-evoli-text/20">GoEvoli Trainer Pass v2.0</p>
             </div>
          }
          className="shadow-2xl"
        >
          <div className="space-y-2 py-1">
            <div className="flex items-center gap-3 p-2 bg-[#7A4A2D]/5 rounded-sm border border-[#7A4A2D]/10">
              <Mail className="w-3 h-3 text-evoli-primary/60" />
              <div className="flex-1">
                <p className="text-[6px] font-black text-evoli-text/30 uppercase tracking-widest">E-Mail Adresse</p>
                <p className="text-[10px] text-evoli-text font-bold truncate">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 bg-[#7A4A2D]/5 rounded-sm border border-[#7A4A2D]/10">
              <Shield className="w-3 h-3 text-evoli-primary/60" />
              <div className="flex-1">
                <p className="text-[6px] font-black text-evoli-text/30 uppercase tracking-widest">Sicherheitslevel</p>
                <p className="text-[10px] text-evoli-text font-bold">Standard Verschlüsselung</p>
              </div>
            </div>

            <div className="flex items-center gap-3 p-2 bg-[#7A4A2D]/5 rounded-sm border border-[#7A4A2D]/10">
              <Calendar className="w-3 h-3 text-evoli-primary/60" />
              <div className="flex-1">
                <p className="text-[6px] font-black text-evoli-text/30 uppercase tracking-widest">Mitglied seit</p>
                <p className="text-[10px] text-evoli-text font-bold">April 2026</p>
              </div>
            </div>
          </div>
        </CardShell>
    </CardOverlay>
  );
};
