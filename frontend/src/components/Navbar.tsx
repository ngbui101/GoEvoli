import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, User as UserIcon, LayoutGrid } from 'lucide-react';
import { AnimatedLogo } from './AnimatedLogo';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50 bg-white/70 backdrop-blur-md border border-evoli-primary/10 rounded-evoli shadow-evoli">
      <div className="px-4 sm:px-10">
        <div className="flex items-center justify-between h-20">
          <Link to="/projects" className="flex-shrink-0 flex items-center gap-4 hover:scale-105 transition-transform duration-300">
            <AnimatedLogo />
            <span className="text-2xl font-black text-evoli-primary tracking-tighter">GoEvoli</span>
          </Link>
          
          <div className="flex items-center gap-8">
            <Link 
              to="/projects" 
              className="hidden md:flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-evoli-text/40 hover:text-evoli-primary transition-all group"
            >
              <LayoutGrid className="w-4 h-4 text-evoli-text/20 group-hover:text-evoli-primary/50" />
              Projekte
            </Link>

            <div className="h-8 w-px bg-evoli-primary/10 hidden md:block" />

            <div className="flex items-center gap-6">
              <button
                onClick={() => navigate('/profile')}
                className="flex items-center gap-3 text-xs text-evoli-text font-black uppercase tracking-widest group"
              >
                <div className="w-10 h-10 rounded-full bg-evoli-secondary/30 flex items-center justify-center border border-evoli-primary/10 group-hover:bg-evoli-primary group-hover:text-white transition-all shadow-sm">
                  <UserIcon className="w-5 h-5" />
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
