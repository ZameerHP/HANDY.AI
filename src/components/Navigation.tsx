import React, { useState, useEffect, useRef } from 'react';
import { scrollToSection, getLenis } from '../utils/scroll';
import { CommandPalette } from './CommandPalette';

interface NavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isHeroOverlay?: boolean;
}

interface NavItem {
  id: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'tools', label: 'Tools' },
  { id: 'privacy', label: 'Privacy' },
  { id: 'faq', label: 'FAQ' },
];

export const Navigation: React.FC<NavigationProps> = ({
  currentPath,
  onNavigate,
}) => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [hoveredSection, setHoveredSection] = useState<string | null>(null);
  const [isPaletteOpen, setIsPaletteOpen] = useState<boolean>(false);
  const [isMac, setIsMac] = useState<boolean>(true);

  const navContainerRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [indicatorStyle, setIndicatorStyle] = useState<{ left: number; width: number; opacity: number }>({
    left: 0,
    width: 0,
    opacity: 0,
  });

  // Check platform for ⌘K vs Ctrl K
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.userAgent) {
      setIsMac(/(Mac|iPhone|iPod|iPad)/i.test(navigator.userAgent));
    }
  }, []);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Track scroll position to slightly shrink pill (94% width after 80px scroll) and track active section
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 80);

      // Active section check on home page
      if (currentPath === '/' || currentPath === '') {
        const sections = ['faq', 'privacy', 'tools'];
        let found = '';
        for (const id of sections) {
          const el = document.getElementById(id);
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= window.innerHeight * 0.45) {
              found = id;
              break;
            }
          }
        }
        setActiveSection(found);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    const checkLenis = setInterval(() => {
      const lenis = getLenis();
      if (lenis) {
        lenis.on('scroll', handleScroll);
        clearInterval(checkLenis);
      }
    }, 100);

    return () => {
      clearInterval(checkLenis);
      window.removeEventListener('scroll', handleScroll);
      const lenis = getLenis();
      if (lenis) {
        lenis.off('scroll', handleScroll);
      }
    };
  }, [currentPath]);

  // Update sliding highlight pill position behind hovered or active link with spring
  useEffect(() => {
    const targetId = hoveredSection || activeSection;
    if (!targetId) {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
      return;
    }

    const targetEl = itemRefs.current.get(targetId);
    const container = navContainerRef.current;
    if (targetEl && container) {
      const containerRect = container.getBoundingClientRect();
      const elRect = targetEl.getBoundingClientRect();
      setIndicatorStyle({
        left: elRect.left - containerRect.left,
        width: elRect.width,
        opacity: 1,
      });
    } else {
      setIndicatorStyle((prev) => ({ ...prev, opacity: 0 }));
    }
  }, [hoveredSection, activeSection]);

  const handleLinkClick = (hashId: string) => {
    setMobileOpen(false);
    if (currentPath === '/' || currentPath === '') {
      scrollToSection(`#${hashId}`, -100);
    } else {
      onNavigate(`/#${hashId}`);
    }
  };

  const handleBrandClick = () => {
    setMobileOpen(false);
    if (currentPath === '/' || currentPath === '') {
      const lenis = getLenis();
      if (lenis) lenis.scrollTo(0, { duration: 1.4 });
      else window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      onNavigate('/');
    }
  };

  return (
    <>
      <div className="fixed top-5 left-0 right-0 z-50 flex justify-center px-4 pointer-events-none">
        {/* Floating Centered Navigation Pill: exact 56px height, 20px top offset */}
        <nav
          aria-label="Main Navigation"
          className={`pointer-events-auto relative w-full h-[56px] rounded-full px-3 sm:px-4 flex items-center justify-between transition-all duration-300 ease-out ${
            isScrolled
              ? 'max-w-[714px] shadow-[0_12px_36px_rgba(0,0,0,0.5)]'
              : 'max-w-[760px] shadow-[0_8px_24px_rgba(0,0,0,0.3)]'
          }`}
          style={{
            backgroundColor: isScrolled ? 'rgba(10, 18, 24, 0.85)' : 'rgba(10, 18, 24, 0.6)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Left: Logo (26px) + Wordmark */}
          <button
            onClick={handleBrandClick}
            className="flex items-center gap-2.5 pl-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5EC4BA] rounded-full group cursor-pointer"
            aria-label="Handy Home"
          >
            <img
              src="/assets/handy-logo-mark-56.png"
              alt="Handy logo"
              className="w-[26px] h-[26px] object-contain shrink-0 transition-transform duration-200 group-hover:scale-105"
            />
            <span className="text-[#F4F7F9] text-[17px] font-medium tracking-tight">
              Handy
            </span>
          </button>

          {/* Center: Sliding Highlight Pill Links (Desktop) */}
          <div
            ref={navContainerRef}
            onMouseLeave={() => setHoveredSection(null)}
            className="hidden md:flex items-center relative gap-1 p-1"
          >
            {/* Spring Sliding Highlight Pill */}
            <div
              className="absolute top-1 bottom-1 rounded-full bg-white/[0.08] pointer-events-none"
              style={{
                left: `${indicatorStyle.left}px`,
                width: `${indicatorStyle.width}px`,
                opacity: indicatorStyle.opacity,
                transition: 'all 320ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              }}
            />

            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    if (el) itemRefs.current.set(item.id, el);
                  }}
                  onClick={() => handleLinkClick(item.id)}
                  onMouseEnter={() => setHoveredSection(item.id)}
                  className={`relative z-10 px-4 py-1.5 text-[14px] font-medium transition-colors duration-200 rounded-full focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5EC4BA] cursor-pointer ${
                    isActive
                      ? 'text-white'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* Right: Search / Command Palette (⌘K) + "All tools" button (40px high) + Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* Search / Command Palette Button */}
            <button
              onClick={() => setIsPaletteOpen(true)}
              className="hidden lg:inline-flex items-center gap-1.5 h-10 px-3 rounded-full text-[13px] text-[#8FA3AB] hover:text-white bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5EC4BA] cursor-pointer"
              title="Open Command Palette (Ctrl+K or ⌘K)"
              aria-label="Search tools"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] border border-white/5 text-[#EAF2F4]/80">
                {isMac ? '⌘K' : 'Ctrl K'}
              </span>
            </button>

            {/* "All tools" Button: exact 40px height */}
            <button
              onClick={() => handleLinkClick('tools')}
              className="hidden sm:inline-flex items-center justify-center h-10 px-5 rounded-full text-[14px] font-medium bg-[#F3F5F8] text-[#05090D] hover:bg-white active:scale-[0.98] transition-all duration-200 shadow-sm cursor-pointer"
            >
              All tools
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="sm:hidden w-9 h-9 rounded-full bg-white/[0.04] border border-white/10 text-white/80 hover:text-white flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5EC4BA] cursor-pointer"
              aria-label="Toggle navigation menu"
              aria-expanded={mobileOpen}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.75"
              >
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                )}
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileOpen && (
        <div className="fixed inset-x-4 top-[84px] z-40 sm:hidden rounded-[20px] bg-[#0A1218]/95 backdrop-blur-xl border border-white/10 p-5 shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                setMobileOpen(false);
                setIsPaletteOpen(true);
              }}
              className="w-full h-11 px-4 rounded-[12px] bg-white/[0.06] text-[14px] font-medium text-left flex items-center justify-between text-[#8FA3AB] hover:text-white"
            >
              <span>Search tools...</span>
              <span className="text-xs font-mono">⌘K</span>
            </button>

            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleLinkClick(item.id)}
                className="w-full text-left py-2.5 px-3 rounded-[10px] text-[15px] font-medium text-[#EAF2F4] hover:bg-white/[0.06] transition-colors"
              >
                {item.label}
              </button>
            ))}

            <div className="pt-2 border-t border-white/10">
              <button
                onClick={() => handleLinkClick('tools')}
                className="w-full h-11 rounded-[12px] bg-[#F3F5F8] text-[#05090D] font-medium text-[14px] flex items-center justify-center shadow-sm"
              >
                All tools
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={isPaletteOpen}
        onClose={() => setIsPaletteOpen(false)}
        onSelectTool={onNavigate}
      />
    </>
  );
};
