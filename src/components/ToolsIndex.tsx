import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
  FormatConverterIcon,
  QualityEnhancerIcon,
  BackgroundRemoverIcon,
  UnitsQuantitiesIcon,
  BmiCalculatorIcon,
} from './ToolIcons';
import { ToolCard, ToolCardData } from './tools-index/ToolCard';
import { DemoFormatConverter } from './tools-index/DemoFormatConverter';
import { DemoQualityEnhancer } from './tools-index/DemoQualityEnhancer';
import { DemoBackgroundRemover } from './tools-index/DemoBackgroundRemover';
import { DemoUnitsConverter } from './tools-index/DemoUnitsConverter';
import { DemoBmiCalculator } from './tools-index/DemoBmiCalculator';

gsap.registerPlugin(ScrollTrigger);

interface ToolsIndexProps {
  onSelectTool: (path: string) => void;
}

const TOOLS: ToolCardData[] = [
  {
    id: 'image-converter',
    num: '01',
    category: 'Image tool',
    name: 'Universal Image Format Converter',
    description:
      'Transcode JPG, PNG, WebP, AVIF, BMP, and ICO locally with batch export and transparency control.',
    path: '/image-converter',
    tags: ['Batch Export', 'Zero Uploads', 'AVIF · WebP · ICO'],
    hue: '#5EC4BA',
    hueRgb: '94, 196, 186',
    buttonText: 'Convert images',
    statusText: 'Runs in your browser',
    icon: ({ hue, isHovered }) => <FormatConverterIcon hue={hue} isHovered={isHovered} />,
    renderStage: ({ isVisible, isHovered }) => (
      <DemoFormatConverter isVisible={isVisible} isHovered={isHovered} />
    ),
  },
  {
    id: 'image-enhancer',
    num: '02',
    category: 'Image tool',
    name: 'Image Quality Enhancer',
    description:
      'Sharpen fine contours and eliminate high-ISO sensor noise via bilateral filtering and unsharp masking.',
    path: '/image-enhancer',
    tags: ['Bilateral Denoise', 'Unsharp Mask', 'Split Inspection'],
    hue: '#E6B866',
    hueRgb: '230, 184, 102',
    buttonText: 'Enhance a photo',
    statusText: 'Runs in your browser',
    icon: ({ hue, isHovered }) => <QualityEnhancerIcon hue={hue} isHovered={isHovered} />,
    renderStage: ({ isVisible, isHovered }) => (
      <DemoQualityEnhancer isVisible={isVisible} isHovered={isHovered} />
    ),
  },
  {
    id: 'background-remover',
    num: '03',
    category: 'Local AI model',
    name: 'Accurate AI Background Remover',
    description:
      'Isolate foreground subjects with precision neural segmentation running locally via WebGPU and WASM.',
    path: '/background-remover',
    tags: ['Onnx Runtime', 'Alpha Feathering', 'Defringing'],
    hue: '#A08BF5',
    hueRgb: '160, 139, 245',
    buttonText: 'Remove background',
    statusText: 'Runs in your browser, one-time model download',
    icon: ({ hue, isHovered }) => <BackgroundRemoverIcon hue={hue} isHovered={isHovered} />,
    renderStage: ({ isVisible, isHovered }) => (
      <DemoBackgroundRemover isVisible={isVisible} isHovered={isHovered} />
    ),
  },
  {
    id: 'units-converter',
    num: '04',
    category: 'Calculator',
    name: 'Universal Units & Quantities',
    description:
      'Convert across 19 scientific categories including typography, culinary dry/fluid, and reciprocal fuel.',
    path: '/units-converter',
    tags: ['19 Categories', 'BigInt Math', 'Reciprocal Fuel'],
    hue: '#6FA9F5',
    hueRgb: '111, 169, 245',
    buttonText: 'Convert units',
    statusText: 'Runs in your browser',
    icon: ({ hue, isHovered }) => <UnitsQuantitiesIcon hue={hue} isHovered={isHovered} />,
    renderStage: ({ isVisible, isHovered }) => (
      <DemoUnitsConverter isVisible={isVisible} isHovered={isHovered} />
    ),
  },
  {
    id: 'bmi-calculator',
    num: '05',
    category: 'Calculator',
    name: 'Body Mass Index Calculator',
    description:
      'Calculate clinical body mass index conforming to WHO adult categories and CDC pediatric growth rules.',
    path: '/bmi-calculator',
    tags: ['WHO Adult Cutoffs', 'Pediatric Logic', 'Dual Units'],
    hue: '#6FD49A',
    hueRgb: '111, 212, 154',
    buttonText: 'Calculate BMI',
    statusText: 'Runs in your browser',
    icon: ({ hue, isHovered }) => <BmiCalculatorIcon hue={hue} isHovered={isHovered} />,
    renderStage: ({ isVisible, isHovered }) => (
      <DemoBmiCalculator isVisible={isVisible} isHovered={isHovered} />
    ),
  },
];

