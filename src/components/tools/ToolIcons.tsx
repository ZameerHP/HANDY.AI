import React from 'react';

interface ToolIconProps {
  className?: string;
}

/**
 * Universal Image Format Converter:
 * Two overlapping image frames with swap arrows between them.
 * Micro-animation: arrows slide/swap slightly on hover.
 */
export const ConverterIcon: React.FC<ToolIconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      className={`${className} stroke-[1.5] transition-colors`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Back image frame */}
      <rect x="7" y="3" width="14" height="13" rx="2" className="opacity-40" />
      {/* Front image frame */}
      <rect x="3" y="8" width="14" height="13" rx="2" />
      {/* Small mountain peak in front frame */}
      <path d="M5.5 17l3.5-3.5 2.5 2.5 3-3 2.5 4" />
      {/* Top swap arrow */}
      <path
        d="M10 5.5h4m0 0l-1.5-1.5m1.5 1.5l-1.5 1.5"
        className="transition-transform duration-300 group-hover:translate-x-1"
      />
      {/* Bottom swap arrow */}
      <path
        d="M14 18.5h-4m0 0l1.5-1.5m-1.5 1.5l1.5 1.5"
        className="transition-transform duration-300 group-hover:-translate-x-1"
      />
    </svg>
  );
};

/**
 * Image Quality Enhancer:
 * Focus bracket framing a star sparkle.
 * Micro-animation: sparkle rotates/scales slightly on hover.
 */
export const EnhancerIcon: React.FC<ToolIconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      className={`${className} stroke-[1.5] transition-colors`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Focus brackets */}
      <path d="M4 8V5a1 1 0 0 1 1-1h3" />
      <path d="M16 4h3a1 1 0 0 1 1 1v3" />
      <path d="M20 16v3a1 1 0 0 1-1 1h-3" />
      <path d="M8 20H5a1 1 0 0 1-1-1v-3" />
      {/* Center 4-point sparkle */}
      <path
        d="M12 7c0 2.76 2.24 5 5 5-2.76 0-5 2.24-5 5 0-2.76-2.24-5-5-5 2.76 0 5-2.24 5-5z"
        className="transition-transform duration-500 origin-center group-hover:rotate-45 group-hover:scale-110"
      />
    </svg>
  );
};

/**
 * Accurate AI Background Remover:
 * Subject silhouette floating cleanly over a subtle checkerboard pattern.
 * Micro-animation: checkerboard pattern reveals/shifts on hover.
 */
export const BgRemoverIcon: React.FC<ToolIconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      className={`${className} stroke-[1.5] transition-colors`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Background checkerboard boundary */}
      <rect x="3" y="3" width="18" height="18" rx="3" className="opacity-40" />
      {/* Checkerboard squares */}
      <rect x="3" y="3" width="4.5" height="4.5" fill="currentColor" fillOpacity="0.15" stroke="none" />
      <rect x="7.5" y="7.5" width="4.5" height="4.5" fill="currentColor" fillOpacity="0.15" stroke="none" />
      <rect x="12" y="3" width="4.5" height="4.5" fill="currentColor" fillOpacity="0.15" stroke="none" />
      <rect x="16.5" y="7.5" width="4.5" height="4.5" fill="currentColor" fillOpacity="0.15" stroke="none" />
      {/* Subject cutout profile: head and shoulders */}
      <circle
        cx="12"
        cy="9.5"
        r="2.8"
        className="transition-transform duration-300 group-hover:-translate-y-0.5"
      />
      <path
        d="M6.5 18.5a5.5 5.5 0 0 1 11 0"
        className="transition-transform duration-300 group-hover:-translate-y-0.5"
      />
      {/* Cutout scissor dash line */}
      <path
        d="M18 4.5l-2 2"
        className="transition-opacity duration-300 opacity-60 group-hover:opacity-100"
      />
    </svg>
  );
};

/**
 * Universal Units and Quantities Converter:
 * Precision ruler with tick marks and two-way conversion arrows.
 * Micro-animation: ruler ticks slide/translate horizontally.
 */
export const UnitsIcon: React.FC<ToolIconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      className={`${className} stroke-[1.5] transition-colors`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Ruler body */}
      <rect x="3" y="8" width="18" height="10" rx="2" />
      {/* Sliding ticks */}
      <g className="transition-transform duration-300 group-hover:translate-x-0.5">
        <line x1="7" y1="8" x2="7" y2="12" />
        <line x1="10" y1="8" x2="10" y2="11" />
        <line x1="13" y1="8" x2="13" y2="13" />
        <line x1="16" y1="8" x2="16" y2="11" />
      </g>
      {/* Two-way arrows above ruler */}
      <path
        d="M5 4.5h14m0 0l-2-2m2 2l-2 2M5 4.5l2-2m-2 2l2 2"
        className="transition-transform duration-300 group-hover:scale-x-105 origin-center"
      />
    </svg>
  );
};

/**
 * BMI Calculator:
 * Precision gauge meter with central needle.
 * Micro-animation: gauge needle sweeps smoothly on hover.
 */
export const BmiIcon: React.FC<ToolIconProps> = ({ className = 'w-6 h-6' }) => {
  return (
    <svg
      className={`${className} stroke-[1.5] transition-colors`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Gauge arc from 135deg to 45deg */}
      <path d="M4.5 16.5a8.5 8.5 0 1 1 15 0" />
      {/* Zone notches */}
      <line x1="7" y1="13.5" x2="8" y2="13" />
      <line x1="12" y1="6.5" x2="12" y2="7.5" />
      <line x1="17" y1="13.5" x2="16" y2="13" />
      {/* Base pivot */}
      <circle cx="12" cy="16.5" r="1.5" />
      {/* Needle pointing to normal/balanced, sweeps right on hover */}
      <line
        x1="12"
        y1="16.5"
        x2="15"
        y2="10.5"
        className="transition-transform duration-500 origin-[12px_16.5px] group-hover:rotate-[28deg]"
      />
    </svg>
  );
};
