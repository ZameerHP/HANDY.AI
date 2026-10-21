import React, { useState, useMemo, useRef } from 'react';
import { convertUnit } from '../../utils/units';
import { calculateBmi } from '../../utils/bmi';
import { getLenis } from '../../utils/scroll';
import {
  FormatConverterIcon,
  QualityEnhancerIcon,
  BackgroundRemoverIcon,
  UnitsQuantitiesIcon,
  BmiCalculatorIcon,
} from '../ToolIcons';

interface DemoAllToolsProps {
  isVisible: boolean;
  isHovered: boolean;
  onSelectTab: (idx: number) => void;
}

const FORMAT_OPTIONS = [
  { ext: 'WebP', reduction: '-68%', mime: 'image/webp' },
  { ext: 'AVIF', reduction: '-82%', mime: 'image/avif' },
  { ext: 'JPG', reduction: '-45%', mime: 'image/jpeg' },
  { ext: 'PNG', reduction: '-15%', mime: 'image/png' },
  { ext: 'ICO', reduction: '-90%', mime: 'image/x-icon' },
];

export const DemoAllTools: React.FC<DemoAllToolsProps> = ({
  onSelectTab,
}) => {
  // Tool 1: Converter state
  const [selectedFormat, setSelectedFormat] = useState<number>(0);

  // Tool 2: Enhancer state (draggable split slider)
  const [enhancerSplit, setEnhancerSplit] = useState<number>(52);
  const enhancerContainerRef = useRef<HTMLDivElement>(null);
  const isDraggingEnhancer = useRef<boolean>(false);

  // Tool 3: Background Remover state (cutout vs original toggle)
  const [bgMode, setBgMode] = useState<'cutout' | 'original'>('cutout');

  // Tool 4: Units Converter state
  const [unitVal, setUnitVal] = useState<string>('5');
  const [unitCategory, setUnitCategory] = useState<'length' | 'weight' | 'temp'>('length');
  const [unitFrom, setUnitFrom] = useState<string>('km');
  const [unitTo, setUnitTo] = useState<string>('mi');
  const [copiedUnit, setCopiedUnit] = useState<boolean>(false);

  // Tool 5: BMI Calculator state
  const [bmiHeight, setBmiHeight] = useState<string>('178');
  const [bmiWeight, setBmiWeight] = useState<string>('71');

  // Navigation helper
  const navigateTo = (path: string) => {
    window.history.pushState({}, '', path);
    window.dispatchEvent(new PopStateEvent('popstate'));
    const lenis = getLenis();
    if (lenis) lenis.scrollTo(0, { duration: 1.2 });
    else window.scrollTo({ top: 0, behavior: 'instant' });
  };

  // Unit conversion math
  const unitConversionResult = useMemo(() => {
    const num = parseFloat(unitVal);
    if (isNaN(num)) return '0';
    try {
      const res = convertUnit(unitCategory, unitFrom, unitTo, num);
      return res.formatted;
    } catch {
      return '0';
    }
  }, [unitCategory, unitFrom, unitTo, unitVal]);

  const handleUnitCategoryChange = (cat: 'length' | 'weight' | 'temp') => {
    setUnitCategory(cat);
    if (cat === 'length') {
      setUnitFrom('km');
      setUnitTo('mi');
      setUnitVal('5');
    } else if (cat === 'weight') {
      setUnitFrom('kg');
      setUnitTo('lb');
      setUnitVal('70');
    } else {
      setUnitFrom('c');
      setUnitTo('f');
      setUnitVal('22');
    }
  };

  const handleUnitSwap = () => {
    setUnitFrom(unitTo);
    setUnitTo(unitFrom);
  };

  const handleCopyUnit = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${unitConversionResult} ${unitTo}`);
      setCopiedUnit(true);
      setTimeout(() => setCopiedUnit(false), 1400);
    }
  };

  // BMI Math
  const bmiResult = useMemo(() => {
    const h = parseFloat(bmiHeight);
    const w = parseFloat(bmiWeight);
    return calculateBmi({
      unitSystem: 'metric',
      age: 30,
      heightCm: isNaN(h) ? 178 : h,
      weightKg: isNaN(w) ? 71 : w,
    });
  }, [bmiHeight, bmiWeight]);

  const bmiVal = bmiResult.isValid && bmiResult.bmi ? bmiResult.bmi : 22.4;

  const needleAngle = useMemo(() => {
    const clamped = Math.max(14, Math.min(36, bmiVal));
    if (clamped <= 18.5) {
      return -90 + ((clamped - 14) / 4.5) * 45;
    } else if (clamped <= 24.9) {
      return -45 + ((clamped - 18.5) / 6.4) * 45;
    } else if (clamped <= 29.9) {
      return 0 + ((clamped - 24.9) / 5.0) * 45;
    } else {
      return 45 + ((clamped - 29.9) / 6.1) * 45;
    }
  }, [bmiVal]);

  // Enhancer Drag Handlers
  const handleEnhancerPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingEnhancer.current = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    updateEnhancerPos(e.clientX);
  };

  const handleEnhancerPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (isDraggingEnhancer.current) {
      updateEnhancerPos(e.clientX);
    }
  };

  const handleEnhancerPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingEnhancer.current = false;
    (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
  };

  const updateEnhancerPos = (clientX: number) => {
    if (!enhancerContainerRef.current) return;
    const rect = enhancerContainerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const pct = Math.max(8, Math.min(92, (x / rect.width) * 100));
    setEnhancerSplit(pct);
  };

  return (
    <div className="w-full h-full flex flex-col gap-4 select-none">
      {/* Studio Banner Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-white/[0.08]">
        <div className="flex items-center gap-2.5">
          <div className="w-2 h-2 rounded-full bg-[#5EC4BA] animate-pulse" />
          <h2 className="text-sm font-medium text-white tracking-tight">
            Handy Studio <span className="text-[#8FA3AB] font-normal">· All 5 Tools Live in Browser Memory</span>
          </h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#8FA3AB]">
          <span className="font-mono text-[#5EC4BA] bg-[#5EC4BA]/10 px-2 py-0.5 rounded border border-[#5EC4BA]/20">
            100% Client-Side WASM
          </span>
          <span className="hidden md:inline">· No Servers · Zero Data Uploaded</span>
        </div>
      </div>

      {/* 5-Tool Demonstration Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 flex-1">
        
        {/* CARD 1: Universal Image Converter */}
        <div className="group rounded-[14px] bg-[#070D12] border border-white/[0.08] hover:border-[#5EC4BA]/40 p-3.5 flex flex-col justify-between transition-all duration-200 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <FormatConverterIcon size={14} hue="#5EC4BA" isHovered={false} />
              <span className="text-xs font-medium text-white">Universal Format Converter</span>
            </div>
            <button
              onClick={() => onSelectTab(1)}
              className="text-[11px] text-[#5EC4BA] hover:underline"
            >
              Focus demo
            </button>
          </div>

          {/* Interactive Format Selector */}
          <div className="my-2.5 flex flex-col gap-2">
            <div className="relative h-24 rounded-lg overflow-hidden border border-white/10 bg-[#05090D]">
              <img
                src="/assets/tools/demo-format.jpg"
                alt="Sample photo format conversion preview"
                className="w-full h-full object-cover opacity-75"
              />
              <div className="absolute top-2 right-2 bg-[#05090D]/85 backdrop-blur-md px-2 py-0.5 rounded text-[11px] font-mono text-[#5EC4BA] border border-[#5EC4BA]/30">
                .{FORMAT_OPTIONS[selectedFormat].ext.toLowerCase()} · {FORMAT_OPTIONS[selectedFormat].reduction}
              </div>
              <div className="absolute bottom-1.5 left-2 text-[10px] text-white/60 font-mono">
                Canvas & WASM transcode
              </div>
            </div>

            {/* Format choice pills */}
            <div className="flex items-center justify-between gap-1 p-1 bg-[#05090D] rounded-md border border-white/[0.06]">
              {FORMAT_OPTIONS.map((fmt, idx) => (
                <button
                  key={fmt.ext}
                  onClick={() => setSelectedFormat(idx)}
                  className={`flex-1 py-1 text-[11px] font-mono rounded transition-colors ${
                    selectedFormat === idx
                      ? 'bg-[#5EC4BA] text-[#05090D] font-medium'
                      : 'text-[#8FA3AB] hover:text-white'
                  }`}
                >
                  {fmt.ext}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-white/[0.05]">
            <span className="text-[11px] text-[#8FA3AB]">Batch & Single</span>
            <button
              onClick={() => navigateTo('/image-converter')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#5EC4BA] hover:text-white transition-colors"
            >
              <span>Open converter</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* CARD 2: Quality Enhancer (Draggable Before/After) */}
        <div className="group rounded-[14px] bg-[#070D12] border border-white/[0.08] hover:border-[#E6B866]/40 p-3.5 flex flex-col justify-between transition-all duration-200 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <QualityEnhancerIcon size={14} hue="#E6B866" isHovered={false} />
              <span className="text-xs font-medium text-white">Image Quality Enhancer</span>
            </div>
            <button
              onClick={() => onSelectTab(2)}
              className="text-[11px] text-[#E6B866] hover:underline"
            >
              Focus demo
            </button>
          </div>

          {/* Draggable Split Preview */}
          <div className="my-2.5 flex flex-col gap-1.5">
            <div
              ref={enhancerContainerRef}
              onPointerDown={handleEnhancerPointerDown}
              onPointerMove={handleEnhancerPointerMove}
              onPointerUp={handleEnhancerPointerUp}
              onPointerCancel={handleEnhancerPointerUp}
              className="relative h-28 rounded-lg overflow-hidden border border-white/10 bg-[#05090D] cursor-ew-resize touch-none select-none"
            >
              {/* After: Sharpened image */}
              <img
                src="/assets/tools/demo-enhance-after.jpg"
                alt="Enhanced photo"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute top-1.5 right-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-[#E6B866]">
                Sharpened
              </div>

              {/* Before: Soft image clipped */}
              <div
                className="absolute inset-y-0 left-0 overflow-hidden"
                style={{ width: `${enhancerSplit}%` }}
              >
                <img
                  src="/assets/tools/demo-enhance-before.jpg"
                  alt="Original soft photo"
                  className="absolute inset-y-0 left-0 h-full object-cover max-w-none"
                  style={{
                    width: enhancerContainerRef.current
                      ? `${enhancerContainerRef.current.clientWidth}px`
                      : '320px',
                  }}
                />
                <div className="absolute top-1.5 left-2 bg-black/60 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-white/70">
                  Original
                </div>
              </div>

              {/* Split Line & Handle */}
              <div
                className="absolute inset-y-0 w-0.5 bg-white shadow-[0_0_8px_rgba(0,0,0,0.8)]"
                style={{ left: `${enhancerSplit}%` }}
              >
                <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-white text-black text-[9px] flex items-center justify-center shadow-md">
                  ↔
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between text-[10px] text-[#8FA3AB]">
              <span>Drag handle left/right</span>
              <span className="font-mono text-[#E6B866]">+180% Micro-contrast</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-white/[0.05]">
            <span className="text-[11px] text-[#8FA3AB]">Bilateral Filter</span>
            <button
              onClick={() => navigateTo('/image-enhancer')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#E6B866] hover:text-white transition-colors"
            >
              <span>Open enhancer</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* CARD 3: Background Remover (Cutout vs Original) */}
        <div className="group rounded-[14px] bg-[#070D12] border border-white/[0.08] hover:border-[#A08BF5]/40 p-3.5 flex flex-col justify-between transition-all duration-200 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <BackgroundRemoverIcon size={14} hue="#A08BF5" isHovered={false} />
              <span className="text-xs font-medium text-white">AI Background Remover</span>
            </div>
            <button
              onClick={() => onSelectTab(3)}
              className="text-[11px] text-[#A08BF5] hover:underline"
            >
              Focus demo
            </button>
          </div>

          {/* Cutout / Original Toggle Stage */}
          <div className="my-2.5 flex flex-col gap-1.5">
            <div className="relative h-28 rounded-lg overflow-hidden border border-white/10 bg-[#05090D] flex items-center justify-center">
              {/* Checkerboard when cutout is selected */}
              {bgMode === 'cutout' && (
                <div
                  className="absolute inset-0 opacity-40"
                  style={{
                    backgroundImage:
                      'linear-gradient(45deg, #1A242D 25%, transparent 25%), linear-gradient(-45deg, #1A242D 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1A242D 75%), linear-gradient(-45deg, transparent 75%, #1A242D 75%)',
                    backgroundSize: '16px 16px',
                    backgroundPosition: '0 0, 0 8px, 8px -8px, -8px 0px',
                  }}
                />
              )}

              <img
                src={bgMode === 'cutout' ? '/assets/tools/demo-bg-cutout.png' : '/assets/tools/demo-bg-original.jpg'}
                alt={bgMode === 'cutout' ? 'Cutout subject without background' : 'Original image'}
                className="relative z-10 max-h-full object-contain transition-opacity duration-300"
              />

              <div className="absolute bottom-1.5 right-2 bg-black/70 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-[#A08BF5]">
                {bgMode === 'cutout' ? 'Alpha Cutout' : 'Original Photo'}
              </div>
            </div>

            {/* Toggle switch */}
            <div className="flex items-center gap-1 p-0.5 bg-[#05090D] rounded-md border border-white/[0.06]">
              <button
                onClick={() => setBgMode('cutout')}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                  bgMode === 'cutout'
                    ? 'bg-[#A08BF5] text-[#05090D]'
                    : 'text-[#8FA3AB] hover:text-white'
                }`}
              >
                Cutout (Transparent)
              </button>
              <button
                onClick={() => setBgMode('original')}
                className={`flex-1 py-1 text-[11px] font-medium rounded transition-colors ${
                  bgMode === 'original'
                    ? 'bg-white/20 text-white'
                    : 'text-[#8FA3AB] hover:text-white'
                }`}
              >
                Original
              </button>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-white/[0.05]">
            <span className="text-[11px] text-[#8FA3AB]">Neural Edge Detection</span>
            <button
              onClick={() => navigateTo('/background-remover')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#A08BF5] hover:text-white transition-colors"
            >
              <span>Open background remover</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* CARD 4: Universal Units & Quantities */}
        <div className="group rounded-[14px] bg-[#070D12] border border-white/[0.08] hover:border-[#6FA9F5]/40 p-3.5 flex flex-col justify-between transition-all duration-200 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <UnitsQuantitiesIcon size={14} hue="#6FA9F5" isHovered={false} />
              <span className="text-xs font-medium text-white">Universal Units & Quantities</span>
            </div>
            <button
              onClick={() => onSelectTab(4)}
              className="text-[11px] text-[#6FA9F5] hover:underline"
            >
              Focus demo
            </button>
          </div>

          {/* Interactive Unit Engine */}
          <div className="my-2.5 flex flex-col gap-2">
            {/* Category selection */}
            <div className="flex items-center gap-1 p-0.5 bg-[#05090D] rounded-md border border-white/[0.06]">
              {(['length', 'weight', 'temp'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleUnitCategoryChange(cat)}
                  className={`flex-1 py-0.5 text-[10px] font-medium rounded capitalize transition-colors ${
                    unitCategory === cat
                      ? 'bg-[#6FA9F5] text-[#05090D]'
                      : 'text-[#8FA3AB] hover:text-white'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Input & Output */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-[#05090D] rounded border border-white/10 px-2 py-1">
                <input
                  type="number"
                  value={unitVal}
                  onChange={(e) => setUnitVal(e.target.value)}
                  className="w-full bg-transparent text-xs text-white font-mono focus:outline-none"
                />
                <span className="text-[11px] font-mono text-[#6FA9F5] uppercase shrink-0">
                  {unitFrom}
                </span>
              </div>

              <button
                onClick={handleUnitSwap}
                className="w-7 h-7 rounded bg-white/[0.06] hover:bg-white/[0.12] text-xs text-[#6FA9F5] flex items-center justify-center shrink-0 transition-colors"
                title="Swap units"
              >
                ⇄
              </button>

              <div className="flex-1 flex items-center justify-between bg-[#05090D] rounded border border-white/10 px-2 py-1">
                <span className="text-xs font-mono text-white truncate tnum">
                  {unitConversionResult}
                </span>
                <span className="text-[11px] font-mono text-[#8FA3AB] uppercase shrink-0">
                  {unitTo}
                </span>
              </div>
            </div>

            <button
              onClick={handleCopyUnit}
              className="w-full py-1 rounded bg-white/[0.04] hover:bg-white/[0.08] text-[10px] font-mono text-[#8FA3AB] hover:text-white flex items-center justify-center gap-1 transition-colors"
            >
              <span>{copiedUnit ? '✓ Copied to clipboard' : 'Copy result'}</span>
            </button>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-white/[0.05]">
            <span className="text-[11px] text-[#8FA3AB]">High Precision Math</span>
            <button
              onClick={() => navigateTo('/units-converter')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#6FA9F5] hover:text-white transition-colors"
            >
              <span>Open units converter</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* CARD 5: Body Mass Index (BMI) */}
        <div className="group rounded-[14px] bg-[#070D12] border border-white/[0.08] hover:border-[#6FD49A]/40 p-3.5 flex flex-col justify-between transition-all duration-200 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-white/[0.05]">
            <div className="flex items-center gap-2">
              <BmiCalculatorIcon size={14} hue="#6FD49A" isHovered={false} />
              <span className="text-xs font-medium text-white">Body Mass Index Calculator</span>
            </div>
            <button
              onClick={() => onSelectTab(5)}
              className="text-[11px] text-[#6FD49A] hover:underline"
            >
              Focus demo
            </button>
          </div>

          {/* Interactive Gauge & Controls */}
          <div className="my-2 flex items-center gap-3">
            {/* Semicircle Gauge SVG */}
            <div className="relative w-24 h-16 shrink-0 flex items-end justify-center">
              <svg viewBox="0 0 100 55" className="w-full h-full overflow-visible">
                <path
                  d="M 10 50 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#162029"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
                <path
                  d="M 10 50 A 40 40 0 0 1 30 22"
                  fill="none"
                  stroke="#6FA9F5"
                  strokeWidth="8"
                />
                <path
                  d="M 30 22 A 40 40 0 0 1 70 22"
                  fill="none"
                  stroke="#6FD49A"
                  strokeWidth="8"
                />
                <path
                  d="M 70 22 A 40 40 0 0 1 90 50"
                  fill="none"
                  stroke="#F5A623"
                  strokeWidth="8"
                />
                <g transform="translate(50, 50)">
                  <line
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="-34"
                    stroke="#FFFFFF"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    transform={`rotate(${needleAngle})`}
                    style={{ transition: 'transform 0.4s ease-out' }}
                  />
                  <circle cx="0" cy="0" r="3.5" fill="#FFFFFF" />
                </g>
              </svg>
              <div className="absolute bottom-0 text-[11px] font-mono font-medium text-[#6FD49A] tnum">
                {bmiVal.toFixed(1)}
              </div>
            </div>

            {/* Live Slider inputs */}
            <div className="flex-1 flex flex-col gap-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="text-[#8FA3AB]">Height</span>
                <span className="font-mono text-white tnum">{bmiHeight} cm</span>
              </div>
              <input
                type="range"
                min="140"
                max="210"
                value={bmiHeight}
                onChange={(e) => setBmiHeight(e.target.value)}
                className="w-full h-1 bg-[#162029] rounded accent-[#6FD49A] cursor-pointer"
              />

              <div className="flex items-center justify-between mt-1">
                <span className="text-[#8FA3AB]">Weight</span>
                <span className="font-mono text-white tnum">{bmiWeight} kg</span>
              </div>
              <input
                type="range"
                min="40"
                max="140"
                value={bmiWeight}
                onChange={(e) => setBmiWeight(e.target.value)}
                className="w-full h-1 bg-[#162029] rounded accent-[#6FD49A] cursor-pointer"
              />
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-white/[0.05]">
            <span className="text-[11px] font-mono text-[#6FD49A]">
              {bmiResult.whoCategory || 'Normal range'}
            </span>
            <button
              onClick={() => navigateTo('/bmi-calculator')}
              className="inline-flex items-center gap-1 text-xs font-medium text-[#6FD49A] hover:text-white transition-colors"
            >
              <span>Open BMI calculator</span>
              <span>→</span>
            </button>
          </div>
        </div>

        {/* CARD 6 / Studio Capabilities Card */}
        <div className="rounded-[14px] bg-gradient-to-br from-[#09151F] to-[#05090D] border border-white/[0.08] p-3.5 flex flex-col justify-between shadow-md">
          <div className="flex items-center gap-2 pb-2 border-b border-white/[0.05]">
            <span className="text-xs font-medium text-white">Browser Security Architecture</span>
          </div>

          <div className="my-2 flex flex-col gap-2 text-xs text-[#8FA3AB]">
            <div className="flex items-start gap-2">
              <span className="text-[#5EC4BA]">✓</span>
              <span>Files processed purely in Web Worker & WASM memory</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#5EC4BA]">✓</span>
              <span>Zero server latency — instant drag-and-drop response</span>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-[#5EC4BA]">✓</span>
              <span>Never leaves your machine — 100% private</span>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between border-t border-white/[0.05]">
            <span className="text-[11px] font-mono text-[#5EC4BA]">5 Active Tools</span>
            <span className="text-[11px] text-[#8FA3AB]">Press 1-5 to inspect</span>
          </div>
        </div>

      </div>
    </div>
  );
};
