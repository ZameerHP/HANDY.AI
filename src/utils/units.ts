/**
 * Pure logic and unit definitions for the Universal Units and Quantities Converter.
 */

export interface UnitDefinition {
  id: string;
  name: string;
  symbol: string;
  ratioToBase: number; // For linear units: valueInBase = value * ratioToBase
  offset?: number;     // For affine units (e.g. Temperature): base = (val + offset) * factor
  standard?: string;   // US, UK, Metric, Decimal, Binary, etc.
}

export interface UnitCategory {
  id: string;
  name: string;
  baseUnit: string;
  isReciprocal?: boolean; // For fuel economy
  isAffine?: boolean;     // For temperature
  isCustom?: boolean;     // Color, number systems, typography
  units: UnitDefinition[];
}

export const UNIT_CATEGORIES: UnitCategory[] = [
  {
    id: 'length',
    name: 'Length',
    baseUnit: 'm',
    units: [
      { id: 'km', name: 'Kilometers', symbol: 'km', ratioToBase: 1000 },
      { id: 'm', name: 'Meters', symbol: 'm', ratioToBase: 1 },
      { id: 'cm', name: 'Centimeters', symbol: 'cm', ratioToBase: 0.01 },
      { id: 'mm', name: 'Millimeters', symbol: 'mm', ratioToBase: 0.001 },
      { id: 'um', name: 'Micrometers', symbol: 'µm', ratioToBase: 1e-6 },
      { id: 'nm', name: 'Nanometers', symbol: 'nm', ratioToBase: 1e-9 },
      { id: 'in', name: 'Inches', symbol: 'in', ratioToBase: 0.0254 },
      { id: 'ft', name: 'Feet', symbol: 'ft', ratioToBase: 0.3048 },
      { id: 'yd', name: 'Yards', symbol: 'yd', ratioToBase: 0.9144 },
      { id: 'mi', name: 'Miles', symbol: 'mi', ratioToBase: 1609.344 },
      { id: 'nmi', name: 'Nautical Miles', symbol: 'nmi', ratioToBase: 1852 },
    ],
  },
  {
    id: 'mass',
    name: 'Mass',
    baseUnit: 'kg',
    units: [
      { id: 't', name: 'Metric Tonnes', symbol: 't', ratioToBase: 1000 },
      { id: 'kg', name: 'Kilograms', symbol: 'kg', ratioToBase: 1 },
      { id: 'g', name: 'Grams', symbol: 'g', ratioToBase: 0.001 },
      { id: 'mg', name: 'Milligrams', symbol: 'mg', ratioToBase: 1e-6 },
      { id: 'ug', name: 'Micrograms', symbol: 'µg', ratioToBase: 1e-9 },
      { id: 'lb', name: 'Pounds', symbol: 'lb', ratioToBase: 0.45359237 },
      { id: 'oz', name: 'Ounces', symbol: 'oz', ratioToBase: 0.028349523125 },
      { id: 'st', name: 'Stone', symbol: 'st', ratioToBase: 6.35029318 },
    ],
  },
  {
    id: 'area',
    name: 'Area',
    baseUnit: 'm2',
    units: [
      { id: 'km2', name: 'Square Kilometers', symbol: 'km²', ratioToBase: 1e6 },
      { id: 'm2', name: 'Square Meters', symbol: 'm²', ratioToBase: 1 },
      { id: 'cm2', name: 'Square Centimeters', symbol: 'cm²', ratioToBase: 0.0001 },
      { id: 'ha', name: 'Hectares', symbol: 'ha', ratioToBase: 10000 },
      { id: 'ac', name: 'Acres', symbol: 'ac', ratioToBase: 4046.8564224 },
      { id: 'ft2', name: 'Square Feet', symbol: 'sq ft', ratioToBase: 0.09290304 },
      { id: 'yd2', name: 'Square Yards', symbol: 'sq yd', ratioToBase: 0.83612736 },
      { id: 'mi2', name: 'Square Miles', symbol: 'sq mi', ratioToBase: 2589988.110336 },
    ],
  },
  {
    id: 'volume',
    name: 'Volume',
    baseUnit: 'l',
    units: [
      { id: 'm3', name: 'Cubic Meters', symbol: 'm³', ratioToBase: 1000 },
      { id: 'l', name: 'Litres', symbol: 'L', ratioToBase: 1 },
      { id: 'ml', name: 'Millilitres', symbol: 'mL', ratioToBase: 0.001 },
      { id: 'cm3', name: 'Cubic Centimeters', symbol: 'cm³', ratioToBase: 0.001 },
      { id: 'gal_us', name: 'US Gallons', symbol: 'gal (US)', ratioToBase: 3.785411784, standard: 'US' },
      { id: 'gal_uk', name: 'Imperial Gallons', symbol: 'gal (UK)', ratioToBase: 4.54609, standard: 'UK' },
      { id: 'cup_us', name: 'Cups (US)', symbol: 'cup', ratioToBase: 0.2365882365, standard: 'US' },
      { id: 'tbsp_us', name: 'Tablespoons (US)', symbol: 'tbsp', ratioToBase: 0.01478676478125, standard: 'US' },
      { id: 'tsp_us', name: 'Teaspoons (US)', symbol: 'tsp', ratioToBase: 0.00492892159375, standard: 'US' },
    ],
  },
  {
    id: 'temperature',
    name: 'Temperature',
    baseUnit: 'C',
    isAffine: true,
    units: [
      { id: 'C', name: 'Celsius', symbol: '°C', ratioToBase: 1 },
      { id: 'F', name: 'Fahrenheit', symbol: '°F', ratioToBase: 1 },
      { id: 'K', name: 'Kelvin', symbol: 'K', ratioToBase: 1 },
    ],
  },
  {
    id: 'speed',
    name: 'Speed',
    baseUnit: 'm_s',
    units: [
      { id: 'km_h', name: 'Kilometers per hour', symbol: 'km/h', ratioToBase: 1 / 3.6 },
      { id: 'm_s', name: 'Meters per second', symbol: 'm/s', ratioToBase: 1 },
      { id: 'mph', name: 'Miles per hour', symbol: 'mph', ratioToBase: 0.44704 },
      { id: 'knot', name: 'Knots', symbol: 'kn', ratioToBase: 1852 / 3600 },
      { id: 'ft_s', name: 'Feet per second', symbol: 'ft/s', ratioToBase: 0.3048 },
    ],
  },
  {
    id: 'time',
    name: 'Time',
    baseUnit: 's',
    units: [
      { id: 'ms', name: 'Milliseconds', symbol: 'ms', ratioToBase: 0.001 },
      { id: 's', name: 'Seconds', symbol: 's', ratioToBase: 1 },
      { id: 'min', name: 'Minutes', symbol: 'min', ratioToBase: 60 },
      { id: 'h', name: 'Hours', symbol: 'h', ratioToBase: 3600 },
      { id: 'd', name: 'Days', symbol: 'd', ratioToBase: 86400 },
      { id: 'w', name: 'Weeks', symbol: 'wk', ratioToBase: 604800 },
      { id: 'y', name: 'Years (365.25 d)', symbol: 'yr', ratioToBase: 31557600 },
    ],
  },
  {
    id: 'data',
    name: 'Data Storage',
    baseUnit: 'byte',
    units: [
      { id: 'bit', name: 'Bits', symbol: 'b', ratioToBase: 0.125, standard: 'Raw' },
      { id: 'byte', name: 'Bytes', symbol: 'B', ratioToBase: 1, standard: 'Raw' },
      { id: 'kb', name: 'Kilobytes (Decimal 10³)', symbol: 'KB', ratioToBase: 1000, standard: 'Decimal' },
      { id: 'mb', name: 'Megabytes (Decimal 10⁶)', symbol: 'MB', ratioToBase: 1e6, standard: 'Decimal' },
      { id: 'gb', name: 'Gigabytes (Decimal 10⁹)', symbol: 'GB', ratioToBase: 1e9, standard: 'Decimal' },
      { id: 'tb', name: 'Terabytes (Decimal 10¹²)', symbol: 'TB', ratioToBase: 1e12, standard: 'Decimal' },
      { id: 'kib', name: 'Kibibytes (Binary 2¹⁰)', symbol: 'KiB', ratioToBase: 1024, standard: 'Binary' },
      { id: 'mib', name: 'Mebibytes (Binary 2²⁰)', symbol: 'MiB', ratioToBase: 1048576, standard: 'Binary' },
      { id: 'gib', name: 'Gibibytes (Binary 2³⁰)', symbol: 'GiB', ratioToBase: 1073741824, standard: 'Binary' },
      { id: 'tib', name: 'Tebibytes (Binary 2⁴⁰)', symbol: 'TiB', ratioToBase: 1099511627776, standard: 'Binary' },
    ],
  },
  {
    id: 'pressure',
    name: 'Pressure',
    baseUnit: 'pa',
    units: [
      { id: 'pa', name: 'Pascals', symbol: 'Pa', ratioToBase: 1 },
      { id: 'kpa', name: 'Kilopascals', symbol: 'kPa', ratioToBase: 1000 },
      { id: 'bar', name: 'Bar', symbol: 'bar', ratioToBase: 100000 },
      { id: 'psi', name: 'Pounds per square inch', symbol: 'psi', ratioToBase: 6894.757293168 },
      { id: 'atm', name: 'Standard Atmospheres', symbol: 'atm', ratioToBase: 101325 },
      { id: 'mmhg', name: 'Millimeters of mercury', symbol: 'mmHg', ratioToBase: 133.322387415 },
    ],
  },
  {
    id: 'energy',
    name: 'Energy',
    baseUnit: 'j',
    units: [
      { id: 'j', name: 'Joules', symbol: 'J', ratioToBase: 1 },
      { id: 'kj', name: 'Kilojoules', symbol: 'kJ', ratioToBase: 1000 },
      { id: 'cal', name: 'Gram Calories', symbol: 'cal', ratioToBase: 4.184 },
      { id: 'kcal', name: 'Kilocalories (Dietary Cal)', symbol: 'kcal', ratioToBase: 4184 },
      { id: 'wh', name: 'Watt-hours', symbol: 'Wh', ratioToBase: 3600 },
      { id: 'kwh', name: 'Kilowatt-hours', symbol: 'kWh', ratioToBase: 3.6e6 },
      { id: 'ev', name: 'Electronvolts', symbol: 'eV', ratioToBase: 1.602176634e-19 },
    ],
  },
  {
    id: 'power',
    name: 'Power',
    baseUnit: 'w',
    units: [
      { id: 'w', name: 'Watts', symbol: 'W', ratioToBase: 1 },
      { id: 'kw', name: 'Kilowatts', symbol: 'kW', ratioToBase: 1000 },
      { id: 'mw', name: 'Megawatts', symbol: 'MW', ratioToBase: 1e6 },
      { id: 'hp', name: 'Mechanical Horsepower', symbol: 'hp', ratioToBase: 745.69987158227022 },
    ],
  },
  {
    id: 'force',
    name: 'Force',
    baseUnit: 'n',
    units: [
      { id: 'n', name: 'Newtons', symbol: 'N', ratioToBase: 1 },
      { id: 'kn', name: 'Kilonewtons', symbol: 'kN', ratioToBase: 1000 },
      { id: 'lbf', name: 'Pounds-force', symbol: 'lbf', ratioToBase: 4.4482216152605 },
    ],
  },
  {
    id: 'frequency',
    name: 'Frequency',
    baseUnit: 'hz',
    units: [
      { id: 'hz', name: 'Hertz', symbol: 'Hz', ratioToBase: 1 },
      { id: 'khz', name: 'Kilohertz', symbol: 'kHz', ratioToBase: 1000 },
      { id: 'mhz', name: 'Megahertz', symbol: 'MHz', ratioToBase: 1e6 },
      { id: 'ghz', name: 'Gigahertz', symbol: 'GHz', ratioToBase: 1e9 },
    ],
  },
  {
    id: 'angles',
    name: 'Angles',
    baseUnit: 'deg',
    units: [
      { id: 'deg', name: 'Degrees', symbol: '°', ratioToBase: 1 },
      { id: 'rad', name: 'Radians', symbol: 'rad', ratioToBase: 180 / Math.PI },
      { id: 'arcmin', name: 'Arcminutes', symbol: 'arcmin', ratioToBase: 1 / 60 },
      { id: 'arcsec', name: 'Arcseconds', symbol: 'arcsec', ratioToBase: 1 / 3600 },
    ],
  },
  {
    id: 'fuel_economy',
    name: 'Fuel Economy',
    baseUnit: 'l_100km',
    isReciprocal: true,
    units: [
      { id: 'l_100km', name: 'Litres per 100 km', symbol: 'L/100 km', ratioToBase: 1, standard: 'Consumption' },
      { id: 'km_l', name: 'Kilometers per Litre', symbol: 'km/L', ratioToBase: 100, standard: 'Distance/Vol' },
      { id: 'mpg_us', name: 'Miles per Gallon (US)', symbol: 'mpg (US)', ratioToBase: 235.214583, standard: 'US' },
      { id: 'mpg_uk', name: 'Miles per Gallon (UK)', symbol: 'mpg (UK)', ratioToBase: 282.4809363, standard: 'UK' },
    ],
  },
  {
    id: 'typography',
    name: 'Typography',
    baseUnit: 'pt',
    units: [
      { id: 'pt', name: 'Points (DTP)', symbol: 'pt', ratioToBase: 1 },
      { id: 'pica', name: 'Picas (12 pt)', symbol: 'pica', ratioToBase: 12 },
      { id: 'px', name: 'Pixels (at configured DPI)', symbol: 'px', ratioToBase: 72 / 96 }, // Default 96 DPI
      { id: 'mm', name: 'Millimeters', symbol: 'mm', ratioToBase: 72 / 25.4 },
      { id: 'in', name: 'Inches', symbol: 'in', ratioToBase: 72 },
    ],
  },
  {
    id: 'cooking',
    name: 'Cooking Measures',
    baseUnit: 'ml',
    units: [
      { id: 'tsp_metric', name: 'Metric Teaspoon (5 mL)', symbol: 'tsp (metric)', ratioToBase: 5, standard: 'Metric' },
      { id: 'tbsp_metric', name: 'Metric Tablespoon (15 mL)', symbol: 'tbsp (metric)', ratioToBase: 15, standard: 'Metric' },
      { id: 'cup_metric', name: 'Metric Cup (250 mL)', symbol: 'cup (metric)', ratioToBase: 250, standard: 'Metric' },
      { id: 'tsp_us', name: 'US Teaspoon (4.93 mL)', symbol: 'tsp (US)', ratioToBase: 4.92892159375, standard: 'US' },
      { id: 'tbsp_us', name: 'US Tablespoon (14.79 mL)', symbol: 'tbsp (US)', ratioToBase: 14.78676478125, standard: 'US' },
      { id: 'cup_us', name: 'US Cup (236.59 mL)', symbol: 'cup (US)', ratioToBase: 236.5882365, standard: 'US' },
      { id: 'fl_oz_us', name: 'US Fluid Ounce (29.57 mL)', symbol: 'fl oz (US)', ratioToBase: 29.5735295625, standard: 'US' },
      { id: 'fl_oz_uk', name: 'Imperial Fluid Ounce (28.41 mL)', symbol: 'fl oz (UK)', ratioToBase: 28.4130625, standard: 'UK' },
      { id: 'ml', name: 'Millilitres', symbol: 'mL', ratioToBase: 1, standard: 'Metric' },
    ],
  },
];

