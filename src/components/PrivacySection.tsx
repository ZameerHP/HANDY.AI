import React, { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface ToolPrivacyFact {
  id: string;
  name: string;
  shortName: string;
  status: string;
  isDownload: boolean;
  execution: string;
  downloads: string;
  persistence: string;
}

const TOOL_FACTS: ToolPrivacyFact[] = [
  {
    id: 'image-converter',
    name: 'Universal Image Format Converter',
    shortName: 'Format Converter',
    status: 'Runs locally',
    isDownload: false,
    execution:
      'Runs 100% locally in browser memory using HTML5 Canvas & Web Workers.',
    downloads: 'Zero downloads. No external codecs or scripts.',
    persistence:
      'Images are never uploaded or retained. Object URLs are immediately revoked upon export or reset.',
  },
  {
    id: 'image-enhancer',
    name: 'Image Quality Enhancer',
    shortName: 'Quality Enhancer',
    status: 'Runs locally',
    isDownload: false,
    execution:
      'Processes raw RGBA pixel arrays locally via client-side convolution and bilateral filters.',
    downloads: 'Zero downloads for conventional enhancement mode.',
    persistence:
      'Processed frames exist exclusively in browser RAM and are purged on tab close.',
  },
  {
    id: 'background-remover',
    name: 'Accurate AI Background Remover',
    shortName: 'Background Remover',
    status: 'One-time 28 MB model download',
    isDownload: true,
    execution:
      'Inference runs entirely on-device via WebAssembly/WebGPU through ONNX Runtime.',
    downloads:
      'Neural model weights (~28 MB) downloaded once on initial run and cached locally in browser CacheStorage.',
    persistence:
      'No photo or video data ever leaves your device. All alpha masking operations occur locally.',
  },
  {
    id: 'units-converter',
    name: 'Universal Units & Quantities',
    shortName: 'Units Converter',
    status: 'Runs locally',
    isDownload: false,
    execution:
      'Mathematical conversions execute synchronously via pure JavaScript math routines and BigInt arithmetic.',
    downloads: 'Zero downloads.',
    persistence: 'No telemetry, logs, or stored calculations.',
  },
  {
    id: 'bmi-calculator',
    name: 'Body Mass Index Calculator',
    shortName: 'BMI Calculator',
    status: 'Runs locally',
    isDownload: false,
    execution:
      'Evaluated locally in memory according to WHO clinical equations and CDC pediatric percentiles.',
    downloads: 'Zero downloads.',
    persistence:
      'Heights, weights, and health metrics are never recorded, cached, or transmitted.',
  },
];

export const PrivacySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const sectionRef = useRef<HTMLElement>(null);
  const leftColRef = useRef<HTMLDivElement>(null);
  const rightColRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !sectionRef.current) return;

    const anim = gsap.fromTo(
      [leftColRef.current, rightColRef.current],
      { opacity: 0, y: 28 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.12,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
        },
      }
    );

    return () => {
      anim.scrollTrigger?.kill();
      anim.kill();
    };
  }, []);

  const currentFact = TOOL_FACTS[activeTab];

  return (
    <section
      id="privacy"
      ref={sectionRef}
      className="relative z-20 w-full bg-[#05090D] py-28 md:py-36 border-t border-[rgba(255,255,255,0.08)] scroll-mt-20"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Two-column layout on desktop: Left column sticky, Right column tablist + panel */}
        <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-12 lg:gap-16 items-start">
          {/* Left Column (Sticky on desktop) */}
          <div ref={leftColRef} className="lg:sticky lg:top-28 space-y-4">
            <div className="text-[12px] font-medium tracking-[0.08em] uppercase text-[#5EC4BA]">
              PRIVACY
            </div>

            <h2 className="text-[clamp(34px,4.2vw,54px)] font-normal text-[#EAF2F4] tracking-[-0.02em] leading-[1.05]">
              Your files never leave your device.
            </h2>

            <p className="text-[16px] text-[#8FA3AB] leading-[1.6] pt-1">
              A factual technical disclosure of how data, memory, and neural assets are
              handled per tool. Every computation is strictly sandboxed on your local hardware.
            </p>
          </div>

          {/* Right Column: Accessible ARIA tablist + Disclosures Panel */}
          <div ref={rightColRef} className="space-y-6">
            {/* ARIA Tablist */}
            <div
              role="tablist"
              aria-label="Tool Privacy Disclosures"
              className="flex flex-wrap gap-2 p-1.5 rounded-[10px] bg-[#0A1218] border border-[rgba(255,255,255,0.08)]"
            >
              {TOOL_FACTS.map((fact, idx) => {
                const isActive = activeTab === idx;
                return (
                  <button
                    key={fact.id}
                    id={`tab-${fact.id}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`panel-${fact.id}`}
                    onClick={() => setActiveTab(idx)}
                    className={`px-3.5 py-2 rounded-[8px] text-[13px] sm:text-[14px] font-medium transition-all duration-200 focus:outline-none focus-visible:ring-1 focus-visible:ring-[#5EC4BA] ${
                      isActive
                        ? 'bg-[#0F1A22] text-[#EAF2F4] border border-[rgba(255,255,255,0.12)] shadow-sm'
                        : 'text-[#8FA3AB] hover:text-[#EAF2F4] hover:bg-white/[0.02]'
                    }`}
                  >
                    {fact.shortName}
                  </button>
                );
              })}
            </div>

            {/* Single Panel Disclosing Facts */}
            <div
              id={`panel-${currentFact.id}`}
              role="tabpanel"
              aria-labelledby={`tab-${currentFact.id}`}
              className="p-8 sm:p-10 rounded-[10px] bg-[#0A1218] border border-[rgba(255,255,255,0.08)] space-y-8"
            >
              {/* Tool Header & Status Badge */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[rgba(255,255,255,0.08)]">
                <h3 className="text-[22px] sm:text-[26px] font-normal text-[#EAF2F4]">
                  {currentFact.name}
                </h3>

                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-[6px] bg-[#0F1A22] border border-[rgba(255,255,255,0.08)] shrink-0 self-start sm:self-auto">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      currentFact.isDownload ? 'bg-[#5EC4BA]' : 'bg-[#5EC4BA] animate-pulse'
                    }`}
                  />
                  <span className="text-xs font-mono text-[#EAF2F4]">
                    {currentFact.status}
                  </span>
                </div>
              </div>

              {/* Three Structured Disclosure Categories */}
              <div className="space-y-6">
                <div className="space-y-1.5">
                  <div className="text-[12px] uppercase tracking-[0.08em] text-[#5EC4BA] font-medium">
                    Execution
                  </div>
                  <p className="text-[16px] text-[#EAF2F4] leading-[1.6]">
                    {currentFact.execution}
                  </p>
                </div>

                <div className="space-y-1.5 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <div className="text-[12px] uppercase tracking-[0.08em] text-[#8FA3AB] font-medium">
                    Downloads and assets
                  </div>
                  <p className="text-[16px] text-[#8FA3AB] leading-[1.6]">
                    {currentFact.downloads}
                  </p>
                </div>

                <div className="space-y-1.5 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                  <div className="text-[12px] uppercase tracking-[0.08em] text-[#8FA3AB] font-medium">
                    Data persistence
                  </div>
                  <p className="text-[16px] text-[#8FA3AB] leading-[1.6]">
                    {currentFact.persistence}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
