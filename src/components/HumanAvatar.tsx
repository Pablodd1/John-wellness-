import React from 'react';
import { cn } from '../lib/utils';

/**
 * HumanAvatar — deterministic illustrated human face per member.
 *
 * Stand-in for real profile photos ("for now"): no network, no stock-photo
 * licensing, and the same member always gets the same face (seeded by name).
 * Flat friendly vector in the Clinical Mint palette.
 */

// Deterministic 32-bit hash of the name → stable feature picks
function seedOf(name: string): number {
  let h = 2166136261;
  for (let i = 0; i < name.length; i++) {
    h ^= name.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const SKIN = ['#f2c9a4', '#e8b48a', '#c98d5f', '#9c6b43', '#6f4a2f'];
const HAIR = ['#2b2118', '#4a3423', '#7a5230', '#a8763e', '#5b5b5b', '#1f1f26'];
const SHIRT = ['#0f9d76', '#0d8a67', '#17936f', '#3f5a54', '#55716b', '#0a7256'];

// Hair styles: how the hair cap is drawn (path over the head circle)
function hairPath(style: number): string {
  switch (style) {
    case 0: return 'M18 30 Q22 8 50 8 Q78 8 82 30 Q70 20 50 20 Q30 20 18 30 Z';      // short crop
    case 1: return 'M16 34 Q18 6 50 6 Q82 6 84 34 Q80 18 62 22 Q40 26 30 22 Q20 22 16 34 Z'; // side part
    case 2: return 'M15 42 Q13 4 50 4 Q87 4 85 42 Q84 24 50 24 Q16 24 15 42 Z';    // long
    case 3: return 'M30 20 Q34 8 50 8 Q66 8 70 20 Q60 14 50 14 Q40 14 30 20 Z';    // receding / short buzz
    default: return 'M18 30 Q22 8 50 8 Q78 8 82 30 Q70 20 50 20 Q30 20 18 30 Z';
  }
}

export function HumanAvatar({
  name,
  size = 48,
  className,
}: {
  name: string;
  size?: number;
  className?: string;
}) {
  const s = seedOf(name || 'member');
  const skin = SKIN[s % SKIN.length];
  const hair = HAIR[(s >> 3) % HAIR.length];
  const shirt = SHIRT[(s >> 6) % SHIRT.length];
  const hairStyle = (s >> 9) % 4;
  const eyeY = 42 + ((s >> 12) % 3);
  const mouthW = 10 + ((s >> 15) % 6);
  const id = 'av' + s.toString(36);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`${name} avatar`}
      className={cn('flex-shrink-0', className)}
    >
      <defs>
        <clipPath id={id}><circle cx="50" cy="50" r="50" /></clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        {/* backdrop */}
        <rect width="100" height="100" fill="#e6f1ee" />
        {/* shoulders / shirt */}
        <path d="M50 74 C26 74 12 88 8 100 L92 100 C88 88 74 74 50 74 Z" fill={shirt} />
        {/* neck */}
        <rect x="42" y="62" width="16" height="16" rx="6" fill={skin} />
        {/* head */}
        <circle cx="50" cy="44" r="24" fill={skin} />
        {/* ears */}
        <circle cx="26" cy="45" r="4" fill={skin} />
        <circle cx="74" cy="45" r="4" fill={skin} />
        {/* hair */}
        <path d={hairPath(hairStyle)} fill={hair} />
        {/* eyes */}
        <circle cx="41" cy={eyeY} r="2.6" fill="#22332e" />
        <circle cx="59" cy={eyeY} r="2.6" fill="#22332e" />
        {/* brows */}
        <rect x="36" y={eyeY - 7} width="10" height="2.4" rx="1.2" fill={hair} opacity="0.85" />
        <rect x="54" y={eyeY - 7} width="10" height="2.4" rx="1.2" fill={hair} opacity="0.85" />
        {/* nose */}
        <path d={`M50 ${eyeY + 2} L47 ${eyeY + 9} L53 ${eyeY + 9}`} fill="none" stroke="#00000022" strokeWidth="1.6" strokeLinecap="round" />
        {/* smile */}
        <path d={`M${50 - mouthW / 2} ${eyeY + 14} Q50 ${eyeY + 19} ${50 + mouthW / 2} ${eyeY + 14}`} fill="none" stroke="#22332e" strokeWidth="2" strokeLinecap="round" />
      </g>
    </svg>
  );
}