export interface ConversionResult {
  value: number;
  formatted: string;
  isExact: boolean;
  formulaDescription: string;
}

/**
 * Universal conversion function handling linear, affine (temperature), and reciprocal (fuel economy) systems.
 */
export function convertUnit(
  categoryId: string,
  fromUnitId: string,
  toUnitId: string,
  inputValue: number,
  options?: { dpi?: number }
): ConversionResult {
  if (isNaN(inputValue)) {
    return { value: NaN, formatted: '', isExact: false, formulaDescription: 'Invalid input' };
  }

  const category = UNIT_CATEGORIES.find((c) => c.id === categoryId);
  if (!category) {
    throw new Error(`Unknown category: ${categoryId}`);
  }

  // Same unit shortcut
  if (fromUnitId === toUnitId) {
    return {
      value: inputValue,
      formatted: formatPrecision(inputValue),
      isExact: true,
      formulaDescription: 'Identical unit (1:1)',
    };
  }

  // 1. Temperature (Affine)
  if (category.isAffine && categoryId === 'temperature') {
    return convertTemperature(fromUnitId, toUnitId, inputValue);
  }

  // 2. Fuel Economy (Reciprocals)
  if (category.isReciprocal && categoryId === 'fuel_economy') {
    return convertFuelEconomy(fromUnitId, toUnitId, inputValue);
  }

  // 3. Typography with dynamic DPI for pixels
  if (categoryId === 'typography') {
    const dpi = options?.dpi && options.dpi > 0 ? options.dpi : 96;
    return convertTypography(fromUnitId, toUnitId, inputValue, dpi);
  }

  // 4. Standard linear conversion
  const fromDef = category.units.find((u) => u.id === fromUnitId);
  const toDef = category.units.find((u) => u.id === toUnitId);

  if (!fromDef || !toDef) {
    throw new Error(`Unit not found in category ${categoryId}`);
  }

  const baseValue = inputValue * fromDef.ratioToBase;
  const resultValue = baseValue / toDef.ratioToBase;

  // Determine if conversion is exact
  const isExactRatio = Number.isInteger(fromDef.ratioToBase / toDef.ratioToBase) ||
    Number.isInteger(toDef.ratioToBase / fromDef.ratioToBase);

  return {
    value: resultValue,
    formatted: formatPrecision(resultValue),
    isExact: isExactRatio,
    formulaDescription: `${inputValue} × (${fromDef.ratioToBase} / ${toDef.ratioToBase})`,
  };
}

