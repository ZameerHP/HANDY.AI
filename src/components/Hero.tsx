import React, { useState, useEffect, useRef, useCallback } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToSection, getLenis } from '../utils/scroll';
import {
  FormatConverterIcon,
  QualityEnhancerIcon,
  BackgroundRemoverIcon,
  UnitsQuantitiesIcon,
  BmiCalculatorIcon,
} from './ToolIcons';
import { DemoAllTools } from './tools-index/DemoAllTools';
import { DemoFormatConverter } from './tools-index/DemoFormatConverter';
import { DemoQualityEnhancer } from './tools-index/DemoQualityEnhancer';
import { DemoBackgroundRemover } from './tools-index/DemoBackgroundRemover';
import { DemoUnitsConverter } from './tools-index/DemoUnitsConverter';
import { DemoBmiCalculator } from './tools-index/DemoBmiCalculator';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onScrollToTools: () => void;
}

interface ProductTab {
  id: string;
  name: string;
  shortName: string;
  buttonNoun: string;
  path: string;
  hue: string;
  hueRgb: string;
  shortcut: string;
  icon: (hue: string, isHovered: boolean) => React.ReactNode;
  renderDemo: (
    isVisible: boolean,
    isHovered: boolean,
    onSelectTab: (idx: number) => void
  ) => React.ReactNode;
  ariaDescription: string;
}

