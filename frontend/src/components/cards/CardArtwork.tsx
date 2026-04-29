import React from 'react';
import type { StoryStatus, TaskType } from '../../types';

// ─── Image Assets ─────────────────────────────────────────────────────────────

// Evoli-Entwicklungen für DONE — deterministisch per ID gewählt
export const FINAL_EVOLUTIONS = [
  { file: 'flamara',   label: 'Flamara',   holo: { from: '#f97316', via: '#ef4444', to: '#dc2626' } },
  { file: 'aquana',    label: 'Aquana',    holo: { from: '#3b82f6', via: '#06b6d4', to: '#0ea5e9' } },
  { file: 'blitza',    label: 'Blitza',    holo: { from: '#facc15', via: '#f59e0b', to: '#fb923c' } },
  { file: 'psiana',    label: 'Psiana',    holo: { from: '#a855f7', via: '#8b5cf6', to: '#ec4899' } },
  { file: 'nachtara',  label: 'Nachtara',  holo: { from: '#374151', via: '#1f2937', to: '#4b5563' } },
  { file: 'glaziola',  label: 'Glaziola',  holo: { from: '#bae6fd', via: '#a5f3fc', to: '#c7d2fe' } },
  { file: 'folopurba', label: 'Folipurba', holo: { from: '#4ade80', via: '#10b981', to: '#34d399' } },
];

// ─── Holo-Farben je Typ ────────────────────────────────────────────────────────
const typeHoloColors: Record<string, { from: string; via: string; to: string }> = {
  UI_UX:         { from: '#f97316', via: '#ea580c', to: '#dc2626' }, // Feuerstein → Orange/Rot
  FUNCTIONALITY: { from: '#facc15', via: '#eab308', to: '#a16207' }, // Donnerstein → Gelb
  STABILITY:     { from: '#38bdf8', via: '#0ea5e9', to: '#0369a1' }, // Wasserstein → Blau
  BUG:           { from: '#ef4444', via: '#b91c1c', to: '#7f1d1d' }, // Bug → Dunkelrot
  DEFAULT:       { from: '#f59e0b', via: '#ea580c', to: '#925D3B' },
};

// ─── Hintergrund-Konfigurationen je Status (Wiesen-Grün) ──────────────────────
const sceneBg: Record<string, { from: string; to: string }> = {
  EGG:             { from: '#2d5a1b', to: '#4a8c2a' }, // helles Wiesengrün
  EVOLVING:        { from: '#1a4a2e', to: '#2d7a4a' }, // satteres Dunkelgrün
  READY_FOR_TEST:  { from: '#3d6b1a', to: '#5c9e28' }, // helleres Grasgrün
  BLOCKED:         { from: '#4a2a1a', to: '#6b3d22' }, // Herbstwiese / erdiger Ton
  FINAL_EVOLUTION: { from: '#1a5a1a', to: '#2e8b2e' }, // leuchtendes Smaragdgrün
  DONE:            { from: '#1a5c2e', to: '#28a045' }, // frisches Frühlingsgrün
  TASK:            { from: '#2d5a1b', to: '#4a8c2a' }, // Wiese für Task-Steine
  BUG:             { from: '#4a2a1a', to: '#6b3d22' }, // Herbstton für Bugs
  NEUTRAL:         { from: '#d6d3d1', to: '#78716c' }, // Neutrale Steinfarben
};

// ─── Partikel-Farben je Status ────────────────────────────────────────────────
const particleColors: Record<string, string[]> = {
  EGG:             ['#d4edda', '#a8d5b5', '#7ec8a0'],  // helle Wiesenblüten
  EVOLVING:        ['#86efac', '#4ade80', '#facc15'],   // grün + Blitze
  READY_FOR_TEST:  ['#fef08a', '#fde047', '#bef264'],   // Gänseblümchen / Sonne
  BLOCKED:         ['#fca5a5', '#ef4444', '#d97706'],   // Warnung auf Gras
  FINAL_EVOLUTION: ['#f9a8d4', '#c084fc', '#86efac', '#7dd3fc'], // Regenbogen-Blüten
  DONE:            ['#bbf7d0', '#6ee7b7', '#fef9c3'],   // Frühlingsblüten
  TASK:            ['#d4edda', '#bef264', '#fef08a'],   // Blüten auf Wiese
  BUG:             ['#fca5a5', '#ef4444', '#d97706'],   // Warnung
  NEUTRAL:         ['#f5f5f4', '#e7e5e4', '#d6d3d1'],   // Sanfte Steinelemente
};

// ─── Deterministische Zufallszahl aus String ──────────────────────────────────
function deterministicIndex(id: string, length: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = ((hash << 5) - hash) + id.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) % length;
}

// ─── Story Image Resolver ─────────────────────────────────────────────────────
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

// ─── Task Image Resolver ──────────────────────────────────────────────────────
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

// ─── Floating Particles (pure SVG) ───────────────────────────────────────────
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

// ─── Hauptkomponente ──────────────────────────────────────────────────────────
interface CardArtworkProps {
  /** Pfad zum Bild, z.B. "egg" → /img/egg.png */
  imageName: string;
  /** Anzeigename im Viewport */
  imageLabel: string;
  /** Holo-Farben */
  holo: { from: string; via: string; to: string };
  /** Status (für Hintergrundszene) */
  status: StoryStatus | 'BUG' | 'TASK';
  /** Board-Modus (kleinere Karte) */
  isBoard?: boolean;
}

export const CardArtwork: React.FC<CardArtworkProps> = ({
  imageName,
  imageLabel,
  holo,
  status,
  isBoard = true,
}) => {
  const bg = (sceneBg as any)[status] ?? sceneBg['EGG'];
  const pColors = (particleColors as any)[status] ?? particleColors['EGG'];

  return (
    <div className="relative w-full h-full overflow-hidden card-artwork-root select-none">

      {/* ── Layer 1: Hintergrund-Gradient ── */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 110%, ${bg.to} 0%, ${bg.from} 100%)`,
        }}
      />

      {/* ── Layer 2: Partikel-SVG ── */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full pointer-events-none"
      >
        <FloatingParticles colors={pColors} />
      </svg>

      {/* ── Layer 3: PNG Artwork (schwebend) ── */}
      <div className="absolute inset-0 flex items-center justify-center">
        <img
          src={`/img/${imageName}.png`}
          alt={imageLabel}
          className="card-artwork-img object-contain drop-shadow-2xl"
          style={{
            width:  isBoard ? '72%' : '68%',
            height: isBoard ? '82%' : '80%',
          }}
          draggable={false}
        />
      </div>

      {/* ── Layer 4: Holo-Foil (Concept C) ── */}
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

      {/* ── Layer 5: Prismatischer Sweep (Hover) ── */}
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

      {/* ── Layer 6: Vignette (Tiefe) ── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, transparent 35%, rgba(0,0,0,0.25) 100%)',
        }}
      />

      {/* ── Bildname-Label im Viewport ── */}
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