function convertTemperature(from: string, to: string, val: number): ConversionResult {
  let celsius = val;
  let formulaDesc = '';

  if (from === 'C') {
    celsius = val;
  } else if (from === 'F') {
    celsius = (val - 32) * (5 / 9);
    formulaDesc = `(${val} - 32) × 5/9`;
  } else if (from === 'K') {
    celsius = val - 273.15;
    formulaDesc = `${val} - 273.15`;
  }

  let result = celsius;
  if (to === 'C') {
    result = celsius;
  } else if (to === 'F') {
    result = celsius * (9 / 5) + 32;
    formulaDesc = from === 'C' ? `${val} × 9/5 + 32` : `${formulaDesc} -> × 9/5 + 32`;
  } else if (to === 'K') {
    result = celsius + 273.15;
    formulaDesc = from === 'C' ? `${val} + 273.15` : `${formulaDesc} -> + 273.15`;
  }

  return {
    value: result,
    formatted: formatPrecision(result),
    isExact: true,
    formulaDescription: formulaDesc || `${val} °C`,
  };
}

function convertFuelEconomy(from: string, to: string, val: number): ConversionResult {
  if (val <= 0) {
    return { value: 0, formatted: '0', isExact: true, formulaDescription: 'Non-positive fuel consumption' };
  }

  // Base is L/100km
  // km/L = 100 / (L/100km)
  // mpg (US) = 235.214583 / (L/100km)
  // mpg (UK) = 282.4809363 / (L/100km)

  let lPer100km = val;
  if (from === 'l_100km') {
    lPer100km = val;
  } else if (from === 'km_l') {
    lPer100km = 100 / val;
  } else if (from === 'mpg_us') {
    lPer100km = 235.214583 / val;
  } else if (from === 'mpg_uk') {
    lPer100km = 282.4809363 / val;
  }

  let result = lPer100km;
  let formula = '';
  if (to === 'l_100km') {
    result = lPer100km;
    formula = `Reciprocal conversion to L/100km`;
  } else if (to === 'km_l') {
    result = 100 / lPer100km;
    formula = `100 / ${lPer100km.toFixed(4)}`;
  } else if (to === 'mpg_us') {
    result = 235.214583 / lPer100km;
    formula = `235.2146 / ${lPer100km.toFixed(4)}`;
  } else if (to === 'mpg_uk') {
    result = 282.4809363 / lPer100km;
    formula = `282.4809 / ${lPer100km.toFixed(4)}`;
  }

  return {
    value: result,
    formatted: formatPrecision(result),
    isExact: false,
    formulaDescription: formula,
  };
}

