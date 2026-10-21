import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Hero } from './components/Hero';
import { ToolsIndex } from './components/ToolsIndex';
import { PrivacySection } from './components/PrivacySection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';

import { ImageConverter } from './components/tools/ImageConverter';
import { ImageEnhancer } from './components/tools/ImageEnhancer';
import { BackgroundRemover } from './components/tools/BackgroundRemover';
import { UnitsConverter } from './components/tools/UnitsConverter';
import { BmiCalculator } from './components/tools/BmiCalculator';

import { initSmoothScroll, scrollToSection, getLenis } from './utils/scroll';

export default function App() {
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Initialize single Lenis instance for smooth scrolling across the entire site
  useEffect(() => {
    const { cleanup } = initSmoothScroll();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    if (path.startsWith('/#')) {
      const hash = path.substring(2);
      if (currentPath !== '/') {
        window.history.pushState({}, '', '/');
        setCurrentPath('/');
        setTimeout(() => {
          scrollToSection(`#${hash}`, -30);
        }, 120);
      } else {
        scrollToSection(`#${hash}`, -30);
      }
      return;
    }

    window.history.pushState({}, '', path);
    setCurrentPath(path);
    const lenis = getLenis();
    if (lenis) {
      lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  };

  const scrollToTools = () => {
    if (currentPath !== '/') {
      navigate('/#tools');
    } else {
      scrollToSection('#tools', -20);
    }
  };

  const isHome = currentPath === '/' || currentPath === '';

  return (
    <div className="min-h-screen bg-[#05090D] text-[#EAF2F4] flex flex-col font-sans selection:bg-[#5EC4BA]/25 selection:text-[#EAF2F4]">
      {/* Navigation */}
      <Navigation
        currentPath={currentPath}
        onNavigate={navigate}
        isHeroOverlay={isHome}
      />

      {isHome ? (
        /* Home Page with Exact Nouva Hero & Redesigned Bespoke Sections */
        <main className="flex-1">
          <Hero onScrollToTools={scrollToTools} />
          <ToolsIndex onSelectTool={navigate} />
          <PrivacySection />
          <FaqSection />
        </main>
      ) : (
        /* Dedicated Tool Pages - Functionality, routes, and copy preserved exactly */
        <main className="flex-1 max-w-[1200px] w-full mx-auto px-6 py-12">
          {/* Breadcrumb / Back Link */}
          <div className="mb-8">
            <button
              onClick={() => navigate('/')}
              className="inline-flex items-center gap-2 text-sm text-[#8FA3AB] hover:text-[#5EC4BA] transition-colors"
            >
              <span>←</span>
              <span>All Tools</span>
            </button>
          </div>

          {currentPath === '/image-converter' && <ImageConverter />}
          {currentPath === '/image-enhancer' && <ImageEnhancer />}
          {currentPath === '/background-remover' && <BackgroundRemover />}
          {currentPath === '/units-converter' && <UnitsConverter />}
          {currentPath === '/bmi-calculator' && <BmiCalculator />}

          {/* Catch-all for unrecognized path */}
          {![
            '/image-converter',
            '/image-enhancer',
            '/background-remover',
            '/units-converter',
            '/bmi-calculator',
          ].includes(currentPath) && (
            <div className="text-center py-20 space-y-4">
              <h1 className="text-3xl font-normal text-white">Tool Not Found</h1>
              <p className="text-[#8FA3AB]">
                The requested tool page does not exist.
              </p>
              <button
                onClick={() => navigate('/')}
                className="h-10 px-6 font-medium bg-white text-[#05090D] hover:bg-[#EAF2F4] rounded-[10px] text-sm transition-colors"
              >
                Return to Home
              </button>
            </div>
          )}
        </main>
      )}

      {/* Persistent Global Footer */}
      <Footer onNavigate={navigate} />
    </div>
  );
}
