import React from 'react';

interface SystemLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'full' | 'icon';
}

export const SystemLogo: React.FC<SystemLogoProps> = ({
  className = '',
  size = 48,
  variant = 'icon',
}) => {
  if (variant === 'full') {
    return (
      <svg
        viewBox="0 0 500 500"
        width={size}
        height={size}
        className={`drop-shadow-xs select-none ${className}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background Circle */}
        <circle cx="250" cy="250" r="230" fill="#0d633d" />

        {/* Sparkle Top-Right */}
        <path
          d="M 315 125 Q 315 142 327 142 Q 315 142 315 159 Q 315 142 303 142 Q 315 142 315 125 Z"
          fill="#ffffff"
        />

        {/* Sparkle Bottom-Left */}
        <path
          d="M 190 235 Q 190 248 199 248 Q 190 248 190 261 Q 190 248 181 248 Q 190 248 190 235 Z"
          fill="#ffffff"
        />

        {/* Isometric Cube (Equipment Box) */}
        <polygon
          points="230,130 295,165 230,200 165,165"
          fill="none"
          stroke="#ffffff"
          strokeWidth="11"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polygon
          points="165,165 230,200 230,268 165,233"
          fill="none"
          stroke="#ffffff"
          strokeWidth="11"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <polyline
          points="230,200 295,165 295,233 230,268"
          fill="none"
          stroke="#ffffff"
          strokeWidth="11"
          strokeLinejoin="round"
          strokeLinecap="round"
        />

        {/* Wrench (Tool) */}
        <g
          fill="none"
          stroke="#ffffff"
          strokeWidth="11"
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          <path d="M 285 200 C 275 192 270 178 274 166 C 278 154 290 146 303 147 C 316 148 327 158 329 171 C 330 178 328 185 324 191" />
          <path d="M 283 175 L 297 185 L 315 173" />
          <path d="M 292 203 L 292 270 A 10 10 0 0 0 312 270 L 312 203" />
        </g>

        {/* Thai Typography */}
        <text
          x="250"
          y="325"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="'IBM Plex Sans Thai', sans-serif"
          fontWeight="700"
          fontSize="22"
          letterSpacing="0.2"
        >
          ระบบยืม-คืนอุปกรณ์สื่อโสตทัศนูปกรณ์
        </text>

        {/* English Subtitle */}
        <text
          x="250"
          y="352"
          textAnchor="middle"
          fill="#ffffff"
          fontFamily="'IBM Plex Sans Thai', sans-serif"
          fontWeight="500"
          fontSize="12"
          opacity="0.95"
          letterSpacing="0.2"
        >
          (Educational Technology Equipment Borrowing System)
        </text>
      </svg>
    );
  }

  // Variant "icon" - Optimized for compact badge icon in Navbar / Mobile
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`select-none ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Background Circle */}
      <circle cx="50" cy="50" r="48" fill="#0d633d" />

      {/* Sparkle Top-Right */}
      <path
        d="M 64 24 Q 64 28 67 28 Q 64 28 64 32 Q 64 28 61 28 Q 64 28 64 24 Z"
        fill="#ffffff"
      />

      {/* Sparkle Bottom-Left */}
      <path
        d="M 37 54 Q 37 57 39 57 Q 37 57 37 60 Q 37 57 35 57 Q 37 57 37 54 Z"
        fill="#ffffff"
      />

      {/* Isometric Cube (Equipment Box) */}
      <polygon
        points="46,26 62,34 46,42 30,34"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <polygon
        points="30,34 46,42 46,58 30,50"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <polyline
        points="46,42 62,34 62,50 46,58"
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Wrench (Tool) */}
      <g
        fill="none"
        stroke="#ffffff"
        strokeWidth="3.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        <path d="M 59 42 C 56 40 55 36 56 33 C 58 30 61 28 64 29 C 67 29 70 32 70 35 C 70 37 70 39 68 40" />
        <path d="M 58 35 L 62 38 L 67 35" />
        <path d="M 61 43 L 61 58 A 2.5 2.5 0 0 0 66 58 L 66 43" />
      </g>

      {/* Small subtle brand mark arc */}
      <circle cx="50" cy="50" r="44" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.3" strokeDasharray="3 3" />
    </svg>
  );
};
