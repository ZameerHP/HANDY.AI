import React, { useState, useEffect, useRef } from 'react';

interface DemoProps {
  isVisible: boolean;
  isHovered: boolean;
}

export const DemoBackgroundRemover: React.FC<DemoProps> = ({ isVisible, isHovered }) => {
  const [wipeProgress, setWipeProgress] = useState<number>(100); // 0 (original) to 100 (cutout)
  const [mode, setMode] = useState<'cutout' | 'original'>('cutout');
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef<boolean>(false);
  const userInteractedRef = useRef<boolean>(false);

  // Auto-wipe cycle when user hasn't interacted
  useEffect(() => {
    if (!isVisible || userInteractedRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setWipeProgress(100);
      setMode('cutout');
      return;
    }

    let isCutout = true;
    const intervalSpeed = isHovered ? 2200 : 3200;
    const interval = setInterval(() => {
      if (userInteractedRef.current) return;
      isCutout = !isCutout;
      setWipeProgress(isCutout ? 100 : 0);
      setMode(isCutout ? 'cutout' : 'original');
    }, intervalSpeed);

    return () => clearInterval(interval);
  }, [isVisible, isHovered]);

  const updateWipe = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = (x / rect.width) * 100;
    setWipeProgress(percent);
    setMode(percent >= 50 ? 'cutout' : 'original');
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    userInteractedRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateWipe(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      updateWipe(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const handleToggle = (newMode: 'original' | 'cutout') => {
    userInteractedRef.current = true;
    setMode(newMode);
    setWipeProgress(newMode === 'cutout' ? 100 : 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    userInteractedRef.current = true;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setWipeProgress((p) => Math.max(0, p - 10));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setWipeProgress((p) => Math.min(100, p + 10));
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-3 sm:p-5 select-none overflow-hidden">
      {/* Top Interactive Toggle: [Original | Cutout] */}
      <div className="mb-3 z-20 flex items-center p-1 rounded-full bg-[#05090D] border border-white/10 shadow-sm">
        <button
          type="button"
          onClick={() => handleToggle('original')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer ${
            mode === 'original' && wipeProgress < 50
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-[#8FA3AB] hover:text-white'
          }`}
        >
          Original
        </button>
        <button
          type="button"
          onClick={() => handleToggle('cutout')}
          className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
            mode === 'cutout' && wipeProgress >= 50
              ? 'bg-[#A08BF5]/25 text-white border border-[#A08BF5]/40 shadow-sm'
              : 'text-[#8FA3AB] hover:text-white'
          }`}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#A08BF5]" />
          <span>Cutout</span>
        </button>
      </div>

      {/* Container Frame with Transparency Checkerboard */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        tabIndex={0}
        role="region"
        aria-label="Interactive background removal wipe comparison"
        onKeyDown={handleKeyDown}
        className="relative w-full max-w-[300px] sm:max-w-[340px] aspect-[4/3] rounded-[16px] overflow-hidden bg-[#0A1218] border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.6)] cursor-ew-resize touch-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#A08BF5] group"
      >
        {/* Background Layer: Transparency Checkerboard */}
        <div className="absolute inset-0 bg-checker opacity-90" />

        {/* Foreground Layer 1: Cutout with transparent background (always present on top of checkerboard) */}
        <img
          src="/assets/tools/demo-chair-cutout.png"
          alt="Clean background-removed armchair cutout"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-contain pointer-events-none transition-transform duration-300 group-hover:scale-102"
        />

        {/* Foreground Layer 2: Original Photo with full studio backdrop, wiping away with clip-path */}
        <div
          className="absolute inset-0 overflow-hidden pointer-events-none transition-all duration-500 ease-out"
          style={{
            clipPath: `polygon(${wipeProgress}% 0, 100% 0, 100% 100%, ${wipeProgress}% 100%)`,
            opacity: wipeProgress >= 99 ? 0 : 1,
          }}
        >
          <img
            src="/assets/tools/demo-chair.jpg"
            alt="Original photograph with studio background"
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-102"
          />
        </div>

        {/* Moving Wipe Edge Accent Bar */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-[#A08BF5] shadow-[0_0_14px_rgba(160,139,245,0.9)] pointer-events-none transition-all duration-300 ease-out"
          style={{
            left: `${wipeProgress}%`,
            opacity: wipeProgress > 0 && wipeProgress < 100 ? 1 : 0,
          }}
        />

        {/* Subdued corner indicator */}
        <div className="absolute bottom-2.5 left-2.5 bg-[#05090D]/85 backdrop-blur-md px-2 py-0.5 rounded-[5px] text-[10px] font-mono text-[#A08BF5] border border-[#A08BF5]/25 pointer-events-none">
          {wipeProgress >= 50 ? 'Alpha cutout' : 'Studio source'}
        </div>
        <div className="absolute bottom-2.5 right-2.5 bg-[#05090D]/80 backdrop-blur-md px-2 py-0.5 rounded-full text-[10px] text-[#8FA3AB] pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          Drag to wipe
        </div>
      </div>
    </div>
  );
};
