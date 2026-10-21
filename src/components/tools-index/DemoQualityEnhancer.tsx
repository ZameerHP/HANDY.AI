import React, { useState, useEffect, useRef } from 'react';

interface DemoProps {
  isVisible: boolean;
  isHovered: boolean;
}

export const DemoQualityEnhancer: React.FC<DemoProps> = ({ isVisible, isHovered }) => {
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0 to 100
  const containerRef = useRef<HTMLDivElement>(null);
  const animFrameRef = useRef<number | null>(null);
  const sweepAngleRef = useRef<number>(0);
  const isDraggingRef = useRef<boolean>(false);
  const userInteractedRef = useRef<boolean>(false);

  // Auto-sweep loop when not hovered or dragged
  useEffect(() => {
    if (!isVisible || userInteractedRef.current) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setSliderPos(50);
      return;
    }

    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTime) / 1000;
      lastTime = currentTime;

      if (!isDraggingRef.current && !userInteractedRef.current) {
        const speed = isHovered ? 1.4 : 0.8;
        sweepAngleRef.current += delta * speed;
        // Oscillate smoothly between 26% and 74%
        const pos = 50 + Math.sin(sweepAngleRef.current) * 24;
        setSliderPos(pos);
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isVisible, isHovered]);

  const updatePosition = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percent = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setSliderPos(percent);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = true;
    userInteractedRef.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updatePosition(e.clientX);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingRef.current) {
      updatePosition(e.clientX);
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingRef.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    userInteractedRef.current = true;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setSliderPos((p) => Math.max(5, p - 5));
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      setSliderPos((p) => Math.min(95, p + 5));
    } else if (e.key === 'Home') {
      e.preventDefault();
      setSliderPos(5);
    } else if (e.key === 'End') {
      e.preventDefault();
      setSliderPos(95);
    }
  };

  return (
    <div
      className="relative w-full h-full flex flex-col items-center justify-center p-3 sm:p-5 select-none overflow-hidden"
    >
      {/* Visual comparison frame */}
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="relative w-full max-w-[340px] sm:max-w-[400px] aspect-[4/3] rounded-[16px] overflow-hidden bg-[#05090D] border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.6)] cursor-ew-resize touch-none group"
      >
        {/* Base layer: Degraded "Before" (soft/noisy sample) */}
        <img
          src="/assets/tools/demo-eagle-before.jpg"
          alt="Original photograph before enhancement"
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none"
        />

        {/* Clipped top layer: Genuine Handy "After" enhanced output */}
        <div
          className="absolute inset-0 h-full overflow-hidden pointer-events-none"
          style={{ width: `${sliderPos}%` }}
        >
          <img
            src="/assets/tools/demo-eagle-after.jpg"
            alt="Sharpened and denoised photograph"
            loading="lazy"
            decoding="async"
            className="absolute top-0 left-0 max-w-none h-full object-cover select-none"
            style={{
              width: containerRef.current?.clientWidth || '100%',
            }}
          />
        </div>

        {/* Sweep divider handle line */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-[#E6B866] shadow-[0_0_14px_rgba(230,184,102,0.8)] pointer-events-none"
          style={{ left: `calc(${sliderPos}% - 1px)` }}
        >
          {/* Circular thumb marker: keyboard accessible slider */}
          <div
            role="slider"
            tabIndex={0}
            aria-label="Before and after enhancement split handle"
            aria-valuenow={Math.round(sliderPos)}
            aria-valuemin={0}
            aria-valuemax={100}
            onKeyDown={handleKeyDown}
            className="pointer-events-auto absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-[#E6B866] text-[#05090D] flex items-center justify-center shadow-lg border-2 border-[#0A1218] hover:scale-110 active:scale-95 transition-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <svg
              className="w-3.5 h-3.5 text-[#05090D]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l-3 3 3 3m8-6l3 3-3 3" />
            </svg>
          </div>
        </div>

        {/* Subdued corner labels */}
        <div className="absolute top-3 left-3 bg-[#05090D]/85 backdrop-blur-md px-2.5 py-1 rounded-[6px] text-[11px] font-mono text-[#E6B866] border border-[#E6B866]/30 pointer-events-none flex items-center gap-1.5 shadow-sm">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E6B866]" />
          <span>Enhanced (Bilateral)</span>
        </div>
        <div className="absolute top-3 right-3 bg-[#05090D]/85 backdrop-blur-md px-2.5 py-1 rounded-[6px] text-[11px] font-mono text-[#8FA3AB] border border-white/10 pointer-events-none">
          Original
        </div>

        {/* Bottom hint */}
        <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 bg-[#05090D]/75 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] text-[#8FA3AB] border border-white/10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
          Drag or use arrow keys
        </div>
      </div>
    </div>
  );
};