function convertTypography(from: string, to: string, val: number, dpi: number): ConversionResult {
  // Point is base (1/72 inch)
  // 1 pt = 1 pt
  // 1 pica = 12 pt
  // 1 inch = 72 pt
  // 1 mm = 72 / 25.4 pt
  // 1 px = (72 / dpi) pt

  const getPoints = (unit: string, v: number): number => {
    switch (unit) {
      case 'pt': return v;
      case 'pica': return v * 12;
      case 'in': return v * 72;
      case 'mm': return v * (72 / 25.4);
      case 'px': return v * (72 / dpi);
      default: return v;
    }
  };

  const points = getPoints(from, val);

  let result = points;
  switch (to) {
    case 'pt': result = points; break;
    case 'pica': result = points / 12; break;
    case 'in': result = points / 72; break;
    case 'mm': result = points / (72 / 25.4); break;
    case 'px': result = points / (72 / dpi); break;
  }

  return {
    value: result,
    formatted: formatPrecision(result),
    isExact: from !== 'mm' && to !== 'mm',
    formulaDescription: `Point base conversion (DPI: ${dpi})`,
  };
}

export function formatPrecision(num: number): string {
  if (isNaN(num)) return 'NaN';
  if (!isFinite(num)) return num > 0 ? 'Infinity' : '-Infinity';
  if (num === 0) return '0';

  const abs = Math.abs(num);
  if (abs >= 1e12 || (abs < 1e-6 && abs > 0)) {
    return num.toExponential(6).replace(/\.?0+e/, 'e');
  }

  // Avoid standard JS floating point precision issues (e.g. 0.0000000000000001)
  const fixed = Number(num.toPrecision(10));
  const str = fixed.toString();
  return str;
}

