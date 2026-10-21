import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { scrollToSection } from '../utils/scroll';
import {
  FormatConverterIcon,
  QualityEnhancerIcon,
  BackgroundRemoverIcon,
  UnitsQuantitiesIcon,
  BmiCalculatorIcon,
} from './ToolIcons';

gsap.registerPlugin(ScrollTrigger);

interface FooterProps {
  onNavigate: (path: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const footerRef = useRef<HTMLElement>(null);
  const bigWordmarkRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !footerRef.current || !bigWordmarkRef.current) return;

    // Very large, low-contrast 'Handy' wordmark rises into view as footer enters
    const wordmarkAnim = gsap.fromTo(
      bigWordmarkRef.current,
      { y: 60, opacity: 0 },
      {
        y: 0,
        opacity: 0.07,
        duration: 1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: footerRef.current,
          start: 'top 85%',
        },
      }
    );

    return () => {
      wordmarkAnim.scrollTrigger?.kill();
      wordmarkAnim.kill();
    };
  }, []);

  const handleToolClick = (path: string) => {
    onNavigate(path);
    window.scrollTo({ top: 0, behavior: 'instant' });
  };

  const handleSectionLink = (sectionId: string) => {
    if (window.location.pathname === '/' || window.location.pathname === '') {
      scrollToSection(`#${sectionId}`, -30);
    } else {
      onNavigate(`/#${sectionId}`);
    }
  };

  return (
    <footer
      ref={footerRef}
      className="relative z-20 w-full bg-[#05090D] border-t border-[rgba(255,255,255,0.08)] pt-20 pb-12 overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-6 relative z-10">
        <div className="flex flex-col md:flex-row items-start justify-between gap-12 pb-16">
          {/* Left Brand block: Logo + Tagline + Copy */}
          <div className="space-y-4 max-w-sm">
            <div className="flex items-center gap-2.5">
              <img
                src="/assets/handy-logo-mark-56.png"
                alt="Handy logo mark"
                className="w-7 h-7 object-contain shrink-0"
                style={{ height: '28px' }}
              />
              <span className="text-[#EAF2F4] text-[20px] font-medium tracking-tight">
                Handy
              </span>
            </div>

            <p className="text-[16px] text-[#EAF2F4]/90 font-medium">
              All your tools. In one place.
            </p>

            <p className="text-[15px] leading-relaxed text-[#8FA3AB]">
              Private, client-side browser utilities. No account required.
            </p>
          </div>

          {/* Clean link columns for Tools and System */}
          <div className="grid grid-cols-2 gap-12 sm:gap-16 text-[15px]">
            {/* Tools Column */}
            <div className="space-y-3.5">
              <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#8FA3AB]">
                Tools
              </div>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => handleToolClick('/image-converter')}
                    className="text-[#8FA3AB] hover:text-[#5EC4BA] transition-colors text-left flex items-center gap-2"
                  >
                    <FormatConverterIcon size={16} hue="#5EC4BA" className="w-4 h-4 shrink-0" />
                    <span>Format Converter</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleToolClick('/image-enhancer')}
                    className="text-[#8FA3AB] hover:text-[#E6B866] transition-colors text-left flex items-center gap-2"
                  >
                    <QualityEnhancerIcon size={16} hue="#E6B866" className="w-4 h-4 shrink-0" />
                    <span>Quality Enhancer</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleToolClick('/background-remover')}
                    className="text-[#8FA3AB] hover:text-[#A08BF5] transition-colors text-left flex items-center gap-2"
                  >
                    <BackgroundRemoverIcon size={16} hue="#A08BF5" className="w-4 h-4 shrink-0" />
                    <span>Background Remover</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleToolClick('/units-converter')}
                    className="text-[#8FA3AB] hover:text-[#6FA9F5] transition-colors text-left flex items-center gap-2"
                  >
                    <UnitsQuantitiesIcon size={16} hue="#6FA9F5" className="w-4 h-4 shrink-0" />
                    <span>Units Converter</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleToolClick('/bmi-calculator')}
                    className="text-[#8FA3AB] hover:text-[#6FD49A] transition-colors text-left flex items-center gap-2"
                  >
                    <BmiCalculatorIcon size={16} hue="#6FD49A" className="w-4 h-4 shrink-0" />
                    <span>BMI Calculator</span>
                  </button>
                </li>
              </ul>
            </div>

            {/* System Column */}
            <div className="space-y-3.5">
              <div className="text-[12px] font-medium uppercase tracking-[0.08em] text-[#8FA3AB]">
                System
              </div>
              <ul className="space-y-2.5">
                <li>
                  <button
                    onClick={() => handleSectionLink('tools')}
                    className="text-[#8FA3AB] hover:text-[#5EC4BA] transition-colors text-left"
                  >
                    All tools
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSectionLink('privacy')}
                    className="text-[#8FA3AB] hover:text-[#5EC4BA] transition-colors text-left"
                  >
                    Privacy
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => handleSectionLink('faq')}
                    className="text-[#8FA3AB] hover:text-[#5EC4BA] transition-colors text-left"
                  >
                    FAQ
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Quiet copyright line */}
        <div className="pt-8 border-t border-[rgba(255,255,255,0.06)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8FA3AB]/70">
          <div>
            Handy · Built with modern browser standards
          </div>
          <div>
            100% client-side execution
          </div>
        </div>
      </div>

      {/* Very large, low-contrast 'Handy' wordmark across the bottom that rises into view (opacity ~6 to 8%) */}
      <div
        ref={bigWordmarkRef}
        aria-hidden="true"
        className="w-full select-none pointer-events-none text-center font-normal tracking-[-0.04em] text-[#EAF2F4] leading-none pt-4 opacity-[0.07]"
        style={{
          fontSize: 'clamp(90px, 15vw, 210px)',
        }}
      >
        Handy
      </div>
    </footer>
  );
};
