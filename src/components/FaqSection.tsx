import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface FaqItem {
  num: string;
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    num: '01',
    question: 'Do any of my uploaded images or calculations leave my device?',
    answer:
      'No. Every tool in Handy operates on client-side browser execution. Image encoding, enhancement algorithms, background segmentation, and mathematical conversions run directly in your local browser memory. No files are uploaded to any server or remote cloud storage.',
  },
  {
    num: '02',
    question: 'Which image formats are supported, and why are certain formats excluded?',
    answer:
      'Handy performs runtime capability detection on your browser to verify exactly which image encoders are supported. Formats with verified encoders (including PNG, JPEG, WebP, AVIF, BMP, and ICO) are presented. We deliberately never list an export format that cannot be saved properly by your browser.',
  },
  {
    num: '03',
    question: 'How does the background remover function without a backend service?',
    answer:
      'The background remover uses lightweight neural network weights executed directly in the browser via WebAssembly or WebGPU through ONNX Runtime. The model weights are downloaded once on initial use, stored in your browser cache, and applied locally without sending pixels over the network.',
  },
  {
    num: '04',
    question: 'Why does the BMI calculator decline adult categories for individuals under 20?',
    answer:
      'According to the World Health Organization and CDC clinical guidelines, adult BMI cutoffs (underweight < 18.5, overweight ≥ 25, obesity ≥ 30) do not apply to children and adolescents because body composition changes rapidly during growth. Pediatric screening requires age-and-sex-specific growth percentile curves rather than adult threshold categories.',
  },
  {
    num: '05',
    question: 'How are temperature and fuel economy converted compared to linear units?',
    answer:
      'Linear units (like meters to feet) scale by a simple constant factor. Temperature scales through affine transformations involving specific zero offsets (e.g., Fahrenheit to Celsius subtracts 32 before multiplying by 5/9). Fuel economy conversions between volume-per-distance (L/100 km) and distance-per-volume (mpg or km/L) require reciprocal calculations.',
  },
  {
    num: '06',
    question: 'Are there limits on file sizes or image resolutions?',
    answer:
      'To prevent browser tab crashes from out-of-memory errors, Handy enforces safe limits: individual image files up to 50 MB and resolutions up to 100 megapixels. If an image exceeds safe canvas allocation thresholds, Handy alerts you before attempting memory allocation.',
  },
];

export const FaqSection: React.FC = () => {
  const [openIndexes, setOpenIndexes] = useState<number[]>([0]);
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const toggleItem = (idx: number) => {
    setOpenIndexes((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !listRef.current) return;

    const items = listRef.current.querySelectorAll('.faq-row');

    const headerAnim = gsap.fromTo(
      headerRef.current,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%',
        },
      }
    );

    const itemsAnim = gsap.fromTo(
      items,
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.05,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: listRef.current,
          start: 'top 95%',
        },
      }
    );

    return () => {
      headerAnim.scrollTrigger?.kill();
      headerAnim.kill();
      itemsAnim.scrollTrigger?.kill();
      itemsAnim.kill();
    };
  }, []);

  return (
    <section
      id="faq"
      ref={sectionRef}
      className="relative z-20 w-full bg-[#05090D] py-28 md:py-36 border-t border-[rgba(255,255,255,0.08)] scroll-mt-20"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <div ref={headerRef} className="max-w-2xl mb-14 md:mb-16">
          <div className="text-[12px] font-medium tracking-[0.08em] uppercase text-[#5EC4BA] mb-3">
            FAQ
          </div>

          <h2 className="text-[clamp(36px,5vw,64px)] font-normal text-[#EAF2F4] tracking-[-0.02em] leading-[1.05]">
            Frequently asked questions
          </h2>

          <p className="mt-4 text-[17px] text-[#8FA3AB] leading-[1.6]">
            Answers to technical implementation, format support, and accuracy questions.
          </p>
        </div>

        {/* Clean numbered accordion with dividers only between items */}
        <div
          ref={listRef}
          className="border-t border-[rgba(255,255,255,0.08)] divide-y divide-[rgba(255,255,255,0.08)]"
        >
          {FAQS.map((faq, idx) => {
            const isOpen = openIndexes.includes(idx);
            return (
              <div key={idx} className="faq-row py-7 sm:py-8 group">
                <button
                  type="button"
                  onClick={() => toggleItem(idx)}
                  className="w-full flex items-start justify-between gap-6 text-left focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5EC4BA] rounded-[10px]"
                  aria-expanded={isOpen}
                >
                  <div className="flex items-start gap-5 sm:gap-6 flex-1 pr-4">
                    {/* Number turning --accent on open/hover */}
                    <span
                      className={`font-mono text-sm shrink-0 pt-0.5 transition-colors duration-200 ${
                        isOpen ? 'text-[#5EC4BA]' : 'text-[#8FA3AB] group-hover:text-[#5EC4BA]'
                      }`}
                    >
                      {faq.num}
                    </span>

                    {/* Question text */}
                    <h3
                      className={`text-[20px] sm:text-[23px] font-normal leading-[1.3] transition-colors duration-200 ${
                        isOpen ? 'text-[#EAF2F4]' : 'text-[#EAF2F4]/90 group-hover:text-[#EAF2F4]'
                      }`}
                    >
                      {faq.question}
                    </h3>
                  </div>

                  {/* Sleek rotated +/- indicator */}
                  <div
                    className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center transition-all duration-300 ${
                      isOpen
                        ? 'border-[#5EC4BA] bg-[#5EC4BA]/15 text-[#5EC4BA]'
                        : 'border-white/15 bg-white/[0.03] text-white/60 group-hover:border-white/30 group-hover:text-white'
                    }`}
                  >
                    <svg
                      className={`w-4 h-4 transform transition-transform duration-300 ${
                        isOpen ? 'rotate-45' : 'rotate-0'
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth="1.75"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 4.5v15m7.5-7.5h-15"
                      />
                    </svg>
                  </div>
                </button>

                {/* Animated expandable content container */}
                <div
                  className={`grid transition-all duration-300 ease-in-out ${
                    isOpen ? 'grid-rows-[1fr] opacity-100 mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <p className="pl-11 sm:pl-12 text-[16px] leading-[1.65] text-[#8FA3AB] max-w-3xl pr-4">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
