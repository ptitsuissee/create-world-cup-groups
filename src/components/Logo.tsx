import React from 'react';

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 48, className = '' }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Background Circle with gradient */}
      <circle cx="50" cy="50" r="48" fill="url(#gradient1)" />
      
      {/* Trophy Cup - Main body */}
      <path
        d="M35 32h30v10c0 8.284-6.716 15-15 15s-15-6.716-15-15v-10z"
        fill="url(#gradient2)"
        stroke="url(#gradient3)"
        strokeWidth="1.5"
      />
      
      {/* Trophy Handles */}
      <path
        d="M32 34c-5 0-9 3-9 8s4 6 7 6h2"
        stroke="url(#gradient2)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M68 34c5 0 9 3 9 8s-4 6-7 6h-2"
        stroke="url(#gradient2)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      
      {/* Trophy Base - stem */}
      <rect x="44" y="57" width="12" height="7" rx="1" fill="url(#gradient2)" />
      
      {/* Trophy Base - bottom */}
      <path
        d="M38 64h24c1.5 0 2.5 1 2.5 2.5v2c0 1.5-1 2.5-2.5 2.5H38c-1.5 0-2.5-1-2.5-2.5v-2c0-1.5 1-2.5 2.5-2.5z"
        fill="url(#gradient2)"
      />
      
      {/* "Match" element - Abstract soccer ball pattern */}
      <circle cx="50" cy="40" r="8" fill="white" opacity="0.3" />
      <path
        d="M50 33l2 3 3 1-2 3 0 3-3-1-3 1 0-3-2-3 3-1z"
        fill="white"
        opacity="0.9"
      />
      
      {/* Draw element - Shuffling cards/tickets around trophy */}
      <rect x="25" y="22" width="8" height="12" rx="1" fill="#FEF3C7" opacity="0.8" transform="rotate(-15 29 28)" />
      <rect x="67" y="22" width="8" height="12" rx="1" fill="#FEF3C7" opacity="0.8" transform="rotate(15 71 28)" />
      
      {/* Dynamic sparkles with animation */}
      <circle cx="22" cy="26" r="2.5" fill="#FFD700" opacity="0.9">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.5s" repeatCount="indefinite" />
        <animate attributeName="r" values="2;3;2" dur="1.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="78" cy="28" r="2" fill="#FFD700" opacity="0.8">
        <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" />
        <animate attributeName="r" values="1.5;2.5;1.5" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="74" cy="72" r="2.2" fill="#FFD700" opacity="0.85">
        <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
        <animate attributeName="r" values="1.8;2.8;1.8" dur="2.5s" repeatCount="indefinite" />
      </circle>
      <circle cx="26" cy="74" r="2.5" fill="#FFD700" opacity="0.9">
        <animate attributeName="opacity" values="0.4;1;0.4" dur="1.8s" repeatCount="indefinite" />
        <animate attributeName="r" values="2;3;2" dur="1.8s" repeatCount="indefinite" />
      </circle>
      
      {/* Small decorative stars */}
      <path d="M18 48l1 2 2 0.3-1.5 1.5 0.3 2-2-1-2 1 0.3-2-1.5-1.5 2-0.3z" fill="#FCD34D" opacity="0.7" />
      <path d="M82 52l1 2 2 0.3-1.5 1.5 0.3 2-2-1-2 1 0.3-2-1.5-1.5 2-0.3z" fill="#FCD34D" opacity="0.7" />
      
      {/* Pro badge */}
      <circle cx="70" cy="60" r="8" fill="url(#gradient4)" />
      <text x="70" y="63" fontSize="8" fill="white" textAnchor="middle" fontWeight="bold">P</text>
      
      {/* Gradients */}
      <defs>
        <linearGradient id="gradient1" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="50%" stopColor="#A855F7" />
          <stop offset="100%" stopColor="#EC4899" />
        </linearGradient>
        <linearGradient id="gradient2" x1="50" y1="30" x2="50" y2="72" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FBBF24" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="gradient3" x1="50" y1="30" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FEF3C7" />
          <stop offset="100%" stopColor="#FCD34D" />
        </linearGradient>
        <linearGradient id="gradient4" x1="70" y1="52" x2="70" y2="68" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#3B82F6" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
      </defs>
    </svg>
  );
}
