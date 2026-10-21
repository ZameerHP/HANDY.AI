import React, { useState, useMemo } from 'react';
import { convertUnit } from '../../utils/units';

interface DemoProps {
  isVisible: boolean;
  isHovered: boolean;
}

const LENGTH_UNITS = [
  { id: 'km', label: 'km', name: 'Kilometers' },
  { id: 'm', label: 'm', name: 'Meters' },
  { id: 'cm', label: 'cm', name: 'Centimeters' },
  { id: 'mi', label: 'mi', name: 'Miles' },
];

export const DemoUnitsConverter: React.FC<DemoProps> = () => {
  const [val, setVal] = useState<string>('5');
  const [fromUnit, setFromUnit] = useState<string>('km');
  const [toUnit, setToUnit] = useState<string>('mi');
  const [copied, setCopied] = useState<boolean>(false);

  const numericVal = useMemo(() => {
    const parsed = parseFloat(val);
    return isNaN(parsed) ? 0 : parsed;
  }, [val]);

  const conversion = useMemo(() => {
    try {
      return convertUnit('length', fromUnit, toUnit, numericVal);
    } catch {
      return { value: 0, formatted: '0', isExact: true, formulaDescription: '' };
    }
  }, [fromUnit, toUnit, numericVal]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const handleCopy = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`${conversion.formatted} ${toUnit}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-3 sm:p-5 select-none overflow-hidden">
      <div className="w-full max-w-[320px] sm:max-w-[360px] rounded-[16px] bg-[#0A1218] border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.6)] p-4 flex flex-col gap-3">
        {/* Title Bar */}
        <div className="flex items-center justify-between text-xs pb-1 border-b border-white/[0.06]">
          <span className="font-mono text-[#6FA9F5] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6FA9F5]" />
            Live Length Engine
          </span>
          <span className="text-[11px] text-[#8FA3AB]">Local Memory</span>
        </div>

        {/* Input Row */}
        <div className="flex items-center gap-2 bg-[#05090D] p-2 rounded-[12px] border border-white/[0.08] focus-within:border-[#6FA9F5]/50 transition-colors">
          <input
            type="number"
            value={val}
            onChange={(e) => setVal(e.target.value)}
            className="w-full bg-transparent text-[18px] sm:text-[20px] font-medium text-white px-2 focus:outline-none tnum"
            placeholder="0"
          />
          <select
            value={fromUnit}
            onChange={(e) => setFromUnit(e.target.value)}
            className="bg-[#0A1218] text-xs font-medium text-[#6FA9F5] border border-white/10 rounded-[8px] px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#6FA9F5] cursor-pointer"
          >
            {LENGTH_UNITS.map((u) => (
              <option key={u.id} value={u.id} className="bg-[#0A1218] text-white">
                {u.label} ({u.name})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Action Bar */}
        <div className="flex items-center justify-between px-1">
          <div className="text-[11px] text-[#8FA3AB]">Converts to:</div>
          <button
            type="button"
            onClick={handleSwap}
            className="h-7 px-3 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-xs text-[#EAF2F4] border border-white/10 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Swap units"
          >
            <span>Swap</span>
            <span className="text-sm">⇄</span>
          </button>
        </div>

        {/* Output Display Row */}
        <div className="flex items-center justify-between gap-2 bg-[#05090D] p-2 rounded-[12px] border border-[#6FA9F5]/30">
          <div className="flex-1 px-2 overflow-hidden">
            <div
              aria-live="polite"
              className="text-[18px] sm:text-[20px] font-medium text-white truncate tnum"
            >
              {conversion.formatted}
            </div>
            <div className="text-[10px] text-[#8FA3AB] font-mono truncate">
              {conversion.formulaDescription || `${val} ${fromUnit} = ${conversion.formatted} ${toUnit}`}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <select
              value={toUnit}
              onChange={(e) => setToUnit(e.target.value)}
              className="bg-[#0A1218] text-xs font-medium text-[#6FA9F5] border border-white/10 rounded-[8px] px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#6FA9F5] cursor-pointer"
            >
              {LENGTH_UNITS.map((u) => (
                <option key={u.id} value={u.id} className="bg-[#0A1218] text-white">
                  {u.label}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleCopy}
              className={`h-8 px-2.5 rounded-[8px] text-xs font-medium border transition-colors flex items-center justify-center cursor-pointer ${
                copied
                  ? 'bg-[#6FD49A]/20 text-[#6FD49A] border-[#6FD49A]/40'
                  : 'bg-white/[0.06] text-[#8FA3AB] hover:text-white border-white/10'
              }`}
              title="Copy output"
            >
              {copied ? '✓' : 'Copy'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
