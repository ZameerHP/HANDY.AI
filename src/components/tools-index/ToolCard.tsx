import React, { useState, useRef, useEffect, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface ToolCardData {
  id: string;
  num: string;
  category: string;
  name: string;
  description: string;
  path: string;
  tags: string[];
  hue: string; // e.g. '#5EC4BA'
  hueRgb: string; // e.g. '94, 196, 186'
  buttonText: string;
  statusText: string;
  icon: (props: { hue: string; isHovered: boolean }) => React.ReactNode;
  renderStage: (props: { isVisible: boolean; isHovered: boolean }) => React.ReactNode;
}

interface ToolCardProps {
  tool: ToolCardData;
  onSelect: (path: string) => void;
  className?: string;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool, onSelect, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const stageInnerRef = useRef<HTMLDivElement>(null);

  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [spotlightPos, setSpotlightPos] = useState<{ x: number; y: number } | null>(null);
  const [tilt, setTilt] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // IntersectionObserver to pause demos when card is off-screen
  useEffect(() => {
    if (!cardRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  // Desktop Scroll Parallax: stage content moves ~6% slower than the card as page scrolls
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !cardRef.current || !stageInnerRef.current) return;

    // Only apply parallax on desktop (>= 1024px)
    if (window.innerWidth < 1024) return;

    const parallaxTween = gsap.fromTo(
      stageInnerRef.current,
      { y: -14 },
      {
        y: 14,
        ease: 'none',
        scrollTrigger: {
          trigger: cardRef.current,
          start: 'top bottom',
          end: 'bottom top',
          scrub: true,
        },
      }
    );

    return () => {
      parallaxTween.scrollTrigger?.kill();
      parallaxTween.kill();
    };
  }, []);

  // Pointer hover interactions: 3D tilt, spotlight tracking, border brightening
  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      // Ignore on touch devices
      if (e.pointerType === 'touch') return;
      if (!cardRef.current) return;

      const rect = cardRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      setSpotlightPos({ x, y });

      // Calculate 3D tilt (max 3 degrees)
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const tiltX = -((y - centerY) / centerY) * 3;
      const tiltY = ((x - centerX) / centerX) * 3;

      setTilt({ x: tiltX, y: tiltY });
    },
    []
  );

  const handlePointerEnter = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return;
    setIsHovered(true);
  };

  const handlePointerLeave = () => {
    setIsHovered(false);
    setSpotlightPos(null);
    setTilt({ x: 0, y: 0 });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelect(tool.path);
    }
  };

  return (
    <div
      ref={cardRef}
      role="link"
      tabIndex={0}
      aria-label={`${tool.name} — ${tool.buttonText}`}
      onClick={() => onSelect(tool.path)}
      onKeyDown={handleKeyDown}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
      className={`tool-card group relative flex flex-col rounded-[20px] bg-[#0F1A22] border border-white/[0.08] cursor-pointer outline-none transition-all duration-300 overflow-hidden ${className} active:scale-[0.985] md:active:scale-100`}
      style={
        {
          '--tool-hue': tool.hue,
          '--tool-hue-rgb': tool.hueRgb,
          transform: isHovered
            ? `perspective(1000px) translateY(-6px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
            : 'perspective(1000px) translateY(0) rotateX(0deg) rotateY(0deg)',
          borderColor: isHovered
            ? `rgba(${tool.hueRgb}, 0.40)`
            : 'rgba(255, 255, 255, 0.08)',
          boxShadow: isHovered
            ? `0 12px 32px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(${tool.hueRgb}, 0.15)`
            : 'none',
        } as React.CSSProperties
      }
    >
      {/* Soft spotlight following cursor inside card */}
      {spotlightPos && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300 z-30"
          style={{
            background: `radial-gradient(400px circle at ${spotlightPos.x}px ${spotlightPos.y}px, rgba(${tool.hueRgb}, 0.08), transparent 70%)`,
          }}
        />
      )}

      {/* 1. Stage (top, about 60% of card height): rounded visual area showing live demonstration */}
      <div
        ref={stageRef}
        className="relative w-full aspect-[16/10] sm:aspect-[16/10] lg:h-[280px] rounded-t-[19px] overflow-hidden border-b border-white/[0.06] select-none"
        style={{
          background: `radial-gradient(ellipse at top left, rgba(${tool.hueRgb}, 0.18) 0%, transparent 70%), #0F1A22`,
        }}
      >
        {/* Top-left metadata over stage: number (01 to 05) and small category label */}
        <div className="absolute top-4 left-5 z-20 flex items-center gap-2 text-[11px] font-mono tracking-wider text-[#8FA3AB] pointer-events-none">
          <span className="text-[#EAF2F4] font-medium">{tool.num}</span>
          <span className="text-white/20">·</span>
          <span className="uppercase text-[#8FA3AB]/90">{tool.category}</span>
        </div>

        {/* Stage Content with Parallax wrapper */}
        <div
          ref={stageInnerRef}
          className="w-full h-full will-change-transform flex items-center justify-center transition-transform duration-500 ease-out"
          style={{
            transform: isHovered ? 'scale(1.04)' : 'scale(1)',
          }}
        >
          {tool.renderStage({ isVisible, isHovered })}
        </div>
      </div>

      {/* 2. Body (bottom 40%) */}
      <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between gap-5 relative z-20">
        {/* Header row: 44px Icon tile + Tool Name */}
        <div className="space-y-3">
          <div className="flex items-center gap-3.5">
            {/* 44px icon tile, rounded 12px, tinted with tool hue at 14%, 1px hairline border */}
            <div
              className="w-11 h-11 rounded-[12px] flex items-center justify-center shrink-0 transition-colors duration-300"
              style={{
                backgroundColor: `rgba(${tool.hueRgb}, 0.14)`,
                border: `1px solid rgba(${tool.hueRgb}, 0.28)`,
              }}
            >
              {tool.icon({ hue: tool.hue, isHovered })}
            </div>

            <h3 className="text-[19px] sm:text-[21px] font-normal text-[#EAF2F4] tracking-tight group-hover:text-white transition-colors duration-200">
              {tool.name}
            </h3>
          </div>

          {/* Existing one-line description */}
          <p className="text-[14px] text-[#8FA3AB] leading-relaxed line-clamp-2">
            {tool.description}
          </p>

          {/* Existing tags in small monospace, separated by spacing only (no pills) */}
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-1 text-[11px] font-mono text-[#8FA3AB]/75">
            {tool.tags.map((tag, idx) => (
              <span key={idx} className="tracking-tight">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer row: primary button on left, quiet status on right */}
        <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between gap-4">
          {/* Primary Button */}
          <button
            type="button"
            tabIndex={-1} // card itself handles keyboard focus
            className="h-11 px-5 rounded-[10px] bg-[#fbfaff] hover:bg-white text-[#05090D] font-medium text-[13px] sm:text-[14px] tracking-tight flex items-center gap-2 transition-all duration-200 shadow-sm shrink-0"
          >
            <span>{tool.buttonText}</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1.5 text-base leading-none">
              →
            </span>
          </button>

          {/* Quiet Status on right */}
          <div className="flex items-center gap-2 text-right">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ backgroundColor: tool.hue }}
            />
            <span className="text-[11px] font-mono text-[#8FA3AB]/80 line-clamp-1">
              {tool.statusText}
            </span>
          </div>
        </div>
      </div>

      {/* Focus visible ring in tool hue */}
      <div
        className="absolute inset-0 rounded-[20px] pointer-events-none ring-offset-2 ring-offset-[#05090D] opacity-0 group-focus-visible:opacity-100 transition-opacity"
        style={{
          boxShadow: `0 0 0 2px ${tool.hue}`,
        }}
      />
    </div>
  );
};
