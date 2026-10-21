import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenisInstance: Lenis | null = null;
let tickerCallback: ((time: number) => void) | null = null;

// Easing function: easeInOutQuart
export const easeInOutQuart = (t: number): number => {
  return t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2;
};

export function initSmoothScroll(): { lenis: Lenis | null; cleanup: () => void } {
  if (typeof window === 'undefined') {
    return { lenis: null, cleanup: () => {} };
  }

  // Check if reduced motion is requested
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion) {
    if (lenisInstance) {
      lenisInstance.destroy();
      lenisInstance = null;
    }
    return {
      lenis: null,
      cleanup: () => {
        ScrollTrigger.getAll().forEach((t) => t.kill());
      },
    };
  }

  // Prevent multiple initializations
  if (!lenisInstance) {
    lenisInstance = new Lenis({
      duration: 1.15,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.0,
      syncTouch: false, // touch smoothing off
      infinite: false,
    });

    // Notify GSAP ScrollTrigger whenever Lenis scrolls
    lenisInstance.on('scroll', ScrollTrigger.update);

    // Drive Lenis RAF loop from GSAP's shared high-precision ticker
    tickerCallback = (time: number) => {
      lenisInstance?.raf(time * 1000);
    };
    gsap.ticker.add(tickerCallback);

    // Turn off lag smoothing to prevent visual jumps during scroll
    gsap.ticker.lagSmoothing(0);
  }

  return {
    lenis: lenisInstance,
    cleanup: () => {
      if (tickerCallback) {
        gsap.ticker.remove(tickerCallback);
        tickerCallback = null;
      }
      if (lenisInstance) {
        lenisInstance.destroy();
        lenisInstance = null;
      }
      ScrollTrigger.getAll().forEach((t) => t.kill());
    },
  };
}

export function scrollToSection(target: string | HTMLElement, offset: number = -100): void {
  if (typeof window === 'undefined') return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReducedMotion || !lenisInstance) {
    if (typeof target === 'string') {
      const el = document.querySelector(target);
      el?.scrollIntoView({ behavior: 'auto' });
    } else {
      target.scrollIntoView({ behavior: 'auto' });
    }
    return;
  }

  // Anchor jumps use scrollTo with duration 1.4 and easeInOutQuart curve
  lenisInstance.scrollTo(target, {
    offset,
    duration: 1.4,
    easing: easeInOutQuart,
  });
}

export function getLenis(): Lenis | null {
  return lenisInstance;
}
