import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface HeroProps {
  onScrollToTools: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onScrollToTools }) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const bgImgRef = useRef<HTMLDivElement>(null);
  const darkOverlayRef = useRef<HTMLDivElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);
  const subcopyRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollCueRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isDesktop = window.innerWidth >= 768;

    if (prefersReducedMotion) {
      // Instant reveal
      gsap.set([line1Ref.current, line2Ref.current, subcopyRef.current, ctaRef.current, scrollCueRef.current], {
        opacity: 1,
        y: 0,
      });
      return;
    }

    // 1. Initial Load Timeline
    // On load, headline reveals line by line: each line sits inside an overflow-hidden mask
    // and rises from 100% with stagger ~0.12s and duration ~0.9s with strong ease-out (power3.out).
    // The subtext and button then fade in and rise 16px.
    const loadTl = gsap.timeline({ defaults: { ease: 'power3.out' } });

    gsap.set([line1Ref.current, line2Ref.current], { yPercent: 110, opacity: 0 });
    gsap.set([subcopyRef.current, ctaRef.current], { y: 16, opacity: 0 });
    gsap.set(scrollCueRef.current, { opacity: 0, y: 10 });

    loadTl
      .to(line1Ref.current, { yPercent: 0, opacity: 1, duration: 0.9 })
      .to(line2Ref.current, { yPercent: 0, opacity: 1, duration: 0.9 }, '-=0.78')
      .to(subcopyRef.current, { opacity: 1, y: 0, duration: 0.7 }, '-=0.4')
      .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.7 }, '-=0.5')
      .to(scrollCueRef.current, { opacity: 1, y: 0, duration: 0.6 }, '-=0.3');

    // 2. Scroll Animation and Pinning
    let scrollTriggerInstance: ScrollTrigger | null = null;

    if (isDesktop && wrapperRef.current && innerRef.current) {
      // Pin the hero for about 80% of one viewport height of extra scroll
      const scrubTl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapperRef.current,
          start: 'top top',
          end: '+=80%',
          pin: innerRef.current,
          pinSpacing: true,
          scrub: 0.6,
          invalidateOnRefresh: true,
        },
      });

      scrollTriggerInstance = scrubTl.scrollTrigger ?? null;

      // While pinned:
      // - Mountain background slow scale 1.00 to 1.06
      // - Darkening overlay increasing to about 55%
      // - "SCROLL TO DISCOVER" fades out first
      // - Headline lines drift upward at slightly different speeds (parallax between lines)
      // - Subtext and button fade and move up after the headline
      scrubTl
        .to(scrollCueRef.current, { opacity: 0, duration: 0.2 }, 0)
        .to(bgImgRef.current, { scale: 1.06, ease: 'none', duration: 1 }, 0)
        .to(darkOverlayRef.current, { opacity: 0.55, ease: 'none', duration: 1 }, 0)
        .to(line1Ref.current, { y: -70, ease: 'none', duration: 0.9 }, 0.1)
        .to(line2Ref.current, { y: -50, ease: 'none', duration: 0.9 }, 0.12)
        .to([subcopyRef.current, ctaRef.current], { opacity: 0, y: -45, ease: 'none', duration: 0.7 }, 0.2);
    }

    return () => {
      loadTl.kill();
      scrollTriggerInstance?.kill();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="relative w-full z-10">
      <section
        ref={innerRef}
        className="relative w-full h-[100svh] min-h-[640px] overflow-hidden flex flex-col justify-between"
      >
        {/* Background Dusk Mountain Photo with responsive sources */}
        <div ref={bgImgRef} className="absolute inset-0 w-full h-full z-0 origin-center will-change-transform">
          <picture className="w-full h-full">
            <source
              media="(max-width: 1200px)"
              srcSet="/assets/dusk-mountains-1200.webp"
              type="image/webp"
            />
            <source
              media="(min-width: 1201px)"
              srcSet="/assets/dusk-mountains-1920.webp"
              type="image/webp"
            />
            <img
              src="/assets/dusk-mountains.jpg"
              alt="Dusk mountain landscape with deep blue ridges and warm horizon glow"
              className="w-full h-full object-cover object-center select-none pointer-events-none"
              loading="eager"
              decoding="async"
            />
          </picture>
        </div>

        {/* Film grain: fine monochrome noise over the whole hero */}
        <div
          className="absolute inset-0 w-full h-full hero-grain z-10"
          aria-hidden="true"
        />

        {/* Darkening overlay on scroll (up to 55%) */}
        <div
          ref={darkOverlayRef}
          className="absolute inset-0 w-full h-full bg-[#05090D] opacity-0 pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* One functional scrim only: transparent to #05090D over bottom 25% so next section blends seamlessly */}
        <div
          className="absolute bottom-0 left-0 right-0 h-[25%] bg-gradient-to-b from-transparent via-[#05090D]/60 to-[#05090D] pointer-events-none z-10"
          aria-hidden="true"
        />

        {/* Hero Content Area */}
        <div className="relative z-20 w-full max-w-[1200px] mx-auto px-6 flex-1 flex flex-col items-center justify-start pt-[175px] sm:pt-[180px]">
          {/* Headline: centered on two lines with line-by-line masked reveal */}
          <h1 className="text-center text-white font-normal text-[clamp(36px,4.5vw,58px)] leading-[1.05] tracking-[-0.02em] select-none">
            <span className="block overflow-hidden py-1">
              <span ref={line1Ref} className="block will-change-transform">
                All your tools.
              </span>
            </span>
            <span className="block overflow-hidden py-1">
              <span ref={line2Ref} className="block will-change-transform">
                In one place.
              </span>
            </span>
          </h1>

          {/* Subcopy: centered, max width 360px, two lines, 24px below headline */}
          <p
            ref={subcopyRef}
            className="mt-6 text-center text-[17px] leading-[1.5] text-[rgba(234,242,244,0.72)] max-w-[390px] px-4 mx-auto select-none [text-wrap:balance]"
          >
            Convert images, sharpen photos, remove backgrounds,
            <br className="hidden sm:inline" />
            {' '}switch units and check your BMI, all in your browser.
          </p>

          {/* CTA: white button, dark text, 16px/500, 44px high, padding 0 28px, radius 10px, 28px below subcopy */}
          <div ref={ctaRef} className="mt-7">
            <button
              onClick={onScrollToTools}
              className="h-[44px] px-7 rounded-[10px] text-base font-medium bg-white text-[#05090D] hover:bg-[#EAF2F4] active:scale-[0.98] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5EC4BA]"
            >
              Try a tool
            </button>
          </div>
        </div>

        {/* Scroll cue: bottom center, SCROLL TO DISCOVER in muted text with thin 14px chevron below, ~28px from bottom */}
        <div ref={scrollCueRef} className="relative z-20 pb-7 flex flex-col items-center justify-center">
          <button
            onClick={onScrollToTools}
            className="group flex flex-col items-center gap-1.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5EC4BA] rounded-[10px] p-2"
            aria-label="Scroll to discover tools"
          >
            <span className="text-[12px] font-medium tracking-[0.04em] uppercase text-[#8FA3AB] group-hover:text-white transition-colors">
              SCROLL TO DISCOVER
            </span>
            <svg
              className="w-3.5 h-3.5 text-[#8FA3AB] group-hover:text-white transition-colors"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1.5"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </section>
    </div>
  );
};
