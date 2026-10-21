import React, { useState, useEffect } from 'react';
import { scrollToSection, getLenis } from '../utils/scroll';

interface NavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isHeroOverlay?: boolean;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentPath,
  onNavigate,
  isHeroOverlay = false,
}) => {
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isPastHero, setIsPastHero] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [hasLoaded, setHasLoaded] = useState<boolean>(false);

  // Initial fade-in of header last
  useEffect(() => {
    const timer = setTimeout(() => setHasLoaded(true), 700);
    return () => clearTimeout(timer);
  }, []);

  // Header scroll detection (hide on scroll down, show on scroll up) and active section tracking
  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const heroHeight = window.innerHeight * 0.75;

      setIsPastHero(currentScrollY > heroHeight);

      // Hide when scrolling down, show when scrolling up
      if (currentScrollY > 120) {
        if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 6) {
          setIsVisible(false);
        } else if (lastScrollY - currentScrollY > 6) {
          setIsVisible(true);
        }
      } else {
        setIsVisible(true);
      }

      lastScrollY = currentScrollY;

      // Active section check
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
    
    // Also listen directly to Lenis scroll if present
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

  const handleLinkClick = (hashId: string) => {
    setMobileOpen(false);
    if (currentPath === '/' || currentPath === '') {
      scrollToSection(`#${hashId}`, -40);
    } else {
      onNavigate(`/#${hashId}`);
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      } ${
        !isHeroOverlay || isPastHero
          ? 'bg-[#05090D]/85 backdrop-blur-md'
          : 'bg-transparent'
      } ${hasLoaded ? 'opacity-100' : 'opacity-0'}`}
      style={{ height: '76px' }}
    >
      <div className="max-w-[1200px] h-full mx-auto px-6 flex items-center justify-between relative">
        {/* Left: Brand Lockup */}
        <button
          onClick={() => {
            if (currentPath === '/' || currentPath === '') {
              scrollToSection('body', 0);
            } else {
              onNavigate('/');
            }
          }}
          className="flex items-center gap-2.5 text-left group focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5EC4BA] rounded-[10px]"
          aria-label="Handy Home"
        >
          <img
            src="/assets/handy-logo-mark-56.png"
            alt="Handy logo mark"
            className="w-7 h-7 object-contain shrink-0"
            style={{ height: '28px' }}
          />
          <span className="text-[#EAF2F4] text-[19px] font-medium tracking-tight">
            Handy
          </span>
        </button>

        {/* Center: Three links centered on the viewport */}
        <nav
          className="hidden md:flex items-center gap-8 absolute left-1/2 -translate-x-1/2"
          aria-label="Main Navigation"
        >
          <button
            onClick={() => handleLinkClick('tools')}
            className={`text-base font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5EC4BA] rounded-[10px] px-1 py-0.5 ${
              activeSection === 'tools'
                ? 'text-[#5EC4BA]'
                : 'text-[#EAF2F4]/80 hover:text-white'
            }`}
          >
            Tools
          </button>
          <button
            onClick={() => handleLinkClick('privacy')}
            className={`text-base font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5EC4BA] rounded-[10px] px-1 py-0.5 ${
              activeSection === 'privacy'
                ? 'text-[#5EC4BA]'
                : 'text-[#EAF2F4]/80 hover:text-white'
            }`}
          >
            Privacy
          </button>
          <button
            onClick={() => handleLinkClick('faq')}
            className={`text-base font-medium transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5EC4BA] rounded-[10px] px-1 py-0.5 ${
              activeSection === 'faq'
                ? 'text-[#5EC4BA]'
                : 'text-[#EAF2F4]/80 hover:text-white'
            }`}
          >
            FAQ
          </button>
        </nav>

        {/* Right: Outlined button 'All tools' + Mobile menu toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleLinkClick('tools')}
            className="hidden sm:flex items-center h-[42px] px-[22px] rounded-[10px] text-base font-medium text-[#EAF2F4] border border-[rgba(255,255,255,0.4)] bg-transparent hover:bg-white/10 active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5EC4BA]"
          >
            All tools
          </button>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="sm:hidden w-[42px] h-[42px] rounded-[10px] border border-[rgba(255,255,255,0.2)] bg-transparent hover:bg-white/10 text-white flex items-center justify-center focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5EC4BA]"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileOpen}
          >
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="sm:hidden w-full bg-[#05090D]/95 backdrop-blur-md px-6 py-4 flex flex-col gap-3 border-b border-[rgba(255,255,255,0.08)]">
          <button
            onClick={() => handleLinkClick('tools')}
            className={`text-left text-base font-medium py-1.5 ${
              activeSection === 'tools' ? 'text-[#5EC4BA]' : 'text-[#EAF2F4]'
            }`}
          >
            Tools
          </button>
          <button
            onClick={() => handleLinkClick('privacy')}
            className={`text-left text-base font-medium py-1.5 ${
              activeSection === 'privacy' ? 'text-[#5EC4BA]' : 'text-[#EAF2F4]'
            }`}
          >
            Privacy
          </button>
          <button
            onClick={() => handleLinkClick('faq')}
            className={`text-left text-base font-medium py-1.5 ${
              activeSection === 'faq' ? 'text-[#5EC4BA]' : 'text-[#EAF2F4]'
            }`}
          >
            FAQ
          </button>
        </div>
      )}
    </header>
  );
};