const AllToolsIcon: React.FC<{ size?: number; hue?: string; className?: string }> = ({
  size = 16,
  hue = '#5EC4BA',
  className = 'w-4 h-4 shrink-0',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    style={{ stroke: hue }}
    aria-hidden="true"
  >
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
  </svg>
);

const PRODUCT_TABS: ProductTab[] = [
  {
    id: 'all',
    name: 'Handy Studio: All 5 Tools',
    shortName: 'All Tools',
    buttonNoun: 'Explore all tools',
    path: '#hero-tools-window',
    hue: '#5EC4BA',
    hueRgb: '94, 196, 186',
    shortcut: '0',
    icon: (h) => <AllToolsIcon size={16} hue={h} />,
    renderDemo: (vis, hov, onSelect) => (
      <DemoAllTools isVisible={vis} isHovered={hov} onSelectTab={onSelect} />
    ),
    ariaDescription:
      'Interactive demonstration of all 5 browser-powered tools running live simultaneously in memory.',
  },
  {
    id: 'convert',
    name: 'Universal Image Format Converter',
    shortName: 'Convert',
    buttonNoun: 'Open converter',
    path: '/image-converter',
    hue: '#5EC4BA',
    hueRgb: '94, 196, 186',
    shortcut: '1',
    icon: (h, isH) => (
      <FormatConverterIcon size={16} hue={h} isHovered={isH} className="w-4 h-4 shrink-0" />
    ),
    renderDemo: (vis, hov) => <DemoFormatConverter isVisible={vis} isHovered={hov} />,
    ariaDescription:
      'Interactive demonstration of image conversion through WebP, AVIF, JPG, and ICO formats in client memory.',
  },
  {
    id: 'enhance',
    name: 'Image Quality Enhancer',
    shortName: 'Enhance',
    buttonNoun: 'Open enhancer',
    path: '/image-enhancer',
    hue: '#E6B866',
    hueRgb: '230, 184, 102',
    shortcut: '2',
    icon: (h, isH) => (
      <QualityEnhancerIcon size={16} hue={h} isHovered={isH} className="w-4 h-4 shrink-0" />
    ),
    renderDemo: (vis, hov) => <DemoQualityEnhancer isVisible={vis} isHovered={hov} />,
    ariaDescription:
      'Interactive demonstration of bilateral sharpening and unsharp masking with draggable comparison handle.',
  },
  {
    id: 'remove-bg',
    name: 'Accurate AI Background Remover',
    shortName: 'Remove background',
    buttonNoun: 'Open background remover',
    path: '/background-remover',
    hue: '#A08BF5',
    hueRgb: '160, 139, 245',
    shortcut: '3',
    icon: (h, isH) => (
      <BackgroundRemoverIcon size={16} hue={h} isHovered={isH} className="w-4 h-4 shrink-0" />
    ),
    renderDemo: (vis, hov) => <DemoBackgroundRemover isVisible={vis} isHovered={hov} />,
    ariaDescription:
      'Interactive demonstration of neural foreground extraction with toggleable alpha transparency checkerboard.',
  },
  {
    id: 'units',
    name: 'Universal Units & Quantities',
    shortName: 'Units',
    buttonNoun: 'Open units converter',
    path: '/units-converter',
    hue: '#6FA9F5',
    hueRgb: '111, 169, 245',
    shortcut: '4',
    icon: (h, isH) => (
      <UnitsQuantitiesIcon size={16} hue={h} isHovered={isH} className="w-4 h-4 shrink-0" />
    ),
    renderDemo: (vis, hov) => <DemoUnitsConverter isVisible={vis} isHovered={hov} />,
    ariaDescription:
      'Live interactive length converter with instant swap and copy using shared calculation engine.',
  },
  {
    id: 'bmi',
    name: 'Body Mass Index Calculator',
    shortName: 'BMI',
    buttonNoun: 'Open BMI calculator',
    path: '/bmi-calculator',
    hue: '#6FD49A',
    hueRgb: '111, 212, 154',
    shortcut: '5',
    icon: (h, isH) => (
      <BmiCalculatorIcon size={16} hue={h} isHovered={isH} className="w-4 h-4 shrink-0" />
    ),
    renderDemo: (vis, hov) => <DemoBmiCalculator isVisible={vis} isHovered={hov} />,
    ariaDescription:
      'Live interactive WHO BMI calculator with calibrated semicircle gauge and category calculation.',
  },
];

export const Hero: React.FC<HeroProps> = ({ onScrollToTools }) => {
  const heroSectionRef = useRef<HTMLElement>(null);
  const bgLightRef = useRef<HTMLDivElement>(null);
  const dotGridRef = useRef<HTMLDivElement>(null);
  const cursorGridRef = useRef<HTMLDivElement>(null);

  const headlineLine1Ref = useRef<HTMLSpanElement>(null);
  const headlineLine2Ref = useRef<HTMLSpanElement>(null);
  const subtextRef = useRef<HTMLParagraphElement>(null);
  const buttonsRef = useRef<HTMLDivElement>(null);
  const primaryBtnRef = useRef<HTMLButtonElement>(null);
  const productWindowRef = useRef<HTMLDivElement>(null);
  const stageContainerRef = useRef<HTMLDivElement>(null);

  // Tab State: default to index 0 ("All Tools") to demonstrate all tools
  const [activeTabIdx, setActiveTabIdx] = useState<number>(0);
  const [userInteracted, setUserInteracted] = useState<boolean>(false);
  const [isWindowHovered, setIsWindowHovered] = useState<boolean>(false);
  const [isHeroVisible, setIsHeroVisible] = useState<boolean>(true);
  const [progressKey, setProgressKey] = useState<number>(0);
  const [stageTransitioning, setStageTransitioning] = useState<boolean>(false);

  // Shimmer active flag for line 2 gradient backgroundPosition animation
  const [isShimmering, setIsShimmering] = useState<boolean>(false);

  // Light mouse follow offset (max 36px)
  const [lightOffset, setLightOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Magnetic button offset (max 6px within 80px)
  const [btnOffset, setBtnOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Window cursor tilt (max 2 degrees)
  const [windowTilt, setWindowTilt] = useState<{ rx: number; ry: number }>({ rx: 0, ry: 0 });

  // Cursor coordinates for reactive teal dot grid (CSS variables --mx, --my with lerp)
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lerpPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lerpAnimRef = useRef<number | null>(null);

  // Auto-advance tabs (permanently stops after any user interaction)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || userInteracted || isWindowHovered || !isHeroVisible) {
      return;
    }

    const interval = setInterval(() => {
      handleTabSwitch((activeTabIdx + 1) % PRODUCT_TABS.length, false);
    }, 7000);

    return () => clearInterval(interval);
  }, [userInteracted, isWindowHovered, isHeroVisible, activeTabIdx]);

  // Tab switch with physical transition (scale 0.98 to 1, blur 6px to 0, opacity 450ms)
  const handleTabSwitch = (idx: number, fromUser = true) => {
    if (fromUser) {
      setUserInteracted(true);
    }
    setStageTransitioning(true);
    setTimeout(() => {
      setActiveTabIdx(idx);
      setProgressKey((k) => k + 1);
      setTimeout(() => setStageTransitioning(false), 50);
    }, 150);
  };

  // Track hero intersection
  useEffect(() => {
    if (!heroSectionRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsHeroVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(heroSectionRef.current);
    return () => observer.disconnect();
  }, []);

  // Cursor reactive dot grid loop (lerp)
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || typeof window === 'undefined') return;

    const lerpLoop = () => {
      const target = mousePosRef.current;
      const current = lerpPosRef.current;
      current.x += (target.x - current.x) * 0.12;
      current.y += (target.y - current.y) * 0.12;

      if (cursorGridRef.current) {
        cursorGridRef.current.style.setProperty('--mx', `${current.x.toFixed(1)}px`);
        cursorGridRef.current.style.setProperty('--my', `${current.y.toFixed(1)}px`);
      }

      lerpAnimRef.current = requestAnimationFrame(lerpLoop);
    };

    lerpAnimRef.current = requestAnimationFrame(lerpLoop);

    return () => {
      if (lerpAnimRef.current) cancelAnimationFrame(lerpAnimRef.current);
    };
  }, []);

  // Mouse move handler for background light parallax, cursor dot grid, magnetic button, and window tilt
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || window.innerWidth < 768) return;

    mousePosRef.current = { x: e.clientX, y: e.clientY };

    // Center offsets
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;
    const deltaX = (e.clientX - centerX) / centerX;
    const deltaY = (e.clientY - centerY) / centerY;

    // Background light follow (max 36px)
    setLightOffset({ x: deltaX * 36, y: deltaY * 20 });

    // Window tilt (max 2 degrees)
    setWindowTilt({
      rx: -deltaY * 2.0,
      ry: deltaX * 2.0,
    });

    // Magnetic button follow (within 80px radius, max 6px)
    if (primaryBtnRef.current) {
      const rect = primaryBtnRef.current.getBoundingClientRect();
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - btnCenterX, e.clientY - btnCenterY);

      if (dist < 80) {
        const pull = (1 - dist / 80) * 6;
        const angle = Math.atan2(e.clientY - btnCenterY, e.clientX - btnCenterX);
        setBtnOffset({
          x: Math.cos(angle) * pull,
          y: Math.sin(angle) * pull,
        });
      } else {
        setBtnOffset({ x: 0, y: 0 });
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [handleMouseMove]);

  // Main Load Sequence and Scroll Choreography
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.innerWidth >= 768;

    if (prefersReducedMotion || !heroSectionRef.current) return;

    const ctx = gsap.context(() => {
      const headlineWords = heroSectionRef.current?.querySelectorAll('.headline-word');

      // 1. Initial Load Sequence
      const loadTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      // Animate background light & dot grid
      if (bgLightRef.current) {
        loadTl.fromTo(
          bgLightRef.current,
          { opacity: 0 },
          { opacity: 1, duration: 1.1, ease: 'power2.out' },
          0
        );
      }

      if (dotGridRef.current) {
        loadTl.fromTo(
          dotGridRef.current,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' },
          0.1
        );
      }

      // Headline reveals word by word
      if (headlineWords && headlineWords.length > 0) {
        loadTl.fromTo(
          headlineWords,
          { y: 24, opacity: 0, filter: 'blur(8px)' },
          {
            y: 0,
            opacity: 1,
            filter: 'blur(0px)',
            duration: 0.85,
            stagger: 0.05,
            ease: 'cubic-bezier(0.22, 1, 0.36, 1)',
            onComplete: () => {
              headlineWords.forEach((w) => {
                (w as HTMLElement).style.filter = 'none';
              });

              // Trigger headline shimmer 1.0s after intro completes, runs once for 1.6s, then rests
              setTimeout(() => {
                setIsShimmering(true);
                setTimeout(() => setIsShimmering(false), 1650);
              }, 1000);
            },
          },
          0.2
        );
      }

      // Subtext, buttons
      if (subtextRef.current) {
        loadTl.fromTo(
          subtextRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.65 },
          '-=0.45'
        );
      }

      if (buttonsRef.current) {
        loadTl.fromTo(
          buttonsRef.current,
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: 0.65 },
          '-=0.45'
        );
      }

      // Product window rises into view with subtle 3D tilt
      if (productWindowRef.current) {
        loadTl.fromTo(
          productWindowRef.current,
          {
            opacity: 0,
            y: 60,
          },
          {
            opacity: 1,
            y: 0,
            duration: 0.9,
            ease: 'power3.out',
          },
          '-=0.4'
        );

        // Scroll Choreography when scrolling into the product window
        if (isDesktop) {
          const scrollTl = gsap.timeline({
            scrollTrigger: {
              trigger: productWindowRef.current,
              start: 'top 92%',
              end: 'top 40%',
              scrub: 0.7,
            },
          });

          scrollTl.fromTo(
            productWindowRef.current,
            { rotateX: 6, scale: 0.97 },
            { rotateX: 0, scale: 1, ease: 'none' },
            0
          );

          if (headlineLine1Ref.current && headlineLine2Ref.current) {
            scrollTl.to(
              headlineLine1Ref.current,
              { y: -30, opacity: 0.45, filter: 'blur(4px)', ease: 'none' },
              0
            );
            scrollTl.to(
              headlineLine2Ref.current,
              { y: -40, opacity: 0.5, filter: 'blur(5px)', ease: 'none' },
              0.05
            );
          }

          if (bgLightRef.current) {
            scrollTl.to(
              bgLightRef.current,
              { opacity: 1.3, ease: 'none' },
              0
            );
          }
        }
      }
    }, heroSectionRef);

    return () => ctx.revert();
  }, []);

  // Keyboard navigation for product window tabs
  const handleKeyDown = (e: React.KeyboardEvent, idx: number) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleTabSwitch((idx + 1) % PRODUCT_TABS.length);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handleTabSwitch((idx - 1 + PRODUCT_TABS.length) % PRODUCT_TABS.length);
    } else if (['0', '1', '2', '3', '4', '5'].includes(e.key)) {
      e.preventDefault();
      handleTabSwitch(parseInt(e.key));
    } else if (e.key.toLowerCase() === 'a') {
      e.preventDefault();
      handleTabSwitch(0);
    }
  };

  const scrollToToolsWindow = () => {
    const el = document.getElementById('hero-tools-window');
    if (el) {
      const lenis = getLenis();
      if (lenis) {
        lenis.scrollTo(el, { offset: -90, duration: 1.2 });
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      onScrollToTools();
    }
  };

  const activeTab = PRODUCT_TABS[activeTabIdx];

  return (
    <section
      ref={heroSectionRef}
      id="hero"
      aria-label="Handy AI Hero"
      className="relative w-full min-h-screen bg-[#05090D] overflow-hidden text-[#F4F7F9]"
    >
      {/* ATMOSPHERIC BACKGROUND SYSTEM */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        {/* Fine static dot grid (3.5% opacity, spacing 32px, radial mask faded by 55%) */}
        <div
          ref={dotGridRef}
          className="absolute inset-0 hero-dot-grid"
          style={{
            maskImage: 'radial-gradient(circle at 50% 32%, black 0%, black 28%, transparent 55%)',
            WebkitMaskImage:
              'radial-gradient(circle at 50% 32%, black 0%, black 28%, transparent 55%)',
          }}
        />

        {/* Cursor-reactive teal dot grid (22% opacity within 200px radius of cursor, lerped) */}
        <div
          ref={cursorGridRef}
          className="absolute inset-0 hero-cursor-dot-grid hidden md:block"
        />

        {/* Main large soft radial teal light (#5EC4BA at 16%) centered behind headline */}
        <div
          ref={bgLightRef}
          className="absolute -top-32 left-1/2 -translate-x-1/2 w-[1100px] h-[780px] transition-transform duration-300 ease-out"
          style={{
            transform: `translate(calc(-50% + ${lightOffset.x}px), ${lightOffset.y}px)`,
            background:
              'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(94, 196, 186, 0.16) 0%, transparent 72%)',
          }}
        />

        {/* Secondary faint violet bloom (#A08BF5 at 8%) low on the left */}
        <div
          className="absolute bottom-10 left-0 w-[520px] h-[520px] opacity-80"
          style={{
            background:
              'radial-gradient(circle at 12% 75%, rgba(160, 139, 245, 0.08) 0%, transparent 58%)',
          }}
        />

        {/* Soft vignette so corners are slightly darker than center */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 110% 100% at 50% 45%, transparent 65%, rgba(2, 4, 7, 0.65) 100%)',
          }}
        />

        {/* Subtle film grain overlay */}
        <div className="absolute inset-0 hero-grain" />

        {/* Smooth bottom fade into page background */}
        <div
          className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-b from-transparent to-[#05090D]"
          aria-hidden="true"
        />
      </div>

      {/* 1. HERO CENTER TEXT CONTAINER: Vertically and horizontally centered */}
      <div className="relative z-10 w-full max-w-[1200px] mx-auto px-6 min-h-[74vh] md:min-h-[82vh] flex flex-col items-center justify-center text-center pt-28 sm:pt-36 pb-12 sm:pb-16">
        
        {/* HEADLINE: Center text prominent, balanced, no rectangular box on shimmer */}
        <h1
          className="text-center font-medium text-[clamp(44px,6.2vw,86px)] leading-[0.98] tracking-[-0.035em] [word-spacing:-0.04em] select-none [text-wrap:balance]"
          style={{ fontFamily: '"Geist", sans-serif' }}
        >
          {/* Line 1: #F4F7F9 */}
          <span ref={headlineLine1Ref} className="block overflow-hidden py-0.5 text-[#F4F7F9]">
            <span className="headline-word inline-block mr-[0.22em] will-change-transform">All</span>
            <span className="headline-word inline-block mr-[0.22em] will-change-transform">your</span>
            <span className="headline-word inline-block will-change-transform">tools.</span>
          </span>

          {/* Line 2: In one place. with pure background-clip: text shimmer */}
          <span ref={headlineLine2Ref} className="relative block overflow-hidden py-0.5">
            <span
              className={`headline-word inline-block will-change-transform transition-all ${
                isShimmering ? 'hero-shimmer-active' : ''
              }`}
              style={{
                backgroundImage: isShimmering
                  ? 'linear-gradient(115deg, #F4F7F9 0%, #85D4CC 28%, #FFFFFF 50%, #85D4CC 72%, #5EC4BA 100%)'
                  : 'linear-gradient(115deg, #F4F7F9 0%, #85D4CC 55%, #5EC4BA 100%)',
                backgroundSize: isShimmering ? '260% 100%' : '100% 100%',
                backgroundPosition: isShimmering ? '0% 0' : '100% 0',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                color: 'transparent',
                animation: isShimmering ? 'headlineShimmerSweep 1.6s ease-in-out forwards' : 'none',
              }}
            >
              In one place.
            </span>
          </span>
        </h1>

        {/* SUBTEXT: 19px (17px mobile), line-height 1.55, max-w-[580px] */}
        <p
          ref={subtextRef}
          className="mt-6 sm:mt-7 text-center text-[17px] sm:text-[20px] leading-[1.55] text-[rgba(234,242,244,0.74)] max-w-[580px] mx-auto select-none [text-wrap:balance]"
        >
          Convert images, sharpen photos, remove backgrounds, switch units and check your BMI.
          All in your browser.
        </p>

        {/* BUTTONS: 48px high, 12px gap */}
        <div
          ref={buttonsRef}
          className="mt-8 sm:mt-9 flex flex-wrap items-center justify-center gap-3.5"
        >
          {/* Primary "Try a tool": 48px high with magnetic follow */}
          <button
            ref={primaryBtnRef}
            onClick={scrollToToolsWindow}
            className="group h-12 px-7 rounded-[12px] text-[15px] font-medium bg-[#F3F5F8] text-[#05090D] hover:bg-white active:scale-[0.98] transition-all duration-200 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_8px_20px_rgba(0,0,0,0.25)] flex items-center gap-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5EC4BA] cursor-pointer"
            style={{
              transform: `translate(${btnOffset.x}px, ${btnOffset.y}px)`,
              transition: btnOffset.x === 0 ? 'transform 0.4s ease-out, background 0.2s' : 'none',
            }}
          >
            <span>Try a tool</span>
            <span className="transition-transform duration-200 group-hover:translate-x-1 text-base leading-none">
              →
            </span>
          </button>

          {/* Secondary "See how it works": 48px high */}
          <button
            onClick={() => scrollToSection('#privacy', -100)}
            className="h-12 px-7 rounded-[12px] text-[15px] font-medium text-white border border-white/[0.14] bg-transparent hover:bg-white/[0.06] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5EC4BA] cursor-pointer"
          >
            See how it works
          </button>
        </div>

        {/* Gentle scroll indicator cue leading to the tools window below */}
        <button
          onClick={scrollToToolsWindow}
          aria-label="Scroll down to tools showcase"
          className="mt-10 sm:mt-12 group inline-flex items-center gap-2 text-xs text-[#8FA3AB] hover:text-[#5EC4BA] transition-colors duration-200 cursor-pointer focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5EC4BA] py-1 px-3 rounded-full hover:bg-white/[0.03]"
        >
          <span>Live browser tools showcase below</span>
          <span className="transition-transform duration-200 group-hover:translate-y-0.5 text-sm">
            ↓
          </span>
        </button>
      </div>

      {/* 2. TOOLS SCREEN / PRODUCT WINDOW: Positioned below with generous spacing, demonstrating all tools */}
      <div
        id="hero-tools-window"
        className="relative z-10 w-full max-w-[1140px] mx-auto px-4 sm:px-6 mt-8 sm:mt-16 md:mt-24 pb-24 sm:pb-36 flex flex-col items-center"
      >
        <div className="w-full [perspective:1200px] flex justify-center">
          <div
            ref={productWindowRef}
            tabIndex={0}
            onMouseEnter={() => setIsWindowHovered(true)}
            onMouseLeave={() => setIsWindowHovered(false)}
            onFocus={() => setIsWindowHovered(true)}
            onBlur={() => setIsWindowHovered(false)}
            onKeyDown={(e) => {
              if (['0', '1', '2', '3', '4', '5'].includes(e.key)) {
                e.preventDefault();
                handleTabSwitch(parseInt(e.key));
              } else if (e.key.toLowerCase() === 'a') {
                e.preventDefault();
                handleTabSwitch(0);
              }
            }}
            className="relative w-full rounded-[20px] bg-[#0A1218] border border-white/[0.09] shadow-[0_4px_16px_rgba(0,0,0,0.4),0_32px_84px_-12px_rgba(0,0,0,0.75)] overflow-hidden transition-all duration-300 origin-top will-change-transform focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5EC4BA]/50"
            style={{
              transform: `rotateX(${windowTilt.rx}deg) rotateY(${windowTilt.ry}deg)`,
              transition: isWindowHovered ? 'none' : 'transform 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {/* Top-edge hairline highlight that fades toward sides */}
            <div
              className="absolute top-0 left-0 right-0 h-[1px] pointer-events-none z-30"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.28) 50%, transparent 100%)',
              }}
            />

            {/* Tool-colored light spill crossfading over 600ms along top edge of window */}
            <div
              className="absolute -top-12 left-1/2 -translate-x-1/2 w-[80%] h-24 pointer-events-none z-10 transition-all duration-600 ease-out"
              style={{
                background: `radial-gradient(ellipse 70% 80px at 50% 100%, rgba(${activeTab.hueRgb}, 0.14) 0%, transparent 75%)`,
              }}
            />

            {/* Top Bar: Lighter title bar bg-[#0D151B] + Segmented Tool Switcher + Tool Action */}
            <div className="relative z-20 px-3 sm:px-5 py-3 border-b border-white/[0.08] bg-[#0D151B] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              {/* Segmented Switcher / Tablist: Includes 'All Tools' + 5 individual tools */}
              <div
                role="tablist"
                aria-label="Handy Tools Showcase Switcher"
                className="flex items-center gap-1 p-1 rounded-full bg-[#05090D] border border-white/[0.06] overflow-x-auto no-scrollbar"
              >
                {PRODUCT_TABS.map((tab, idx) => {
                  const isActive = activeTabIdx === idx;
                  return (
                    <button
                      key={tab.id}
                      role="tab"
                      id={`hero-tab-${tab.id}`}
                      aria-selected={isActive}
                      aria-controls={`hero-panel-${tab.id}`}
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => handleTabSwitch(idx)}
                      onKeyDown={(e) => handleKeyDown(e, idx)}
                      className={`relative px-3 sm:px-3.5 py-1.5 rounded-full text-[12px] sm:text-[13px] font-medium transition-all duration-300 flex items-center gap-2 whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-1 cursor-pointer ${
                        isActive
                          ? 'text-white shadow-sm'
                          : 'text-[#8FA3AB] hover:text-[#EAF2F4]'
                      }`}
                      style={
                        isActive
                          ? {
                              backgroundColor: `rgba(${tab.hueRgb}, 0.16)`,
                              border: `1px solid rgba(${tab.hueRgb}, 0.35)`,
                              color: '#FFFFFF',
                            }
                          : {
                              border: '1px solid transparent',
                            }
                      }
                    >
                      {tab.icon(isActive ? tab.hue : '#8FA3AB', isActive)}
                      <span>{tab.shortName}</span>

                      {/* Keyboard Shortcut Badge */}
                      <span className="hidden xl:inline-block text-[10px] font-mono px-1 rounded bg-white/[0.06] text-[#8FA3AB]">
                        {tab.shortcut}
                      </span>

                      {/* Auto-advance progress line on active tab */}
                      {isActive && !userInteracted && !isWindowHovered && (
                        <span
                          key={progressKey}
                          className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full overflow-hidden bg-white/10"
                        >
                          <span
                            className="block h-full transition-all ease-linear"
                            style={{
                              backgroundColor: tab.hue,
                              animation: 'heroTabProgress 7s linear forwards',
                            }}
                          />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Action Button: Opens the active tool or scrolls to lower tools section */}
              <button
                onClick={() => {
                  if (activeTab.path.startsWith('#')) {
                    onScrollToTools();
                  } else {
                    window.history.pushState({}, '', activeTab.path);
                    window.dispatchEvent(new PopStateEvent('popstate'));
                    const lenis = getLenis();
                    if (lenis) lenis.scrollTo(0, { duration: 1.2 });
                    else window.scrollTo({ top: 0, behavior: 'instant' });
                  }
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium bg-white/[0.06] hover:bg-white/[0.12] text-[#EAF2F4] border border-white/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5EC4BA] shrink-0 self-end sm:self-auto cursor-pointer"
              >
                <span>{activeTab.buttonNoun}</span>
                <span className="text-sm">→</span>
              </button>
            </div>

            {/* Main Stage Area: Demonstrates All Tools or individual deep dive */}
            <div
              id={`hero-panel-${activeTab.id}`}
              role="tabpanel"
              aria-labelledby={`hero-tab-${activeTab.id}`}
              className={`relative w-full min-h-[440px] sm:min-h-[500px] overflow-hidden transition-colors duration-600 ${
                activeTab.id === 'all' ? 'p-4 sm:p-7' : 'p-6 sm:p-10 flex items-center justify-center'
              }`}
              style={{
                background: `radial-gradient(ellipse 70% 60% at 50% 20%, rgba(${activeTab.hueRgb}, 0.12) 0%, transparent 70%), #0A1218`,
              }}
            >
              {/* Screen reader disclosure */}
              <div className="sr-only">
                {activeTab.name}: {activeTab.ariaDescription}
              </div>

              {/* Faint grain on stage surface */}
              <div className="absolute inset-0 hero-grain opacity-[0.03] pointer-events-none" />

              {/* Physical Tab Transition container */}
              <div
                ref={stageContainerRef}
                className={`w-full h-full transition-all duration-450 ease-out ${
                  stageTransitioning
                    ? 'opacity-0 scale-[0.98] blur-[6px]'
                    : 'opacity-100 scale-100 blur-0'
                }`}
              >
                {activeTab.renderDemo(
                  isHeroVisible,
                  isWindowHovered,
                  (idx) => handleTabSwitch(idx)
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Embedded CSS keyframes */}
      <style>{`
        @keyframes headlineShimmerSweep {
          0% {
            background-position: 100% 0;
          }
          100% {
            background-position: 0% 0;
          }
        }
        @keyframes heroTabProgress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </section>
  );
};
