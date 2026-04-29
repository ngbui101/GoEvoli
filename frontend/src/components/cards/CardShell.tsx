import React, { useRef } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

export type CardSize = "board" | "active";

interface CardShellProps {
  size?: CardSize;
  title: React.ReactNode;
  headerRight?: React.ReactNode;
  artwork?: React.ReactNode;
  meta?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

const formatTitle = (text: string, isBoard: boolean) => {
  if (!isBoard || text.length <= 20) return text;
  const words = text.split(' ');
  let current = '';
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (!word) continue;
    const potential = current ? `${current} ${word}` : word;
    const nextInitial = (i < words.length - 1) ? ` ${words[i+1][0]}.` : '';
    if (potential.length + nextInitial.length > 20) {
      return current ? `${current} ${word[0]}.` : `${word[0]}.`;
    }
    current = potential;
  }
  return current;
};

export const CardShell: React.FC<CardShellProps> = ({
  size = "board",
  title,
  headerRight,
  artwork,
  meta,
  children,
  footer,
  className,
  onClick,
}) => {
  const isBoard = size === "board";
  const displayTitle = typeof title === 'string' ? formatTitle(title, isBoard) : title;
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isBoard) return; // Tilt only on active-size cards
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateY =  ((x - cx) / cx) * 8;  // max ±8deg
    const rotateX = -((y - cy) / cy) * 6;  // max ±6deg
    el.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
  };

  const handleMouseLeave = () => {
    if (isBoard) return;
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.5s ease';
    el.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
  };

  const handleMouseEnter = () => {
    if (isBoard) return;
    const el = cardRef.current;
    if (!el) return;
    el.style.transition = 'transform 0.1s ease';
  };

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      className={cn(
        "relative group transition-all duration-500 ease-out flex-shrink-0",
        "shadow-[0_0_15px_rgba(77,49,34,0.3)] hover:shadow-[0_0_25px_rgba(77,49,34,0.5)]", 
        "rounded-sm overflow-hidden",
        "aspect-[63/88]", // Mandatory aspect ratio
        
        // Size variants
        isBoard 
          ? "w-[160px] h-[223px]" 
          : "w-[min(92vw,360px)] aspect-[63/88]",
        
        onClick && "cursor-pointer hover:-translate-y-2 active:translate-y-0",
        className
      )}
      style={{ containerType: 'size' }}
    >
      {/* SVG Background Layer */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 100 140" 
        preserveAspectRatio="none"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Bezel (Physical Frame) - Full bleed to prevent clipping */}
        <rect x="0" y="0" width="100" height="140" rx="3" fill="#4D3122" />
        <rect x="1.5" y="1.5" width="97" height="137" rx="2" fill="#7A4A2D" />
        
        {/* Card Face (The inner surface) */}
        <rect x="3" y="3" width="94" height="134" rx="1.5" fill="#FFF6DD" />
        
        {/* Inner Border (Golden/Warm shine) */}
        <rect x="3.5" y="3.5" width="93" height="133" rx="1" stroke="#7A4A2D" strokeWidth="0.2" opacity="0.3" />
      </svg>

      {/* Holographic Shine Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-gradient-to-tr from-transparent via-white/40 to-transparent -rotate-12 translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out z-10" />

      {/* Card Content (HTML/React) */}
      <div className="absolute inset-0 flex flex-col pointer-events-none overflow-hidden pt-[3.75cqh] pb-[1.25cqh]">
        
        {/* 1. Header (12%) */}
        <div className="h-[12%] flex items-center justify-between px-[6.25cqw] pointer-events-auto overflow-hidden">
          <div className="flex-1 mr-[2.5cqw] overflow-hidden">
            {typeof displayTitle === 'string' ? (
              <h3 
                className={cn(
                  "font-black uppercase tracking-tight text-[#4D3122] leading-tight line-clamp-3",
                  isBoard ? "text-[4.5cqw]" : "text-[18px]"
                )}
                title={typeof title === 'string' ? title : undefined}
              >
                {displayTitle}
              </h3>
            ) : (
              displayTitle
            )}
          </div>
          {headerRight && <div className={cn("flex-shrink-0 origin-right", isBoard ? "scale-50" : "scale-100")}>{headerRight}</div>}
        </div>

        {/* 2. Artwork Section (28% if exists) */}
        {artwork && (
          <div className="h-[28%] relative mx-3 rounded-sm overflow-hidden pointer-events-auto border border-[#7A4A2D]/20 bg-[#7A4A2D]/5 shadow-inner">
            {artwork}
            {/* Gloss effect on artwork */}
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-[#FFF6DD]/10 to-transparent pointer-events-none" />
          </div>
        )}

        {/* 3. Meta Section (8% if exists) */}
        {meta && (
          <div className="h-[8%] flex items-center px-4 pointer-events-auto overflow-hidden">
            <div className="w-full h-full flex items-center justify-between border-y border-[#7A4A2D]/5 bg-[#7A4A2D]/5">
              {meta}
            </div>
          </div>
        )}

        {/* 4. Body Section (Flexible) */}
        <div className="flex-1 px-[5cqw] py-[2.5cqh] pointer-events-auto overflow-hidden">
          <div className={cn(
            "h-full custom-scrollbar text-evoli-text leading-tight font-medium",
            isBoard ? "text-[4.3cqw]" : "text-[14px]"
          )}>
            {children}
          </div>
        </div>

        {/* 5. Footer Section (15%) */}
        <div className="h-[15%] px-[5cqw] py-[2.5cqh] flex items-center pointer-events-auto border-t border-[#7A4A2D]/5 bg-[#7A4A2D]/5 overflow-hidden">
          <div className={cn(
            "w-full",
            isBoard ? "text-[3.75cqw]" : "text-[12px]"
          )}>
            {footer}
          </div>
        </div>
      </div>

    </div>
  );
};
