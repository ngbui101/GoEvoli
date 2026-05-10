import React from 'react';

export const AnimatedLogo: React.FC = () => {
  return (
    <div className="goevoli-logo" aria-hidden="true">
      <svg viewBox="0 0 96 96" className="h-full w-full" role="img">
        <defs>
          <radialGradient id="logoEgg" cx="50%" cy="34%" r="70%">
            <stop offset="0%" stopColor="#FFF9D9" />
            <stop offset="58%" stopColor="#F7E6B2" />
            <stop offset="100%" stopColor="#D6A86E" />
          </radialGradient>
          <linearGradient id="logoFur" x1="25%" x2="75%" y1="18%" y2="88%">
            <stop offset="0%" stopColor="#D69A56" />
            <stop offset="100%" stopColor="#9F6237" />
          </linearGradient>
          <linearGradient id="logoCream" x1="25%" x2="70%" y1="10%" y2="90%">
            <stop offset="0%" stopColor="#FFF8D2" />
            <stop offset="100%" stopColor="#EFD090" />
          </linearGradient>
          <filter id="logoSoftShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#4D3122" floodOpacity="0.22" />
          </filter>
        </defs>

        <ellipse cx="48" cy="82" rx="27" ry="6" fill="#4D3122" opacity="0.14" className="goevoli-logo-shadow" />

        <g className="goevoli-baby" filter="url(#logoSoftShadow)">
          <path className="goevoli-ear-left" d="M32 31 C24 11 24 7 37 19 L43 35 Z" fill="url(#logoFur)" />
          <path className="goevoli-ear-left" d="M33 27 C29 15 30 14 38 23 L40 32 Z" fill="#F6D693" opacity="0.9" />
          <path className="goevoli-ear-right" d="M64 31 C72 11 72 7 59 19 L53 35 Z" fill="url(#logoFur)" />
          <path className="goevoli-ear-right" d="M63 27 C67 15 66 14 58 23 L56 32 Z" fill="#F6D693" opacity="0.9" />
          <circle cx="48" cy="47" r="23" fill="url(#logoFur)" />
          <path d="M33 54 C39 68 57 68 63 54 C57 61 39 61 33 54 Z" fill="url(#logoCream)" />
          <path d="M41 60 L48 51 L55 60 L52 71 L44 71 Z" fill="url(#logoCream)" />
          <g className="goevoli-logo-blink">
            <circle cx="39" cy="45" r="3.4" fill="#3A2418" />
            <circle cx="57" cy="45" r="3.4" fill="#3A2418" />
            <circle cx="40.2" cy="43.8" r="1" fill="#FFFFFF" />
            <circle cx="58.2" cy="43.8" r="1" fill="#FFFFFF" />
          </g>
          <path d="M45 51 C47 53 49 53 51 51" fill="none" stroke="#3A2418" strokeWidth="2" strokeLinecap="round" />
          <path d="M47 48 L49 48 L48 50 Z" fill="#3A2418" />
          <path className="goevoli-paw-left" d="M30 62 C25 62 22 66 23 70 C28 72 34 69 35 64 Z" fill="#9F6237" />
          <path className="goevoli-paw-right" d="M66 62 C71 62 74 66 73 70 C68 72 62 69 61 64 Z" fill="#9F6237" />
        </g>

        <g className="goevoli-egg" filter="url(#logoSoftShadow)">
          <path
            d="M48 12 C65 12 78 35 78 55 C78 75 65 86 48 86 C31 86 18 75 18 55 C18 35 31 12 48 12 Z"
            fill="url(#logoEgg)"
            stroke="#925D3B"
            strokeWidth="3"
          />
          <text x="48" y="62" textAnchor="middle" fill="#925D3B" fontSize="36" fontWeight="900" fontFamily="Outfit, Inter, sans-serif">
            G
          </text>
          <path className="goevoli-crack crack-one" d="M35 35 L43 43 L38 51 L48 58" fill="none" stroke="#925D3B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          <path className="goevoli-crack crack-two" d="M61 32 L53 41 L59 49 L50 58" fill="none" stroke="#925D3B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        <g className="goevoli-shell-top" filter="url(#logoSoftShadow)">
          <path d="M22 45 C29 25 38 13 48 13 C58 13 67 25 74 45 L63 41 L55 49 L48 42 L40 49 L33 41 Z" fill="url(#logoEgg)" stroke="#925D3B" strokeWidth="3" strokeLinejoin="round" />
        </g>

        <g className="goevoli-shell-bottom" filter="url(#logoSoftShadow)">
          <path d="M20 56 L31 62 L39 55 L48 63 L57 55 L65 62 L76 56 C75 75 63 86 48 86 C33 86 21 75 20 56 Z" fill="url(#logoEgg)" stroke="#925D3B" strokeWidth="3" strokeLinejoin="round" />
        </g>

        <g className="goevoli-sparkles">
          <path d="M19 24 L21 29 L26 31 L21 33 L19 38 L17 33 L12 31 L17 29 Z" fill="#FFF4B8" stroke="#925D3B" strokeWidth="1" />
          <path d="M78 23 L80 27 L84 29 L80 31 L78 35 L76 31 L72 29 L76 27 Z" fill="#FFF4B8" stroke="#925D3B" strokeWidth="1" />
        </g>
      </svg>
    </div>
  );
};

