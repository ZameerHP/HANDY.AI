import React, { useState, useMemo } from 'react';
import {
  UNIT_CATEGORIES,
  convertUnit,
  convertColor,
  convertNumberBase,
} from '../../utils/units';

export const UnitsConverter: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('length');
  const [fromUnit, setFromUnit] = useState<string>('km');
  const [toUnit, setToUnit] = useState<string>('m');
  const [fromValue, setFromValue] = useState<string>('1');
  const [dpi, setDpi] = useState<number>(96);
  const [copied, setCopied] = useState<boolean>(false);

  // Custom Category States
  const [colorInput, setColorInput] = useState<string>('#5EC4BA');
  const [baseInput, setBaseInput] = useState<string>('255');
  const [baseFrom, setBaseFrom] = useState<2 | 8 | 10 | 16>(10);

  const currentCategory = useMemo(() => {
    return UNIT_CATEGORIES.find((c) => c.id === selectedCategory) || UNIT_CATEGORIES[0];
  }, [selectedCategory]);

  const handleCategoryChange = (catId: string) => {
    setSelectedCategory(catId);
    const cat = UNIT_CATEGORIES.find((c) => c.id === catId);
    if (cat && cat.units.length >= 2) {
      setFromUnit(cat.units[0].id);
      setToUnit(cat.units[1].id);
    }
  };

  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  // Forward conversion result
  const conversionResult = useMemo(() => {
    if (selectedCategory === 'color' || selectedCategory === 'number_systems') {
      return null;
    }
    const num = parseFloat(fromValue);
    if (isNaN(num)) return null;

    try {
      return convertUnit(selectedCategory, fromUnit, toUnit, num, { dpi });
    } catch {
      return null;
    }
  }, [selectedCategory, fromUnit, toUnit, fromValue, dpi]);

  // Handle typing into "To" input for true bidirectional conversion
  const handleToValueChange = (valStr: string) => {
    const num = parseFloat(valStr);
    if (isNaN(num)) {
      setFromValue('');
      return;
    }
    try {
      const reverse = convertUnit(selectedCategory, toUnit, fromUnit, num, { dpi });
      setFromValue(reverse.value.toString());
    } catch {
      // Ignore
    }
  };

  // Color conversion
  const colorResult = useMemo(() => {
    if (selectedCategory !== 'color') return null;
    return convertColor(colorInput);
  }, [selectedCategory, colorInput]);

  // Number systems conversion
  const numberBaseResult = useMemo(() => {
    if (selectedCategory !== 'number_systems') return null;
    return convertNumberBase(baseInput, baseFrom);
  }, [selectedCategory, baseInput, baseFrom]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shortcuts = [
    { label: '1 km → m', cat: 'length', from: 'km', to: 'm', val: '1' },
    { label: '0 °C → °F', cat: 'temperature', from: 'C', to: 'F', val: '0' },
    { label: '100 km/h → mph', cat: 'speed', from: 'km_h', to: 'mph', val: '100' },
    { label: '8 L/100 km → mpg (US)', cat: 'fuel_economy', from: 'l_100km', to: 'mpg_us', val: '8' },
    { label: '1 KiB → Bytes', cat: 'data', from: 'kib', to: 'byte', val: '1' },
    { label: '1 Cup (US) → mL', cat: 'cooking', from: 'cup_us', to: 'ml_metric', val: '1' },
  ];

  return (
    <div className="w-full">
      {/* Title & Introduction */}
      <div className="mb-10">
        <h1 className="text-[36px] sm:text-[44px] font-normal text-[#EAF2F4] tracking-tight leading-tight">
          Universal Units and Quantities Converter
        </h1>
        <p className="mt-3 text-[17px] text-[#8FA3AB] max-w-3xl leading-relaxed">
          Arbitrary-precision bidirectional conversions across 19 categories. Supports reciprocal fuel curves, affine temperature scales, typography at custom DPI, and pure client math.
        </p>
      </div>

      {/* Category Pills */}
      <div className="space-y-4 mb-8">
        <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-[#0A1218] border border-[rgba(255,255,255,0.08)] rounded-[10px]">
          {UNIT_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#5EC4BA] text-[#05090D]'
                  : 'text-[#8FA3AB] hover:text-[#EAF2F4] hover:bg-white/[0.03]'
              }`}
            >
              {cat.name}
            </button>
          ))}
          <button
            onClick={() => setSelectedCategory('color')}
            className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-colors ${
              selectedCategory === 'color'
                ? 'bg-[#5EC4BA] text-[#05090D]'
                : 'text-[#8FA3AB] hover:text-[#EAF2F4] hover:bg-white/[0.03]'
            }`}
          >
            Color (HEX/RGB/HSL)
          </button>
          <button
            onClick={() => setSelectedCategory('number_systems')}
            className={`px-3 py-1.5 text-xs font-medium rounded-[8px] transition-colors ${
              selectedCategory === 'number_systems'
                ? 'bg-[#5EC4BA] text-[#05090D]'
                : 'text-[#8FA3AB] hover:text-[#EAF2F4] hover:bg-white/[0.03]'
            }`}
          >
            Number Systems (BigInt)
          </button>
        </div>

        {/* Shortcuts */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-[#8FA3AB]">
          <span className="font-mono text-[#5EC4BA]">Shortcuts:</span>
          {shortcuts.map((s, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSelectedCategory(s.cat);
                setFromUnit(s.from);
                setToUnit(s.to);
                setFromValue(s.val);
              }}
              className="px-2.5 py-1 bg-[#0A1218] border border-[rgba(255,255,255,0.06)] hover:border-[#5EC4BA]/40 rounded-[6px] text-[#8FA3AB] hover:text-white transition-colors"
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Converter Card */}
      {selectedCategory !== 'color' && selectedCategory !== 'number_systems' && (
        <div className="p-8 sm:p-10 rounded-[10px] bg-[#0A1218] border border-[rgba(255,255,255,0.08)] space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-center">
            {/* From Input & Unit */}
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#8FA3AB] font-medium">
                From
              </label>
              <div className="space-y-3">
                <input
                  type="number"
                  value={fromValue}
                  onChange={(e) => setFromValue(e.target.value)}
                  placeholder="Enter value"
                  className="w-full h-12 px-4 bg-[#0F1A22] border border-[rgba(255,255,255,0.12)] text-[#EAF2F4] text-lg font-mono rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#5EC4BA]"
                />
                <select
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  className="w-full h-11 px-3 bg-[#0F1A22] border border-[rgba(255,255,255,0.12)] text-[#EAF2F4] text-sm rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#5EC4BA]"
                >
                  {currentCategory.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Swap Button (1 col) */}
            <div className="md:col-span-1 flex justify-center pt-6">
              <button
                type="button"
                onClick={swapUnits}
                title="Swap units"
                className="w-12 h-12 rounded-[10px] bg-[#0F1A22] border border-[rgba(255,255,255,0.08)] hover:border-[#5EC4BA]/50 text-[#8FA3AB] hover:text-[#5EC4BA] flex items-center justify-center transition-all duration-200"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.75">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </button>
            </div>

            {/* To Input & Unit */}
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#8FA3AB] font-medium">
                To (Bidirectional)
              </label>
              <div className="space-y-3">
                <input
                  type="number"
                  value={conversionResult ? conversionResult.value : ''}
                  onChange={(e) => handleToValueChange(e.target.value)}
                  placeholder="Result"
                  className="w-full h-12 px-4 bg-[#0F1A22] border border-[rgba(255,255,255,0.12)] text-[#5EC4BA] text-lg font-mono rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#5EC4BA]"
                />
                <select
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  className="w-full h-11 px-3 bg-[#0F1A22] border border-[rgba(255,255,255,0.12)] text-[#EAF2F4] text-sm rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#5EC4BA]"
                >
                  {currentCategory.units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.symbol})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Typography DPI override if typography category */}
          {selectedCategory === 'typography' && (
            <div className="p-4 rounded-[10px] bg-[#0F1A22] border border-[rgba(255,255,255,0.06)] flex items-center justify-between text-xs">
              <span className="text-[#8FA3AB]">Configurable Screen DPI:</span>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="30"
                  max="1200"
                  value={dpi}
                  onChange={(e) => setDpi(Number(e.target.value))}
                  className="w-20 h-8 px-2 bg-[#05090D] border border-white/20 rounded-[6px] text-white font-mono text-xs"
                />
                <span className="text-white/60">DPI</span>
              </div>
            </div>
          )}

          {/* Formula & Calculation Details */}
          {conversionResult && (
            <div className="pt-6 border-t border-[rgba(255,255,255,0.08)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="text-xs uppercase tracking-wider text-[#8FA3AB] font-medium">
                  Scientific Formula
                </div>
                <div className="text-sm font-mono text-[#EAF2F4]">
                  {conversionResult.formulaDescription}
                </div>
              </div>

              <button
                type="button"
                onClick={() => copyToClipboard(conversionResult.formatted)}
                className="inline-flex items-center gap-2 h-10 px-4 rounded-[10px] bg-[#0F1A22] border border-[rgba(255,255,255,0.08)] hover:border-[#5EC4BA]/40 text-[#EAF2F4] text-xs font-medium transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <span className="text-[#5EC4BA]">✓</span>
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                    </svg>
                    <span>Copy Result</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Color Converter View */}
      {selectedCategory === 'color' && colorResult && (
        <div className="p-8 sm:p-10 rounded-[10px] bg-[#0A1218] border border-[rgba(255,255,255,0.08)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-[rgba(255,255,255,0.08)]">
            <input
              type="color"
              value={colorResult.hex}
              onChange={(e) => setColorInput(e.target.value)}
              className="w-16 h-16 rounded-[10px] bg-transparent cursor-pointer border border-white/20"
            />
            <div className="space-y-1 flex-1">
              <label className="text-xs uppercase tracking-wider text-[#8FA3AB]">
                Color Input (Hex, rgb(r, g, b), or hsl(h, s%, l%))
              </label>
              <input
                type="text"
                value={colorInput}
                onChange={(e) => setColorInput(e.target.value)}
                className="w-full h-11 px-4 bg-[#0F1A22] border border-white/10 rounded-[10px] text-white font-mono text-base focus:outline-none focus:ring-1 focus:ring-[#5EC4BA]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 rounded-[10px] bg-[#0F1A22] border border-white/5 space-y-1">
              <div className="text-xs uppercase text-[#8FA3AB]">HEX</div>
              <div className="text-lg font-mono text-[#EAF2F4] select-all">{colorResult.hex}</div>
            </div>
            <div className="p-4 rounded-[10px] bg-[#0F1A22] border border-white/5 space-y-1">
              <div className="text-xs uppercase text-[#8FA3AB]">RGB</div>
              <div className="text-lg font-mono text-[#EAF2F4] select-all">{colorResult.rgb}</div>
            </div>
            <div className="p-4 rounded-[10px] bg-[#0F1A22] border border-white/5 space-y-1">
              <div className="text-xs uppercase text-[#8FA3AB]">HSL</div>
              <div className="text-lg font-mono text-[#EAF2F4] select-all">{colorResult.hsl}</div>
            </div>
            <div className="p-4 rounded-[10px] bg-[#0F1A22] border border-white/5 space-y-1">
              <div className="text-xs uppercase text-[#8FA3AB]">HSV</div>
              <div className="text-lg font-mono text-[#EAF2F4] select-all">{colorResult.hsv}</div>
            </div>
          </div>
        </div>
      )}

      {/* Number Systems Converter View */}
      {selectedCategory === 'number_systems' && (
        <div className="p-8 sm:p-10 rounded-[10px] bg-[#0A1218] border border-[rgba(255,255,255,0.08)] space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-3 space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#8FA3AB]">
                Input Value (Arbitrary Length BigInt)
              </label>
              <input
                type="text"
                value={baseInput}
                onChange={(e) => setBaseInput(e.target.value)}
                className="w-full h-11 px-4 bg-[#0F1A22] border border-white/10 rounded-[10px] text-white font-mono text-base focus:outline-none focus:ring-1 focus:ring-[#5EC4BA]"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#8FA3AB]">
                Source Base
              </label>
              <select
                value={baseFrom}
                onChange={(e) => setBaseFrom(Number(e.target.value) as any)}
                className="w-full h-11 px-3 bg-[#0F1A22] border border-white/10 rounded-[10px] text-white text-sm focus:outline-none focus:ring-1 focus:ring-[#5EC4BA]"
              >
                <option value={10}>Base 10 (Decimal)</option>
                <option value={16}>Base 16 (Hexadecimal)</option>
                <option value={2}>Base 2 (Binary)</option>
                <option value={8}>Base 8 (Octal)</option>
              </select>
            </div>
          </div>

          {numberBaseResult && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-[rgba(255,255,255,0.08)]">
              <div className="p-4 rounded-[10px] bg-[#0F1A22] border border-white/5 space-y-1">
                <div className="text-xs uppercase text-[#8FA3AB]">Decimal (Base 10)</div>
                <div className="text-base font-mono text-[#EAF2F4] break-all select-all">{numberBaseResult.decimal}</div>
              </div>
              <div className="p-4 rounded-[10px] bg-[#0F1A22] border border-white/5 space-y-1">
                <div className="text-xs uppercase text-[#8FA3AB]">Hexadecimal (Base 16)</div>
                <div className="text-base font-mono text-[#5EC4BA] break-all select-all">{numberBaseResult.hexadecimal}</div>
              </div>
              <div className="p-4 rounded-[10px] bg-[#0F1A22] border border-white/5 space-y-1 md:col-span-2">
                <div className="text-xs uppercase text-[#8FA3AB]">Binary (Base 2)</div>
                <div className="text-sm font-mono text-[#EAF2F4] break-all select-all max-h-32 overflow-y-auto">{numberBaseResult.binary}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
