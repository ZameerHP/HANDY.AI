import React, { useState, useEffect, useRef } from 'react';
import {
  FormatConverterIcon,
  QualityEnhancerIcon,
  BackgroundRemoverIcon,
  UnitsQuantitiesIcon,
  BmiCalculatorIcon,
} from './ToolIcons';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTool: (path: string) => void;
}

interface PaletteItem {
  id: string;
  name: string;
  category: string;
  description: string;
  path: string;
  hue: string;
  shortcut: string;
  icon: (hue: string) => React.ReactNode;
}

const TOOLS: PaletteItem[] = [
  {
    id: 'image-converter',
    name: 'Universal Image Format Converter',
    category: 'Image Transcoder',
    description: 'Convert WebP, AVIF, JPG, PNG, and ICO in client memory',
    path: '/image-converter',
    hue: '#5EC4BA',
    shortcut: '1',
    icon: (h) => <FormatConverterIcon size={18} hue={h} className="w-[18px] h-[18px] shrink-0" />,
  },
  {
    id: 'image-enhancer',
    name: 'Image Quality Enhancer',
    category: 'Visual Restoration',
    description: 'Sharpen fine contours and denoise photography locally',
    path: '/image-enhancer',
    hue: '#E6B866',
    shortcut: '2',
    icon: (h) => <QualityEnhancerIcon size={18} hue={h} className="w-[18px] h-[18px] shrink-0" />,
  },
  {
    id: 'background-remover',
    name: 'Accurate AI Background Remover',
    category: 'Segmentation',
    description: 'Neural background removal with transparent alpha mask',
    path: '/background-remover',
    hue: '#A08BF5',
    shortcut: '3',
    icon: (h) => <BackgroundRemoverIcon size={18} hue={h} className="w-[18px] h-[18px] shrink-0" />,
  },
  {
    id: 'units-converter',
    name: 'Universal Units & Quantities',
    category: 'Measurement Engine',
    description: 'Convert metric, imperial, thermodynamic, and chronometric units',
    path: '/units-converter',
    hue: '#6FA9F5',
    shortcut: '4',
    icon: (h) => <UnitsQuantitiesIcon size={18} hue={h} className="w-[18px] h-[18px] shrink-0" />,
  },
  {
    id: 'bmi-calculator',
    name: 'Body Mass Index Calculator',
    category: 'Health Metric',
    description: 'WHO adult body mass index with calibrated semicircle gauge',
    path: '/bmi-calculator',
    hue: '#6FD49A',
    shortcut: '5',
    icon: (h) => <BmiCalculatorIcon size={18} hue={h} className="w-[18px] h-[18px] shrink-0" />,
  },
];

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTool,
}) => {
  const [query, setQuery] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const filteredTools = TOOLS.filter((tool) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.category.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.shortcut === q
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 40);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredTools.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev === 0 ? Math.max(0, filteredTools.length - 1) : prev - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTools[selectedIndex]) {
        onSelectTool(filteredTools[selectedIndex].path);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command palette"
      className="fixed inset-0 z-[100] flex items-start justify-center pt-24 sm:pt-28 px-4"
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
      />

      {/* Palette Card */}
      <div
        className="relative z-10 w-full max-w-[560px] rounded-[18px] bg-[#0A1218] border border-white/12 shadow-[0_24px_64px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.08] bg-[#0E161D]">
          <svg
            className="w-4 h-4 text-[#8FA3AB]"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search tools or type a number (1-5)..."
            className="flex-1 bg-transparent text-[14px] text-[#EAF2F4] placeholder-[#8FA3AB]/70 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="px-1.5 py-0.5 rounded text-[11px] font-mono text-[#8FA3AB] bg-white/[0.06] hover:bg-white/[0.12] transition-colors"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div ref={listRef} className="max-h-[320px] overflow-y-auto p-2 divide-y divide-white/[0.04]">
          {filteredTools.length === 0 ? (
            <div className="py-8 text-center text-sm text-[#8FA3AB]">
              No tools matching &quot;{query}&quot;
            </div>
          ) : (
            filteredTools.map((tool, idx) => {
              const isSelected = selectedIndex === idx;
              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    onSelectTool(tool.path);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between gap-3 p-3 rounded-[12px] cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'bg-white/[0.08] shadow-sm'
                      : 'hover:bg-white/[0.04]'
                  }`}
                  style={
                    isSelected
                      ? {
                          borderLeft: `3px solid ${tool.hue}`,
                          paddingLeft: '9px',
                        }
                      : {}
                  }
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0 border border-white/10"
                      style={{ backgroundColor: `${tool.hue}20` }}
                    >
                      {tool.icon(tool.hue)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium text-[#EAF2F4] truncate">
                        {tool.name}
                      </div>
                      <div className="text-[11px] text-[#8FA3AB] truncate">
                        {tool.description}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-[#8FA3AB]">
                      {tool.shortcut}
                    </span>
                    <span className="text-xs text-[#8FA3AB]">↵</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 bg-[#060B0F] border-t border-white/[0.06] flex items-center justify-between text-[11px] text-[#8FA3AB]">
          <span>Navigate with ↑ ↓ · Select with ↵</span>
          <span>Zero uploads · 100% in-browser</span>
        </div>
      </div>
    </div>
  );
};
