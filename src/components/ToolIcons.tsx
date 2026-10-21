import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  hue?: string;
  isHovered?: boolean;
}

/**
 * 01. Universal Image Format Converter
 * Purposeful line icon: overlapping image frames with two-way swap arrows (1.5px stroke).
 * Hover micro-interaction: swap arrows shift and swap positions.
 */
export const FormatConverterIcon: React.FC<IconProps> = ({
  className = 'w-6 h-6',
  size = 24,
  hue = '#5EC4BA',
  isHovered = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Base frame */}
    <rect
      x="3"
      y="5"
      width="13"
      height="13"
      rx="2.5"
      stroke="#8FA3AB"
      strokeWidth="1.5"
      strokeOpacity="0.8"
    />
    {/* Overlapping converted frame */}
    <rect
      x="8"
      y="7"
      width="13"
      height="13"
      rx="2.5"
      stroke={hue}
      strokeWidth="1.5"
      fill={hue}
      fillOpacity="0.08"
    />
    {/* Swap arrow top (pointing right) */}
    <g
      className="transition-transform duration-300 ease-out"
      style={{
        transform: isHovered ? 'translateX(2.5px)' : 'none',
      }}
    >
      <path
        d="M6 10H14M14 10L11.5 7.5M14 10L11.5 12.5"
        stroke="#EAF2F4"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
    {/* Swap arrow bottom (pointing left) */}
    <g
      className="transition-transform duration-300 ease-out"
      style={{
        transform: isHovered ? 'translateX(-2.5px)' : 'none',
      }}
    >
      <path
        d="M16 16H8M8 16L10.5 13.5M8 16L10.5 18.5"
        stroke={hue}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

/**
 * 02. Image Quality Enhancer
 * Purposeful line icon: sparkle with optical focus bracket (1.5px stroke).
 * Hover micro-interaction: sparkle twinkles (rotates + pulses once).
 */
export const QualityEnhancerIcon: React.FC<IconProps> = ({
  className = 'w-6 h-6',
  size = 24,
  hue = '#E6B866',
  isHovered = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Optical focus brackets */}
    <path
      d="M4 8V5C4 4.44772 4.44772 4 5 4H8"
      stroke="#8FA3AB"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M16 4H19C19.5523 4 20 4.44772 20 5V8"
      stroke="#8FA3AB"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M20 16V19C20 19.5523 19.5523 20 19 20H16"
      stroke="#8FA3AB"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <path
      d="M8 20H5C4.44772 20 4 19.5523 4 19V16"
      stroke="#8FA3AB"
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    {/* Central 4-point sparkle */}
    <g
      className="transition-transform duration-500 ease-out origin-center"
      style={{
        transform: isHovered ? 'scale(1.18) rotate(45deg)' : 'none',
        transformOrigin: '12px 12px',
      }}
    >
      <path
        d="M12 6C12 9.5 9.5 12 6 12C9.5 12 12 14.5 12 18C12 14.5 14.5 12 18 12C14.5 12 12 9.5 12 6Z"
        stroke={hue}
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill={hue}
        fillOpacity="0.16"
      />
      <circle cx="12" cy="12" r="1.25" fill="#EAF2F4" />
    </g>
  </svg>
);

/**
 * 03. Accurate AI Background Remover
 * Purposeful line icon: subject cutout silhouette over transparency checkerboard (1.5px stroke).
 * Hover micro-interaction: checkerboard reveals / fades into view.
 */
export const BackgroundRemoverIcon: React.FC<IconProps> = ({
  className = 'w-6 h-6',
  size = 24,
  hue = '#A08BF5',
  isHovered = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Alpha transparency checkerboard dots */}
    <g
      className="transition-opacity duration-300 ease-out"
      style={{ opacity: isHovered ? 0.9 : 0.35 }}
    >
      <rect x="4" y="4" width="2.5" height="2.5" fill="#8FA3AB" rx="0.5" />
      <rect x="9" y="4" width="2.5" height="2.5" fill="#8FA3AB" rx="0.5" />
      <rect x="17.5" y="4" width="2.5" height="2.5" fill="#8FA3AB" rx="0.5" />
      <rect x="17.5" y="9" width="2.5" height="2.5" fill="#8FA3AB" rx="0.5" />
      <rect x="4" y="17.5" width="2.5" height="2.5" fill="#8FA3AB" rx="0.5" />
      <rect x="17.5" y="17.5" width="2.5" height="2.5" fill="#8FA3AB" rx="0.5" />
    </g>

    {/* Subject silhouette cutout */}
    {/* Head */}
    <circle
      cx="12"
      cy="8.5"
      r="2.75"
      stroke={hue}
      strokeWidth="1.5"
      fill={hue}
      fillOpacity="0.16"
    />
    {/* Shoulders */}
    <path
      d="M7 18.5C7 15.4624 9.46243 13 12.5 13C15.5376 13 18 15.4624 18 18.5"
      stroke={hue}
      strokeWidth="1.5"
      strokeLinecap="round"
      fill={hue}
      fillOpacity="0.16"
    />

    {/* Marching ants / cutting perimeter dashed line on right */}
    <path
      d="M20 7V17"
      stroke="#EAF2F4"
      strokeWidth="1.5"
      strokeDasharray="2 3"
      strokeLinecap="round"
      className="transition-all duration-300"
      style={{
        strokeDashoffset: isHovered ? 5 : 0,
      }}
    />
  </svg>
);

/**
 * 04. Universal Units & Quantities
 * Purposeful line icon: ruler with two-way measurement arrows (1.5px stroke).
 * Hover micro-interaction: ruler millimeter ticks slide.
 */
export const UnitsQuantitiesIcon: React.FC<IconProps> = ({
  className = 'w-6 h-6',
  size = 24,
  hue = '#6FA9F5',
  isHovered = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Ruler main body */}
    <rect
      x="3"
      y="7"
      width="18"
      height="6"
      rx="1.5"
      stroke="#8FA3AB"
      strokeWidth="1.5"
    />

    {/* Ruler graduation tick marks */}
    <g
      className="transition-transform duration-300 ease-out"
      style={{
        transform: isHovered ? 'translateX(1.5px)' : 'none',
      }}
    >
      <line x1="6" y1="7" x2="6" y2="10" stroke="#EAF2F4" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="9" y1="7" x2="9" y2="11" stroke={hue} strokeWidth="1.25" strokeLinecap="round" />
      <line x1="12" y1="7" x2="12" y2="10" stroke="#EAF2F4" strokeWidth="1.25" strokeLinecap="round" />
      <line x1="15" y1="7" x2="15" y2="11" stroke={hue} strokeWidth="1.25" strokeLinecap="round" />
      <line x1="18" y1="7" x2="18" y2="10" stroke="#EAF2F4" strokeWidth="1.25" strokeLinecap="round" />
    </g>

    {/* Two-way conversion arrows below */}
    <g
      className="transition-transform duration-300 ease-out"
      style={{
        transform: isHovered ? 'scaleX(1.1)' : 'none',
        transformOrigin: '12px 18px',
      }}
    >
      <path
        d="M4 17.5H20M4 17.5L6.5 15.5M4 17.5L6.5 19.5M20 17.5L17.5 15.5M20 17.5L17.5 19.5"
        stroke={hue}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  </svg>
);

/**
 * 05. Body Mass Index Calculator
 * Purposeful line icon: semicircle biometric gauge with sweep needle (1.5px stroke).
 * Hover micro-interaction: needle sweeps across arc.
 */
export const BmiCalculatorIcon: React.FC<IconProps> = ({
  className = 'w-6 h-6',
  size = 24,
  hue = '#6FD49A',
  isHovered = false,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    {/* Semicircle gauge track */}
    <path
      d="M4 17C4 12.5817 7.58172 9 12 9C16.4183 9 20 12.5817 20 17"
      stroke="#8FA3AB"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeOpacity="0.6"
    />
    {/* Active WHO normal range arc section */}
    <path
      d="M8.5 11.2C9.55 10.4 10.7 10 12 10C13.3 10 14.45 10.4 15.5 11.2"
      stroke={hue}
      strokeWidth="1.5"
      strokeLinecap="round"
    />

    {/* Range tick marks */}
    <line x1="4" y1="17" x2="6" y2="17" stroke="#8FA3AB" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="20" y1="17" x2="18" y2="17" stroke="#8FA3AB" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="12" y1="9" x2="12" y2="11" stroke={hue} strokeWidth="1.5" strokeLinecap="round" />

    {/* Pivot center */}
    <circle cx="12" cy="17" r="2" fill="#EAF2F4" />

    {/* Sweeping needle */}
    <g
      className="transition-transform duration-500 cubic-bezier(0.34, 1.56, 0.64, 1)"
      style={{
        transform: isHovered ? 'rotate(24deg)' : 'rotate(-12deg)',
        transformOrigin: '12px 17px',
      }}
    >
      <line
        x1="12"
        y1="17"
        x2="15.5"
        y2="11"
        stroke={hue}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </g>
  </svg>
);
