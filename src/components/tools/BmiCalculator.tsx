import React, { useState, useMemo } from 'react';
import { calculateBmi, BmiCalculationInput } from '../../utils/bmi';

export const BmiCalculator: React.FC = () => {
  const [unitSystem, setUnitSystem] = useState<'metric' | 'imperial'>('metric');
  const [age, setAge] = useState<string>('28');
  const [heightCm, setHeightCm] = useState<string>('175');
  const [heightFeet, setHeightFeet] = useState<string>('5');
  const [heightInches, setHeightInches] = useState<string>('9');
  const [weightKg, setWeightKg] = useState<string>('70');
  const [weightLb, setWeightLb] = useState<string>('154');

  const calculationInput: BmiCalculationInput = useMemo(() => {
    return {
      unitSystem,
      age: age ? parseInt(age, 10) : undefined,
      heightCm: unitSystem === 'metric' ? (heightCm ? parseFloat(heightCm) : undefined) : undefined,
      heightFeet: unitSystem === 'imperial' ? (heightFeet ? parseFloat(heightFeet) : undefined) : undefined,
      heightInches: unitSystem === 'imperial' ? (heightInches ? parseFloat(heightInches) : undefined) : undefined,
      weightKg: unitSystem === 'metric' ? (weightKg ? parseFloat(weightKg) : undefined) : undefined,
      weightLb: unitSystem === 'imperial' ? (weightLb ? parseFloat(weightLb) : undefined) : undefined,
    };
  }, [unitSystem, age, heightCm, heightFeet, heightInches, weightKg, weightLb]);

  const result = useMemo(() => {
    return calculateBmi(calculationInput);
  }, [calculationInput]);

  // Healthy Weight Range Calculation for user's height
  const healthyWeight = useMemo(() => {
    if (!result.metricHeightM) return null;
    const h2 = result.metricHeightM * result.metricHeightM;
    const minKg = 18.5 * h2;
    const maxKg = 24.9 * h2;

    if (unitSystem === 'metric') {
      return `${minKg.toFixed(1)} kg – ${maxKg.toFixed(1)} kg`;
    } else {
      const minLb = minKg * 2.20462;
      const maxLb = maxKg * 2.20462;
      return `${minLb.toFixed(1)} lb – ${maxLb.toFixed(1)} lb`;
    }
  }, [result.metricHeightM, unitSystem]);

  // Marker percent on the BMI bar (range 15 to 40)
  const markerPercent = useMemo(() => {
    if (!result.bmi) return 50;
    const clamped = Math.max(15, Math.min(40, result.bmi));
    return ((clamped - 15) / (40 - 15)) * 100;
  }, [result.bmi]);

  return (
    <div className="w-full">
      {/* Title & Introduction */}
      <div className="mb-10">
        <h1 className="text-[36px] sm:text-[44px] font-normal text-[#EAF2F4] tracking-tight leading-tight">
          BMI Calculator
        </h1>
        <p className="mt-3 text-[17px] text-[#8FA3AB] max-w-3xl leading-relaxed">
          Clinical body mass index screening conforming to official WHO adult cutoffs and CDC pediatric growth guidance. Calculated instantly in local memory.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Form (7 cols) */}
        <div className="lg:col-span-7 p-8 sm:p-10 rounded-[10px] bg-[#0A1218] border border-[rgba(255,255,255,0.08)] space-y-6">
          {/* Unit System Toggle */}
          <div className="flex items-center gap-1.5 p-1 bg-[#0F1A22] border border-[rgba(255,255,255,0.08)] rounded-[10px] w-fit">
            <button
              type="button"
              onClick={() => setUnitSystem('metric')}
              className={`h-9 px-4 text-xs font-medium rounded-[8px] transition-colors ${
                unitSystem === 'metric'
                  ? 'bg-[#5EC4BA] text-[#05090D]'
                  : 'text-[#8FA3AB] hover:text-[#EAF2F4]'
              }`}
            >
              Metric (cm, kg)
            </button>
            <button
              type="button"
              onClick={() => setUnitSystem('imperial')}
              className={`h-9 px-4 text-xs font-medium rounded-[8px] transition-colors ${
                unitSystem === 'imperial'
                  ? 'bg-[#5EC4BA] text-[#05090D]'
                  : 'text-[#8FA3AB] hover:text-[#EAF2F4]'
              }`}
            >
              Imperial (ft / in, lb)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Age */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-[#8FA3AB] font-medium">
                Age (years)
              </label>
              <input
                type="number"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full h-12 px-4 bg-[#0F1A22] border border-[rgba(255,255,255,0.12)] text-[#EAF2F4] text-base font-mono rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#5EC4BA]"
                placeholder="28"
              />
              {result.errors.age && (
                <p className="text-xs text-[#ad5f5a]">{result.errors.age}</p>
              )}
            </div>

            {/* Height */}
            {unitSystem === 'metric' ? (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-[#8FA3AB] font-medium">
                  Height (cm)
                </label>
                <input
                  type="number"
                  min="40"
                  max="270"
                  step="0.5"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full h-12 px-4 bg-[#0F1A22] border border-[rgba(255,255,255,0.12)] text-[#EAF2F4] text-base font-mono rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#5EC4BA]"
                  placeholder="175"
                />
                {result.errors.height && (
                  <p className="text-xs text-[#ad5f5a]">{result.errors.height}</p>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-[#8FA3AB] font-medium">
                  Height (feet & inches)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={heightFeet}
                    onChange={(e) => setHeightFeet(e.target.value)}
                    className="w-full h-12 px-3 bg-[#0F1A22] border border-[rgba(255,255,255,0.12)] text-[#EAF2F4] text-base font-mono rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#5EC4BA]"
                    placeholder="ft"
                  />
                  <input
                    type="number"
                    min="0"
                    max="11"
                    step="0.5"
                    value={heightInches}
                    onChange={(e) => setHeightInches(e.target.value)}
                    className="w-full h-12 px-3 bg-[#0F1A22] border border-[rgba(255,255,255,0.12)] text-[#EAF2F4] text-base font-mono rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#5EC4BA]"
                    placeholder="in"
                  />
                </div>
                {result.errors.height && (
                  <p className="text-xs text-[#ad5f5a]">{result.errors.height}</p>
                )}
              </div>
            )}

            {/* Weight */}
            <div className="space-y-2 sm:col-span-2">
              <label className="text-xs uppercase tracking-wider text-[#8FA3AB] font-medium">
                Weight ({unitSystem === 'metric' ? 'kg' : 'lb'})
              </label>
              <input
                type="number"
                min="2"
                max="500"
                step="0.1"
                value={unitSystem === 'metric' ? weightKg : weightLb}
                onChange={(e) =>
                  unitSystem === 'metric'
                    ? setWeightKg(e.target.value)
                    : setWeightLb(e.target.value)
                }
                className="w-full h-12 px-4 bg-[#0F1A22] border border-[rgba(255,255,255,0.12)] text-[#EAF2F4] text-base font-mono rounded-[10px] focus:outline-none focus:ring-1 focus:ring-[#5EC4BA]"
                placeholder={unitSystem === 'metric' ? '70' : '154'}
              />
              {result.errors.weight && (
                <p className="text-xs text-[#ad5f5a]">{result.errors.weight}</p>
              )}
            </div>
          </div>

          {/* Pediatric Notice if Age < 20 */}
          {result.isPediatricOrTeen && (
            <div className="p-4 rounded-[10px] bg-[#5EC4BA]/10 border border-[#5EC4BA]/20 text-xs text-[#EAF2F4] space-y-1">
              <div className="font-medium text-[#5EC4BA]">Pediatric / Teen Advisory (Age &lt; 20)</div>
              <p className="text-[#8FA3AB] leading-relaxed">
                {result.notes}
              </p>
            </div>
          )}
        </div>

        {/* Right: Results & Spectrum Bar (5 cols) */}
        <div className="lg:col-span-5 p-8 sm:p-10 rounded-[10px] bg-[#0A1218] border border-[rgba(255,255,255,0.08)] space-y-6">
          <div>
            <div className="text-[12px] font-medium tracking-[0.08em] uppercase text-[#5EC4BA] mb-1">
              CLINICAL RESULT
            </div>
            <h2 className="text-[20px] font-normal text-[#EAF2F4]">
              Body Mass Index
            </h2>
          </div>

          {result.isValid && result.formattedBmi ? (
            <div className="space-y-6">
              {/* Giant BMI Score */}
              <div className="flex items-baseline gap-3">
                <span className="text-[52px] font-normal font-mono text-[#5EC4BA] tracking-tight leading-none">
                  {result.formattedBmi}
                </span>
                <span className="text-sm font-mono text-[#8FA3AB]">
                  kg/m²
                </span>
              </div>

              {/* WHO Classification */}
              {!result.isPediatricOrTeen && result.whoCategory && (
                <div className="p-3.5 rounded-[8px] bg-[#0F1A22] border border-[rgba(255,255,255,0.08)]">
                  <div className="text-xs uppercase text-[#8FA3AB] tracking-wider mb-0.5">
                    WHO Classification
                  </div>
                  <div className="text-lg font-medium text-white">
                    {result.whoCategory}
                    {result.obesityClass ? ` (${result.obesityClass})` : ''}
                  </div>
                </div>
              )}

              {/* Visual Spectrum Bar (15 to 40) */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[11px] font-mono text-[#8FA3AB]">
                  <span>15.0</span>
                  <span className="text-blue-400">18.5</span>
                  <span className="text-[#5EC4BA]">24.9</span>
                  <span className="text-amber-400">29.9</span>
                  <span className="text-rose-400">40.0</span>
                </div>

                <div className="relative w-full h-3 rounded-full overflow-hidden flex">
                  <div className="w-[14%] bg-blue-500/70" title="Underweight (< 18.5)" />
                  <div className="w-[25.6%] bg-[#5EC4BA]" title="Normal (18.5 - 24.9)" />
                  <div className="w-[20%] bg-amber-500/80" title="Overweight (25 - 29.9)" />
                  <div className="w-[40.4%] bg-rose-500/80" title="Obesity (≥ 30)" />

                  {/* Marker Pin */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_8px_white]"
                    style={{ left: `${markerPercent}%` }}
                  />
                </div>

                <div className="flex justify-between text-[10px] text-[#8FA3AB]/70 uppercase tracking-wider pt-0.5">
                  <span>Under</span>
                  <span>Normal</span>
                  <span>Over</span>
                  <span>Obese</span>
                </div>
              </div>

              {/* Healthy Weight Target */}
              {healthyWeight && (
                <div className="pt-4 border-t border-[rgba(255,255,255,0.08)] space-y-1">
                  <div className="text-xs uppercase tracking-wider text-[#8FA3AB]">
                    Healthy Weight Range for Height
                  </div>
                  <div className="text-sm font-mono text-[#5EC4BA]">
                    {healthyWeight}
                  </div>
                </div>
              )}

              {/* Equation breakdown */}
              {result.formulaExplanation && (
                <div className="pt-2 text-xs font-mono text-[#8FA3AB]/80">
                  {result.formulaExplanation}
                </div>
              )}
            </div>
          ) : (
            <div className="py-8 text-center text-[#8FA3AB] text-sm">
              Please enter valid age, height, and weight above to evaluate your BMI.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
