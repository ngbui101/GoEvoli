import React from 'react';
import type { StoryStatus, TaskType } from '../../types';
export const FINAL_EVOLUTIONS = [
  { file: 'flamara',   label: 'Flamara',   holo: { from: '#f97316', via: '#ef4444', to: '#dc2626' } },
  { file: 'aquana',    label: 'Aquana',    holo: { from: '#3b82f6', via: '#06b6d4', to: '#0ea5e9' } },
  { file: 'blitza',    label: 'Blitza',    holo: { from: '#facc15', via: '#f59e0b', to: '#fb923c' } },
  { file: 'psiana',    label: 'Psiana',    holo: { from: '#a855f7', via: '#8b5cf6', to: '#ec4899' } },
  { file: 'nachtara',  label: 'Nachtara',  holo: { from: '#374151', via: '#1f2937', to: '#4b5563' } },
  { file: 'glaziola',  label: 'Glaziola',  holo: { from: '#bae6fd', via: '#a5f3fc', to: '#c7d2fe' } },
  { file: 'folopurba', label: 'Folipurba', holo: { from: '#4ade80', via: '#10b981', to: '#34d399' } },
];
const typeHoloColors: Record<string, { from: string; via: string; to: string }> = {
  UI_UX:         { from: '#f97316', via: '#ea580c', to: '#dc2626' },
  FUNCTIONALITY: { from: '#facc15', via: '#eab308', to: '#a16207' },
  STABILITY:     { from: '#38bdf8', via: '#0ea5e9', to: '#0369a1' },
  BUG:           { from: '#ef4444', via: '#b91c1c', to: '#7f1d1d' },
  DEFAULT:       { from: '#f59e0b', via: '#ea580c', to: '#925D3B' },
};
const sceneBg: Record<string, { from: string; to: string }> = {
  EGG:             { from: '#2d5a1b', to: '#4a8c2a' },
  EVOLVING:        { from: '#1a4a2e', to: '#2d7a4a' },
  READY_FOR_TEST:  { from: '#3d6b1a', to: '#5c9e28' },
  BLOCKED:         { from: '#4a2a1a', to: '#6b3d22' },
  FINAL_EVOLUTION: { from: '#1a5a1a', to: '#2e8b2e' },
  DONE:            { from: '#1a5c2e', to: '#28a045' },
  TASK:            { from: '#2d5a1b', to: '#4a8c2a' },
  BUG:             { from: '#4a2a1a', to: '#6b3d22' },
  NEUTRAL:         { from: '#d6d3d1', to: '#78716c' },
};
const particleColors: Record<string, string[]> = {
  EGG:             ['#d4edda', '#a8d5b5', '#7ec8a0'],
  EVOLVING:        ['#86efac', '#4ade80', '#facc15'],
  READY_FOR_TEST:  ['#fef08a', '#fde047', '#bef264'],
  BLOCKED:         ['#fca5a5', '#ef4444', '#d97706'],
  FINAL_EVOLUTION: ['#f9a8d4', '#c084fc', '#86efac', '#7dd3fc'],
  DONE:            ['#bbf7d0', '#6ee7b7', '#fef9c3'],
  TASK:            ['#d4edda', '#bef264', '#fef08a'],
  BUG:             ['#fca5a5', '#ef4444', '#d97706'],
  NEUTRAL:         ['#f5f5f4', '#e7e5e4', '#d6d3d1'],
};
function deterministicIndex(id: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % length;
}
export interface StoryArtworkInfo {
  file: string;
  label: string;
  holo: { from: string; via: string; to: string };
}

export function resolveStoryArtwork(
  _status: StoryStatus,
  hasDoing: boolean,
  allDone: boolean,
  storyId: string,
): StoryArtworkInfo {
  if (allDone) {
    const evo = FINAL_EVOLUTIONS[deterministicIndex(storyId, FINAL_EVOLUTIONS.length)];
    return { file: evo.file, label: evo.label, holo: evo.holo };
  }
  if (hasDoing) {
    return { file: 'evoli', label: 'Evoli', holo: { from: '#f59e0b', via: '#ea580c', to: '#925D3B' } };
  }
  return { file: 'egg', label: 'Ei', holo: { from: '#c084fc', via: '#7c3aed', to: '#4f46e5' } };
}
export interface TaskArtworkInfo {
  file: string;
  label: string;
  holo: { from: string; via: string; to: string };
}

