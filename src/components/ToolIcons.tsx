import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
}

/**
 * 1. Universal Image Format Converter
 * Geometric interlocking frames / transform mark with corner registration ticks
 */
export const FormatConverterIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Background soft ambient badge glow */}
    <rect x="2" y="2" width="36" height="36" rx="8" fill="#5EC4BA" fillOpacity="0.06" />
    
    {/* Base portrait frame */}
    <rect
      x="8"
      y="12"
      width="18"
      height="22"
      rx="3"
      stroke="#8FA3AB"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeDasharray="2 3"
    />
    
    {/* Interlocking landscape target frame */}
    <rect
      x="14"
      y="6"
      width="20"
      height="18"
      rx="3"
      stroke="#5EC4BA"
      strokeWidth="1.5"
    />
    
    {/* Intersecting center node */}
    <circle cx="21" cy="18" r="2.5" fill="#5EC4BA" />
    <circle cx="21" cy="18" r="5" stroke="#5EC4BA" strokeWidth="0.75" strokeOpacity="0.4" />
    
    {/* Transform dynamic arrow */}
    <path
      d="M10 9L15 6.5M15 6.5L13.5 11.5M15 6.5L7 10"
      stroke="#EAF2F4"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    
    {/* Precision corner registration ticks */}
    <path d="M16 8.5H18" stroke="#EAF2F4" strokeWidth="1" strokeLinecap="round" />
    <path d="M31 8.5H32" stroke="#EAF2F4" strokeWidth="1" strokeLinecap="round" />
    <path d="M10 31H12" stroke="#8FA3AB" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

/**
 * 2. Image Quality Enhancer
 * Aperture / focus diamond crystal with clarity facets and optical focus markers
 */
export const QualityEnhancerIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Subtle glow background */}
    <rect x="2" y="2" width="36" height="36" rx="8" fill="#5EC4BA" fillOpacity="0.06" />

    {/* Outer focus brackets */}
    <path d="M7 13V9C7 7.89543 7.89543 7 9 7H13" stroke="#8FA3AB" strokeWidth="1.25" strokeLinecap="round" />
    <path d="M27 7H31C32.1046 7 33 7.89543 33 9V13" stroke="#8FA3AB" strokeWidth="1.25" strokeLinecap="round" />
    <path d="M33 27V31C33 32.1046 32.1046 33 31 33H27" stroke="#8FA3AB" strokeWidth="1.25" strokeLinecap="round" />
    <path d="M13 33H9C7.89543 33 7 32.1046 7 31V27" stroke="#8FA3AB" strokeWidth="1.25" strokeLinecap="round" />

    {/* Central multi-faceted crystal diamond */}
    <polygon
      points="20,10 28,18 20,30 12,18"
      stroke="#5EC4BA"
      strokeWidth="1.5"
      strokeLinejoin="round"
      fill="#5EC4BA"
      fillOpacity="0.12"
    />

    {/* Internal diamond facets */}
    <line x1="12" y1="18" x2="28" y2="18" stroke="#5EC4BA" strokeWidth="1" strokeOpacity="0.8" />
    <line x1="20" y1="10" x2="20" y2="30" stroke="#EAF2F4" strokeWidth="1" strokeOpacity="0.6" />
    <polygon points="20,10 24,18 20,25 16,18" stroke="#EAF2F4" strokeWidth="0.75" fill="none" strokeOpacity="0.5" />

    {/* Aperture light sparkle */}
    <circle cx="20" cy="18" r="1.5" fill="#FFFFFF" />
  </svg>
);

/**
 * 3. AI Background Remover
 * Subject cutout silhouette surrounded by dotted precision perimeter mask and alpha checker
 */
export const BackgroundRemoverIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Subtle glow background */}
    <rect x="2" y="2" width="36" height="36" rx="8" fill="#5EC4BA" fillOpacity="0.06" />

    {/* Dotted perimeter cutting line (marching ants mask) */}
    <rect
      x="6"
      y="6"
      width="28"
      height="28"
      rx="6"
      stroke="#8FA3AB"
      strokeWidth="1.25"
      strokeDasharray="2 3"
      strokeOpacity="0.6"
    />

    {/* Stylized subject silhouette cutout */}
    {/* Head */}
    <circle cx="20" cy="14" r="4" stroke="#5EC4BA" strokeWidth="1.5" fill="#5EC4BA" fillOpacity="0.2" />
    {/* Torso/Shoulders */}
    <path
      d="M12 29C12 24.5817 15.5817 21 20 21C24.4183 21 28 24.5817 28 29"
      stroke="#5EC4BA"
      strokeWidth="1.5"
      strokeLinecap="round"
      fill="#5EC4BA"
      fillOpacity="0.15"
    />

    {/* Alpha transparency checkerboard dots on the exterior */}
    <rect x="8" y="8" width="3" height="3" fill="#8FA3AB" fillOpacity="0.3" rx="0.5" />
    <rect x="14" y="8" width="3" height="3" fill="#8FA3AB" fillOpacity="0.15" rx="0.5" />
    <rect x="29" y="8" width="3" height="3" fill="#8FA3AB" fillOpacity="0.3" rx="0.5" />
    <rect x="29" y="14" width="3" height="3" fill="#8FA3AB" fillOpacity="0.15" rx="0.5" />
    <rect x="8" y="27" width="3" height="3" fill="#8FA3AB" fillOpacity="0.2" rx="0.5" />
    <rect x="29" y="27" width="3" height="3" fill="#8FA3AB" fillOpacity="0.2" rx="0.5" />

    {/* Scissors / scalpel marker indicator */}
    <path
      d="M26 10L30 6M30 6H27M30 6V9"
      stroke="#5EC4BA"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * 4. Universal Units & Quantities
 * Precision vernier calipers with dial ruler balance and scale ticks
 */