// Color converter
export interface ColorFormats {
  hex: string;
  rgb: string;
  rgba: string;
  hsl: string;
  hsv: string;
}

export function convertColor(hexInput: string): ColorFormats | null {
  let hex = hexInput.trim().replace(/^#/, '');
  if (hex.length === 3) {
    hex = hex.split('').map((c) => c + c).join('');
  }
  if (hex.length === 6) {
    hex = hex + 'ff';
  }
  if (hex.length !== 8 || !/^[0-9a-fA-F]{8}$/.test(hex)) {
    return null;
  }

  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const a = Math.round((parseInt(hex.substring(6, 8), 16) / 255) * 100) / 100;

  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  // HSL
  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) h = ((gNorm - bNorm) / delta) % 6;
    else if (max === gNorm) h = (bNorm - rNorm) / delta + 2;
    else h = (rNorm - gNorm) / delta + 4;
  }
  h = Math.round(h * 60);
  if (h < 0) h += 360;

  const l = (max + min) / 2;
  const sHsl = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  // HSV
  const sHsv = max === 0 ? 0 : delta / max;
  const v = max;

  return {
    hex: `#${hex.substring(0, 6).toUpperCase()}${a < 1 ? hex.substring(6, 8).toUpperCase() : ''}`,
    rgb: `rgb(${r}, ${g}, ${b})`,
    rgba: `rgba(${r}, ${g}, ${b}, ${a})`,
    hsl: `hsl(${h}, ${Math.round(sHsl * 100)}%, ${Math.round(l * 100)}%)`,
    hsv: `hsv(${h}, ${Math.round(sHsv * 100)}%, ${Math.round(v * 100)}%)`,
  };
}

// Number base converter with BigInt support
export interface NumberBaseResult {
  binary: string;
  octal: string;
  decimal: string;
  hexadecimal: string;
}

export function convertNumberBase(input: string, fromBase: 2 | 8 | 10 | 16): NumberBaseResult | null {
  const clean = input.trim();
  if (!clean) return null;

  try {
    let bigValue: bigint;
    if (fromBase === 10) {
      bigValue = BigInt(clean);
    } else if (fromBase === 16) {
      bigValue = BigInt(`0x${clean}`);
    } else if (fromBase === 2) {
      bigValue = BigInt(`0b${clean}`);
    } else if (fromBase === 8) {
      bigValue = BigInt(`0o${clean}`);
    } else {
      return null;
    }

    return {
      binary: bigValue.toString(2),
      octal: bigValue.toString(8),
      decimal: bigValue.toString(10),
      hexadecimal: bigValue.toString(16).toUpperCase(),
    };
  } catch {
    return null;
  }
}