export const ToolsIndex: React.FC<ToolsIndexProps> = ({ onSelectTool }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const titleLine1Ref = useRef<HTMLSpanElement>(null);
  const titleLine2Ref = useRef<HTMLSpanElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !gridRef.current) return;

    const cards = gridRef.current.querySelectorAll('.tool-card');

    const ctx = gsap.context(() => {
      // 1. Title lines mask-reveal animation
      const titleTl = gsap.timeline({
        scrollTrigger: {
          trigger: headerRef.current,
          start: 'top 85%',
        },
      });

      titleTl.fromTo(
        [titleLine1Ref.current, titleLine2Ref.current],
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
        }
      );

      // 2. Cards entrance: rise y: 48 -> 0, opacity: 0 -> 1, stagger 0.12s, duration 0.9s
      const cardsTl = gsap.timeline({
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 85%',
          once: true,
        },
      });

      cardsTl.fromTo(
        cards,
        {
          y: 48,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          onComplete: () => {
            // Remove will-change after entrance completes
            cards.forEach((c) => {
              (c as HTMLElement).style.willChange = 'auto';
            });
          },
        }
      );

      // 3. Single thin light sweep crossing each card once as it appears
      cards.forEach((card, i) => {
        const sweepEl = card.querySelector('.light-sweep');
        if (sweepEl) {
          gsap.fromTo(
            sweepEl,
            { xPercent: -150 },
            {
              xPercent: 150,
              duration: 1.1,
              delay: 0.3 + i * 0.12,
              ease: 'power2.inOut',
              scrollTrigger: {
                trigger: card,
                start: 'top 90%',
                once: true,
              },
            }
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="tools"
      ref={sectionRef}
      className="relative z-20 w-full bg-[#05090D] pt-12 pb-28 md:pt-16 md:pb-36 scroll-mt-20 overflow-hidden"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <div ref={headerRef} className="max-w-2xl mb-14 md:mb-16">
          <div className="text-[12px] font-medium tracking-[0.08em] uppercase text-[#5EC4BA] mb-3">
            TOOLS
          </div>

          <h2 className="text-[clamp(36px,5vw,64px)] font-normal text-[#EAF2F4] tracking-[-0.02em] leading-[1.05] overflow-hidden">
            <span className="block overflow-hidden py-1">
              <span ref={titleLine1Ref} className="block will-change-transform">
                Five tools.
              </span>
            </span>
            <span className="block overflow-hidden py-1">
              <span ref={titleLine2Ref} className="block will-change-transform">
                Zero uploads.
              </span>
            </span>
          </h2>

          <p className="mt-4 text-[17px] text-[#8FA3AB] leading-[1.6]">
            Every utility operates completely inside your client browser memory.
            No servers, no telemetry, and no accounts required.
          </p>
        </div>

        {/* 12-Column Responsive Grid with Exact Spans */}
        {/* Row 1: card 01 (7 cols) + card 02 (5 cols) */}
        {/* Row 2: card 03 (4 cols) + card 04 (4 cols) + card 05 (4 cols) */}
        {/* Tablet: 2 cols, card 05 spans full width */}
        {/* Mobile: 1 col, 16:10 stage aspect ratio */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6 items-stretch"
        >
          {/* Card 01: Universal Image Format Converter (Row 1: 7 cols on desktop) */}
          <div className="lg:col-span-7 flex relative overflow-hidden rounded-[20px]">
            {/* Single light sweep */}
            <div className="light-sweep absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none z-30 opacity-70" />
            <ToolCard
              tool={TOOLS[0]}
              onSelect={onSelectTool}
              className="w-full flex-1"
            />
          </div>

          {/* Card 02: Image Quality Enhancer (Row 1: 5 cols on desktop) */}
          <div className="lg:col-span-5 flex relative overflow-hidden rounded-[20px]">
            {/* Single light sweep */}
            <div className="light-sweep absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none z-30 opacity-70" />
            <ToolCard
              tool={TOOLS[1]}
              onSelect={onSelectTool}
              className="w-full flex-1"
            />
          </div>

          {/* Card 03: Accurate AI Background Remover (Row 2: 4 cols on desktop) */}
          <div className="lg:col-span-4 flex relative overflow-hidden rounded-[20px]">
            {/* Single light sweep */}
            <div className="light-sweep absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none z-30 opacity-70" />
            <ToolCard
              tool={TOOLS[2]}
              onSelect={onSelectTool}
              className="w-full flex-1"
            />
          </div>

          {/* Card 04: Universal Units & Quantities (Row 2: 4 cols on desktop) */}
          <div className="lg:col-span-4 flex relative overflow-hidden rounded-[20px]">
            {/* Single light sweep */}
            <div className="light-sweep absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none z-30 opacity-70" />
            <ToolCard
              tool={TOOLS[3]}
              onSelect={onSelectTool}
              className="w-full flex-1"
            />
          </div>

          {/* Card 05: Body Mass Index Calculator (Row 2: 4 cols on desktop, full width on tablet) */}
          <div className="md:col-span-2 lg:col-span-4 flex relative overflow-hidden rounded-[20px]">
            {/* Single light sweep */}
            <div className="light-sweep absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none z-30 opacity-70" />
            <ToolCard
              tool={TOOLS[4]}
              onSelect={onSelectTool}
              className="w-full flex-1"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
