import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';
import { AnimatedLogo } from './AnimatedLogo';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 bg-white/70 backdrop-blur-md border border-evoli-primary/10 rounded-evoli shadow-evoli">
      <div className="px-4 sm:px-10">
        <div className="flex items-center justify-between h-16">
          <Link to="/projects" className="flex-shrink-0 flex items-center gap-4 hover:scale-105 transition-transform duration-300">
            <AnimatedLogo />
            <span className="text-2xl font-black text-evoli-primary tracking-tighter">GoEvoli</span>
          </Link>
          
          <div className="flex items-center gap-4 sm:gap-8">
            <Link 
              to="/projects" 
              className="flex items-center gap-2 text-xs text-evoli-text font-black uppercase tracking-widest group"
            >
              <div className="w-8 h-8 rounded-full bg-evoli-secondary/30 flex items-center justify-center border border-evoli-primary/10 group-hover:bg-evoli-primary group-hover:text-white transition-all shadow-sm">
                <img src="/img/nest.png" alt="Projekte" className="w-full h-full scale-[1.5] object-contain drop-shadow-sm" />
              </div>
              <span className="hidden sm:block group-hover:text-evoli-primary transition-colors">Projekte</span>
            </Link>

            <div className="h-6 w-px bg-evoli-primary/10 hidden sm:block" />

            <div className="flex items-center gap-5">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-2 text-xs text-evoli-text font-black uppercase tracking-widest group"
              >
                <div className="w-8 h-8 rounded-full bg-evoli-secondary/30 flex items-center justify-center border border-evoli-primary/10 group-hover:bg-evoli-primary group-hover:text-white transition-all shadow-sm">
                  <img src="/img/trainer_hat.png" alt="Profil" className="w-full h-full scale-[1.5] object-contain drop-shadow-sm" />
                </div>
                <span className="hidden sm:block group-hover:text-evoli-primary transition-colors">{user.name}</span>
              </button>
              
              <button
                onClick={() => logout()}
                className="p-3 rounded-full text-evoli-text/40 hover:text-red-500 hover:bg-red-50 transition-all border border-transparent hover:border-red-100"
                title="Abmelden"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