export const UnitsQuantitiesIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Subtle glow background */}
    <rect x="2" y="2" width="36" height="36" rx="8" fill="#5EC4BA" fillOpacity="0.06" />

    {/* Horizontal caliper beam */}
    <rect x="7" y="13" width="26" height="5" rx="1.5" stroke="#8FA3AB" strokeWidth="1.2" />

    {/* Ruler millimeter graduation ticks */}
    <line x1="12" y1="13" x2="12" y2="15.5" stroke="#EAF2F4" strokeWidth="1" strokeLinecap="round" />
    <line x1="15" y1="13" x2="15" y2="17" stroke="#5EC4BA" strokeWidth="1" strokeLinecap="round" />
    <line x1="18" y1="13" x2="18" y2="15.5" stroke="#EAF2F4" strokeWidth="1" strokeLinecap="round" />
    <line x1="21" y1="13" x2="21" y2="17" stroke="#5EC4BA" strokeWidth="1" strokeLinecap="round" />
    <line x1="24" y1="13" x2="24" y2="15.5" stroke="#EAF2F4" strokeWidth="1" strokeLinecap="round" />
    <line x1="27" y1="13" x2="27" y2="17" stroke="#5EC4BA" strokeWidth="1" strokeLinecap="round" />

    {/* Fixed caliper jaw */}
    <path d="M7 13V25C7 26.5 8.5 28 10 28" stroke="#8FA3AB" strokeWidth="1.5" strokeLinecap="round" />

    {/* Moving vernier jaw */}
    <path d="M22 13V25C22 26.5 20.5 28 19 28" stroke="#5EC4BA" strokeWidth="1.5" strokeLinecap="round" />

    {/* Circular precision balance dial / needle at bottom */}
    <circle cx="27" cy="27" r="5" stroke="#5EC4BA" strokeWidth="1.25" fill="#0A1218" />
    <line x1="27" y1="27" x2="29" y2="24.5" stroke="#EAF2F4" strokeWidth="1.2" strokeLinecap="round" />
    <circle cx="27" cy="27" r="1" fill="#5EC4BA" />
  </svg>
);

/**
 * 5. Body Mass Index Calculator
 * Harmonic balance scale with calibrated biometric axis and metric gauge
 */
export const BmiCalculatorIcon: React.FC<IconProps> = ({ className = 'w-10 h-10', size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 40 40"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Subtle glow background */}
    <rect x="2" y="2" width="36" height="36" rx="8" fill="#5EC4BA" fillOpacity="0.06" />

    {/* Central vertical biometric spinal axis */}
    <line x1="20" y1="7" x2="20" y2="33" stroke="#8FA3AB" strokeWidth="1.5" strokeLinecap="round" />

    {/* Harmonic horizontal beam balance */}
    <path d="M10 16L20 13L30 16" stroke="#5EC4BA" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

    {/* Fulcrum point */}
    <circle cx="20" cy="13" r="2.5" fill="#5EC4BA" />
    <circle cx="20" cy="13" r="4.5" stroke="#5EC4BA" strokeWidth="0.75" strokeOpacity="0.4" />

    {/* Left weight pan */}
    <path d="M10 16V22M7 22H13" stroke="#EAF2F4" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M7 22C7 24 8.5 25.5 10 25.5C11.5 25.5 13 24 13 22" fill="#5EC4BA" fillOpacity="0.2" />

    {/* Right height pan with measurement ticks */}
    <path d="M30 16V22M27 22H33" stroke="#EAF2F4" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M27 22C27 24 28.5 25.5 30 25.5C31.5 25.5 33 24 33 22" fill="#5EC4BA" fillOpacity="0.2" />

    {/* Calibrated biometric base pedestal */}
    <path d="M14 33H26" stroke="#8FA3AB" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M17 30H23" stroke="#5EC4BA" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);
