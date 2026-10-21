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

gsap.registerPlugin(ScrollTrigger);

interface ToolItem {
  id: string;
  num: string;
  name: string;
  description: string;
  path: string;
  tags: string[];
  icon: React.ReactNode;
}

const TOOLS: ToolItem[] = [
  {
    id: 'image-converter',
    num: '01',
    name: 'Universal Image Format Converter',
    description:
      'Transcode JPG, PNG, WebP, AVIF, BMP, and ICO locally with batch export and transparency control.',
    path: '/image-converter',
    tags: ['Batch Export', 'Zero Uploads', 'AVIF · WebP · ICO'],
    icon: <FormatConverterIcon size={32} />,
  },
  {
    id: 'image-enhancer',
    num: '02',
    name: 'Image Quality Enhancer',
    description:
      'Sharpen fine contours and eliminate high-ISO sensor noise via bilateral filtering and unsharp masking.',
    path: '/image-enhancer',
    tags: ['Bilateral Denoise', 'Unsharp Mask', 'Split Inspection'],
    icon: <QualityEnhancerIcon size={32} />,
  },
  {
    id: 'background-remover',
    num: '03',
    name: 'Accurate AI Background Remover',
    description:
      'Isolate foreground subjects with precision neural segmentation running locally via WebGPU and WASM.',
    path: '/background-remover',
    tags: ['Onnx Runtime', 'Alpha Feathering', 'Defringing'],
    icon: <BackgroundRemoverIcon size={32} />,
  },
  {
    id: 'units-converter',
    num: '04',
    name: 'Universal Units & Quantities',
    description:
      'Convert across 19 scientific categories including typography, culinary dry/fluid, and reciprocal fuel.',
    path: '/units-converter',
    tags: ['19 Categories', 'BigInt Math', 'Reciprocal Fuel'],
    icon: <UnitsQuantitiesIcon size={32} />,
  },
  {
    id: 'bmi-calculator',
    num: '05',
    name: 'Body Mass Index Calculator',
    description:
      'Calculate clinical body mass index conforming to WHO adult categories and CDC pediatric growth rules.',
    path: '/bmi-calculator',
    tags: ['WHO Adult Cutoffs', 'Pediatric Logic', 'Dual Units'],
    icon: <BmiCalculatorIcon size={32} />,
  },
];

interface ToolsIndexProps {
  onSelectTool: (path: string) => void;
}

export const ToolsIndex: React.FC<ToolsIndexProps> = ({ onSelectTool }) => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !listRef.current) return;

    const rows = listRef.current.querySelectorAll('.tool-row');

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

    const rowsAnim = gsap.fromTo(
      rows,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.06,
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
      rowsAnim.scrollTrigger?.kill();
      rowsAnim.kill();
    };
  }, []);

  return (
    <section
      id="tools"
      ref={sectionRef}
      className="relative z-20 w-full bg-[#05090D] py-28 md:py-36 -mt-10 sm:-mt-14 scroll-mt-20"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <div ref={headerRef} className="max-w-2xl mb-14 md:mb-16">
          <div className="text-[12px] font-medium tracking-[0.08em] uppercase text-[#5EC4BA] mb-3">
            TOOLS
          </div>

          <h2 className="text-[clamp(36px,5vw,64px)] font-normal text-[#EAF2F4] tracking-[-0.02em] leading-[1.05]">
            Five tools.
            <br />
            Zero uploads.
          </h2>

          <p className="mt-4 text-[17px] text-[#8FA3AB] leading-[1.6]">
            Every utility operates completely inside your client browser memory.
            No servers, no telemetry, and no accounts required.
          </p>
        </div>

        {/* Large Interactive Rows (not a card grid), numbered 01 to 05 */}
        <div
          ref={listRef}
          className="border-t border-[rgba(255,255,255,0.08)] divide-y divide-[rgba(255,255,255,0.08)]"
        >
          {TOOLS.map((tool) => (
            <div
              key={tool.id}
              onClick={() => onSelectTool(tool.path)}
              className="tool-row group flex flex-col md:flex-row md:items-center justify-between gap-6 py-8 sm:py-9 px-4 sm:px-6 -mx-4 sm:-mx-6 rounded-[10px] cursor-pointer hover:bg-white/[0.02] transition-all duration-200"
            >
              {/* Left group: Number, 56px Icon tile, and Information */}
              <div className="flex items-start sm:items-center gap-5 sm:gap-7 flex-1 min-w-0">
                {/* 01-05 Index */}
                <span className="font-mono text-sm text-[#8FA3AB] shrink-0 pt-1 sm:pt-0 w-6">
                  {tool.num}
                </span>

                {/* 56px Icon tile, rounded 14px, surface color, 1px hairline border */}
                <div className="w-14 h-14 rounded-[14px] bg-[#0F1A22] border border-[rgba(255,255,255,0.08)] group-hover:border-[#5EC4BA]/40 group-hover:bg-[#5EC4BA]/5 flex items-center justify-center shrink-0 transition-colors">
                  {tool.icon}
                </div>

                {/* Tool Name, Description, and Capability Tags */}
                <div className="space-y-1.5 flex-1 min-w-0 pr-4">
                  <div className="flex flex-wrap items-baseline gap-3">
                    <h3 className="text-[20px] sm:text-[24px] font-normal text-[#EAF2F4] tracking-tight group-hover:text-white transition-colors">
                      {tool.name}
                    </h3>
                  </div>

                  <p className="text-[15px] sm:text-[16px] text-[#8FA3AB] leading-relaxed line-clamp-2 md:line-clamp-1">
                    {tool.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {tool.tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="text-[12px] text-[#8FA3AB]/75 font-mono"
                      >
                        {idx > 0 && <span className="mr-2 text-white/20">·</span>}
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right: Open link with arrow */}
              <div className="shrink-0 flex items-center gap-2 self-end md:self-center pl-16 md:pl-0">
                <span className="text-[16px] font-medium text-[#EAF2F4] group-hover:text-[#5EC4BA] transition-colors">
                  Open
                </span>
                <span className="text-white/60 group-hover:text-[#5EC4BA] group-hover:translate-x-1.5 transition-all duration-200 text-lg">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
