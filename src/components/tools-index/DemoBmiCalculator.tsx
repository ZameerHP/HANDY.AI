import React, { useState, useMemo } from 'react';
import { calculateBmi } from '../../utils/bmi';

interface DemoProps {
  isVisible: boolean;
  isHovered: boolean;
}

export const DemoBmiCalculator: React.FC<DemoProps> = () => {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [heightCm, setHeightCm] = useState<string>('178');
  const [weightKg, setWeightKg] = useState<string>('71');
  const [heightFt, setHeightFt] = useState<string>('5');
  const [heightIn, setHeightIn] = useState<string>('10');
  const [weightLb, setWeightLb] = useState<string>('156');

  // Compute live BMI with real module
  const bmiResult = useMemo(() => {
    if (unitSystem === 'metric') {
      return calculateBmi({
        unitSystem: 'metric',
        age: 30,
        heightCm: parseFloat(heightCm),
        weightKg: parseFloat(weightKg),
      });
    } else {
      return calculateBmi({
        unitSystem: 'imperial',
        age: 30,
        heightFeet: parseFloat(heightFt),
        heightInches: parseFloat(heightIn),
        weightLb: parseFloat(weightLb),
      });
    }
  }, [unitSystem, heightCm, weightKg, heightFt, heightIn, weightLb]);

  const bmiVal = bmiResult.isValid && bmiResult.bmi ? bmiResult.bmi : 22.4;

  // Calibrated needle angle:
  // BMI 15 = -90deg, BMI 22.4 = -23deg, BMI 25 = 0deg, BMI 30 = 45deg, BMI 35 = 90deg
  const needleAngle = useMemo(() => {
    const clamped = Math.max(14, Math.min(36, bmiVal));
    if (clamped <= 18.5) {
      // 14 to 18.5 -> -90deg to -45deg
      return -90 + ((clamped - 14) / 4.5) * 45;
    } else if (clamped <= 24.9) {
      // 18.5 to 24.9 -> -45deg to 0deg
      return -45 + ((clamped - 18.5) / 6.4) * 45;
    } else if (clamped <= 29.9) {
      // 24.9 to 29.9 -> 0deg to 45deg
      return 0 + ((clamped - 24.9) / 5.0) * 45;
    } else {
      // 29.9 to 36 -> 45deg to 90deg
      return 45 + ((clamped - 29.9) / 6.1) * 45;
    }
  }, [bmiVal]);

  const errorMessage = Object.values(bmiResult.errors)[0];

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center p-3 sm:p-5 select-none overflow-hidden">
      <div className="w-full max-w-[320px] sm:max-w-[360px] rounded-[16px] bg-[#0A1218] border border-white/10 shadow-[0_16px_40px_rgba(0,0,0,0.6)] p-3.5 sm:p-4 flex flex-col items-center gap-2.5">
        {/* Top bar with System switch */}
        <div className="w-full flex items-center justify-between pb-1.5 border-b border-white/[0.06]">
          <div className="flex items-center gap-1.5 text-xs text-[#6FD49A] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-[#6FD49A]" />
            <span>WHO Adult Standard</span>
          </div>

          <div className="flex items-center p-0.5 rounded-full bg-[#05090D] border border-white/10 text-[11px]">
            <button
              type="button"
              onClick={() => setUnitSystem('metric')}
              className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                unitSystem === 'metric'
                  ? 'bg-[#6FD49A]/20 text-[#6FD49A] font-medium'
                  : 'text-[#8FA3AB] hover:text-white'
              }`}
            >
              cm / kg
            </button>
            <button
              type="button"
              onClick={() => setUnitSystem('imperial')}
              className={`px-2 py-0.5 rounded-full transition-colors cursor-pointer ${
                unitSystem === 'imperial'
                  ? 'bg-[#6FD49A]/20 text-[#6FD49A] font-medium'
                  : 'text-[#8FA3AB] hover:text-white'
              }`}
            >
              ft / lb
            </button>
          </div>
        </div>

        {/* Live inputs */}
        <div className="w-full grid grid-cols-2 gap-2 text-left">
          {unitSystem === 'metric' ? (
            <>
              <div className="bg-[#05090D] p-2 rounded-[10px] border border-white/[0.08] focus-within:border-[#6FD49A]/50">
                <label className="block text-[10px] font-mono text-[#8FA3AB]">Height (cm)</label>
                <input
                  type="number"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-white focus:outline-none tnum"
                />
              </div>
              <div className="bg-[#05090D] p-2 rounded-[10px] border border-white/[0.08] focus-within:border-[#6FD49A]/50">
                <label className="block text-[10px] font-mono text-[#8FA3AB]">Weight (kg)</label>
                <input
                  type="number"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-white focus:outline-none tnum"
                />
              </div>
            </>
          ) : (
            <>
              <div className="bg-[#05090D] p-2 rounded-[10px] border border-white/[0.08] focus-within:border-[#6FD49A]/50 flex gap-1">
                <div className="flex-1">
                  <label className="block text-[10px] font-mono text-[#8FA3AB]">Ft</label>
                  <input
                    type="number"
                    value={heightFt}
                    onChange={(e) => setHeightFt(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-white focus:outline-none tnum"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-[10px] font-mono text-[#8FA3AB]">In</label>
                  <input
                    type="number"
                    value={heightIn}
                    onChange={(e) => setHeightIn(e.target.value)}
                    className="w-full bg-transparent text-sm font-medium text-white focus:outline-none tnum"
                  />
                </div>
              </div>
              <div className="bg-[#05090D] p-2 rounded-[10px] border border-white/[0.08] focus-within:border-[#6FD49A]/50">
                <label className="block text-[10px] font-mono text-[#8FA3AB]">Weight (lb)</label>
                <input
                  type="number"
                  value={weightLb}
                  onChange={(e) => setWeightLb(e.target.value)}
                  className="w-full bg-transparent text-sm font-medium text-white focus:outline-none tnum"
                />
              </div>
            </>
          )}
        </div>

        {/* Error notice if invalid */}
        {errorMessage ? (
          <div className="text-[11px] text-amber-400 font-mono w-full text-center truncate">
            {errorMessage}
          </div>
        ) : null}

        {/* Calibrated Semicircle Gauge SVG */}
        <div className="relative w-44 h-22 overflow-hidden flex items-end justify-center">
          <svg viewBox="0 0 200 110" className="w-full h-full overflow-visible" aria-hidden="true">
            {/* Arc Segment 1: Underweight */}
            <path
              d="M 20 100 A 80 80 0 0 1 43.4 43.4"
              fill="none"
              stroke="#6FD49A"
              strokeWidth="9"
              strokeOpacity="0.35"
              strokeLinecap="round"
            />
            {/* Arc Segment 2: Normal range */}
            <path
              d="M 45 42 A 80 80 0 0 1 100 20"
              fill="none"
              stroke="#6FD49A"
              strokeWidth="9"
              strokeOpacity="0.95"
            />
            {/* Arc Segment 3: Overweight */}
            <path
              d="M 100 20 A 80 80 0 0 1 155 42"
              fill="none"
              stroke="#E6B866"
              strokeWidth="9"
              strokeOpacity="0.75"
            />
            {/* Arc Segment 4: Obesity */}
            <path
              d="M 156.6 43.4 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#F27A7A"
              strokeWidth="9"
              strokeOpacity="0.6"
              strokeLinecap="round"
            />

            {/* Needle Pivot & Arm */}
            <g
              transform={`translate(100, 100) rotate(${needleAngle})`}
              style={{ transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            >
              <line x1="0" y1="0" x2="0" y2="-72" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
              <line x1="0" y1="-60" x2="0" y2="-72" stroke="#6FD49A" strokeWidth="3" strokeLinecap="round" />
              <circle cx="0" cy="0" r="6" fill="#0A1218" stroke="#FFFFFF" strokeWidth="2" />
            </g>
          </svg>
        </div>

        {/* Live Status Pill & Numbers */}
        <div className="flex flex-col items-center gap-0.5">
          <div className="flex items-center gap-2">
            <span className="text-[20px] font-semibold text-white tracking-tight tnum">
              {bmiResult.isValid && bmiResult.formattedBmi ? bmiResult.formattedBmi : '—'}
            </span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#6FD49A]/20 text-[#6FD49A] border border-[#6FD49A]/30">
              {bmiResult.isValid ? bmiResult.whoCategory : 'Invalid Input'}
            </span>
          </div>

          {/* Mandatory WHO line */}
          <p className="text-[10px] text-[#8FA3AB] italic text-center mt-0.5">
            A screening measure, not a diagnosis.
          </p>
        </div>
      </div>
    </div>
  );
};
