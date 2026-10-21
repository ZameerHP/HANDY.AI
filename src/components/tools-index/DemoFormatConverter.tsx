import React, { useState, useEffect, useRef } from 'react';

interface DemoProps {
  isVisible: boolean;
  isHovered: boolean;
}

const FORMATS = ['WebP', 'AVIF', 'JPG', 'ICO'] as const;

export const DemoFormatConverter: React.FC<DemoProps> = ({ isVisible, isHovered }) => {
  const [activeFormatIdx, setActiveFormatIdx] = useState<number>(0);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isVisible) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setActiveFormatIdx(0);
      return;
    }

    const intervalSpeed = isHovered ? 1400 : 2000;
    const interval = setInterval(() => {
      setActiveFormatIdx((prev) => (prev + 1) % FORMATS.length);
    }, intervalSpeed);

    return () => clearInterval(interval);
  }, [isVisible, isHovered]);

  const navigateToConverter = () => {
    window.history.pushState({}, '', '/image-converter');
    window.dispatchEvent(new PopStateEvent('popstate'));
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    navigateToConverter();
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-3 sm:p-5 select-none overflow-hidden">
      {/* Drop Target and Interactive Container */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={navigateToConverter}
        className={`relative w-full max-w-[320px] sm:max-w-[360px] rounded-[16px] bg-[#0A1218] border p-4 sm:p-5 flex flex-col items-center justify-center gap-3.5 shadow-[0_16px_40px_rgba(0,0,0,0.6)] cursor-pointer transition-all duration-300 group ${
          isDragOver
            ? 'border-[#5EC4BA] bg-[#5EC4BA]/10 scale-[1.02]'
            : 'border-white/10 hover:border-[#5EC4BA]/40'
        }`}
      >
        {/* Sample Photo Preview */}
        <div className="relative w-full h-28 sm:h-32 rounded-[12px] overflow-hidden border border-white/10 bg-[#05090D] flex items-center justify-center">
          <img
            src="/assets/tools/demo-format.jpg"
            alt="Sample photograph being converted locally"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover opacity-80 group-hover:scale-105 transition-transform duration-500"
          />

          {/* Cycling Format Badge */}
          <div className="absolute top-2.5 right-2.5 bg-[#05090D]/85 backdrop-blur-md px-2.5 py-1 rounded-[6px] text-xs font-mono font-medium text-[#5EC4BA] border border-[#5EC4BA]/30 flex items-center gap-1.5 shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5EC4BA] animate-pulse" />
            <span>Transcoding to .{FORMATS[activeFormatIdx].toLowerCase()}</span>
          </div>

          <div className="absolute bottom-2 left-2.5 bg-[#05090D]/85 backdrop-blur-md px-2 py-0.5 rounded text-[10px] text-[#8FA3AB] font-mono">
            Zero Uploads · Client RAM
          </div>
        </div>

        {/* Formats Pills Row */}
        <div className="flex items-center gap-1.5">
          {FORMATS.map((fmt, idx) => {
            const isActive = activeFormatIdx === idx;
            return (
              <span
                key={fmt}
                className={`px-2 py-0.5 rounded-[6px] text-[11px] font-mono transition-all duration-300 ${
                  isActive
                    ? 'bg-[#5EC4BA]/25 text-[#5EC4BA] border border-[#5EC4BA]/50 font-bold scale-105'
                    : 'bg-white/[0.04] text-[#8FA3AB] border border-white/[0.06]'
                }`}
              >
                {fmt}
              </span>
            );
          })}
        </div>

        {/* "Choose an image" Action Button */}
        <div className="w-full flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              navigateToConverter();
            }}
            className="w-full h-9 rounded-[10px] bg-white/[0.08] group-hover:bg-[#5EC4BA] text-[#EAF2F4] group-hover:text-[#05090D] text-xs font-medium border border-white/10 group-hover:border-transparent transition-all duration-200 flex items-center justify-center gap-2 shadow-sm cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Choose an image or drop file here</span>
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
        />
      </div>
    </div>
  );
};
