import React from 'react';
import { X } from 'lucide-react';

interface CardOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export const CardOverlay: React.FC<CardOverlayProps> = ({
  isOpen,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#4D3122]/80 backdrop-blur-md transition-all duration-500">
      <div 
        className="min-h-screen w-full flex items-center justify-center p-4 sm:p-8 lg:p-12"
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        {/* Card Wrapper - Centered Content */}
        <div className="relative animate-in zoom-in-95 duration-500 ease-out z-[110] flex-shrink-0">
        
        {/* Close Button - Floating "Game" style */}
        <button 
          onClick={onClose}
          className="absolute -top-4 -right-4 z-[120] w-10 h-10 rounded-full bg-evoli-primary text-white border-2 border-white shadow-2xl flex items-center justify-center hover:scale-110 hover:rotate-90 transition-all active:scale-90"
        >
          <X className="w-5 h-5" />
        </button>

        {children}

        {/* Decorative Playmat Glow below the card */}
        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-10 bg-evoli-primary/20 blur-[50px] -z-10 rounded-full" />
      </div>
    </div>
  </div>
);
};