export function resolveTaskArtwork(type: TaskType): TaskArtworkInfo {
  switch (type) {
    case 'FUNCTIONALITY': return { file: 'thunderstone', label: 'Donnerstein', holo: typeHoloColors.FUNCTIONALITY };
    case 'UI_UX':         return { file: 'firestone',    label: 'Feuerstein',  holo: typeHoloColors.UI_UX };
    case 'STABILITY':     return { file: 'waterstone',   label: 'Wasserstein', holo: typeHoloColors.STABILITY };
    case 'BUG':           return { file: 'bug',          label: 'Bug',         holo: typeHoloColors.BUG };
    default:              return { file: 'thunderstone', label: 'Donnerstein', holo: typeHoloColors.DEFAULT };
  }
}
const FloatingParticles: React.FC<{ colors: string[] }> = ({ colors }) => (
  <g>
    {Array.from({ length: 12 }).map((_, i) => {
      const x = 8 + (i * 73 + 17) % 84;
      const y = 10 + (i * 59 + 31) % 80;
      const r = 0.8 + (i % 3) * 0.5;
      const col = colors[i % colors.length];
      return (
        <circle
          key={i} cx={x} cy={y} r={r}
          fill={col} opacity={0.3 + (i % 4) * 0.1}
          className={`fp fp-${i % 7}`}
        />
      );
    })}
  </g>
);
interface CardArtworkProps {
  imageName?: string;
  imageLabel: string;
  holo: { from: string; via: string; to: string };
  status: StoryStatus | 'BUG' | 'TASK';
  isBoard?: boolean;
  customSrc?: string;
  fullFrame?: boolean;
}

export const CardArtwork: React.FC<CardArtworkProps> = ({
  imageName,
  imageLabel,
  holo,
  status,
  isBoard = true,
  customSrc,
  fullFrame = false,
}) => {
  const bg = (sceneBg as any)[status] ?? sceneBg['EGG'];
  const pColors = (particleColors as any)[status] ?? particleColors['EGG'];

  const src = customSrc ? customSrc : `/img/${imageName}.png`;

  return (
    <div className="relative w-full h-full overflow-hidden card-artwork-root select-none">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 110%, ${bg.to} 0%, ${bg.from} 100%)`,
        }}
      />
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <FloatingParticles colors={pColors} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={src}
          alt={imageLabel}
          className={fullFrame ? "w-full h-full object-cover" : "card-artwork-img object-contain drop-shadow-2xl"}
          style={fullFrame ? undefined : {
            width:  isBoard ? '72%' : '68%',
            height: isBoard ? '82%' : '80%',
          }}
          draggable={false}
        />
      </div>
      <div
        className="absolute inset-0 card-holo-foil pointer-events-none"
        style={{
          background: `
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 2px,
              rgba(255,255,255,0.012) 2px,
              rgba(255,255,255,0.012) 4px
            ),
            conic-gradient(
              from 0deg at 50% 50%,
              ${holo.from}55,
              ${holo.via}55,
              ${holo.to}55,
              ${holo.from}55
            )
          `,
          mixBlendMode: 'screen',
        }}
      />
      <div
        className="absolute inset-0 card-holo-sweep pointer-events-none"
        style={{
          background: `linear-gradient(
            115deg,
            transparent 0%,
            ${holo.from}40 30%,
            ${holo.via}60 50%,
            ${holo.to}40 70%,
            transparent 100%
          )`,
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 35%, rgba(0,0,0,0.25) 100%)',
        }}
      />
      <div
        className="absolute bottom-0 inset-x-0 flex items-end justify-center pb-1 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 100%)',
        }}
      >
        <span
          className="font-black uppercase tracking-widest text-white/80 drop-shadow-sm"
          style={{ fontSize: isBoard ? '5.5px' : '9px', letterSpacing: '0.12em' }}
        >
          {imageLabel}
        </span>
      </div>
    </div>
  );
};
