/**
 * BMI Calculator pure logic and validation.
 */

export interface BmiCalculationInput {
  unitSystem: 'metric' | 'imperial';
  heightCm?: number;
  heightFeet?: number;
  heightInches?: number;
  weightKg?: number;
  weightLb?: number;
  age?: number;
}

export interface BmiCalculationResult {
  isValid: boolean;
  errors: Record<string, string>;
  bmi?: number;
  formattedBmi?: string;
  metricHeightM?: number;
  metricWeightKg?: number;
  whoCategory?: 'Underweight' | 'Normal range' | 'Overweight' | 'Obesity';
  obesityClass?: 'Class I' | 'Class II' | 'Class III';
  formulaExplanation?: string;
  isPediatricOrTeen?: boolean;
  notes?: string;
}

export const WHO_CATEGORIES = {
  UNDERWEIGHT: 'Underweight',
  NORMAL: 'Normal range',
  OVERWEIGHT: 'Overweight',
  OBESITY: 'Obesity',
} as const;

export function calculateBmi(input: BmiCalculationInput): BmiCalculationResult {
  const errors: Record<string, string> = {};

  // Age validation
  if (input.age === undefined || isNaN(input.age)) {
    errors.age = 'Please enter your age.';
  } else if (input.age <= 0 || !Number.isInteger(input.age)) {
    errors.age = 'Age must be a positive whole number.';
  } else if (input.age > 120) {
    errors.age = 'Age must be 120 or below.';
  }

  let heightInMeters = 0;
  let weightInKg = 0;

  // Height extraction & validation
  if (input.unitSystem === 'metric') {
    if (input.heightCm === undefined || isNaN(input.heightCm)) {
      errors.height = 'Please enter height in centimeters.';
    } else if (input.heightCm <= 0) {
      errors.height = 'Height must be greater than zero.';
    } else if (input.heightCm < 40 || input.heightCm > 270) {
      errors.height = 'Height must be between 40 cm and 270 cm.';
    } else {
      heightInMeters = input.heightCm / 100;
    }
  } else {
    // Imperial
    const ft = input.heightFeet ?? 0;
    const inch = input.heightInches ?? 0;

    if (isNaN(ft) || isNaN(inch)) {
      errors.height = 'Height feet and inches must be valid numbers.';
    } else if (ft < 0 || inch < 0) {
      errors.height = 'Height values cannot be negative.';
    } else if (ft === 0 && inch === 0) {
      errors.height = 'Please enter height in feet and inches.';
    } else if (inch >= 12) {
      errors.height = 'Inches must be between 0 and 11.9.';
    } else {
      const totalInches = ft * 12 + inch;
      const totalCm = totalInches * 2.54;
      if (totalCm < 40 || totalCm > 270) {
        errors.height = 'Total height must be between 1 ft 4 in and 8 ft 10 in.';
      } else {
        heightInMeters = totalCm / 100;
      }
    }
  }

  // Weight extraction & validation
  if (input.unitSystem === 'metric') {
    if (input.weightKg === undefined || isNaN(input.weightKg)) {
      errors.weight = 'Please enter weight in kilograms.';
    } else if (input.weightKg <= 0) {
      errors.weight = 'Weight must be greater than zero.';
    } else if (input.weightKg < 2 || input.weightKg > 500) {
      errors.weight = 'Weight must be between 2 kg and 500 kg.';
    } else {
      weightInKg = input.weightKg;
    }
  } else {
    // Imperial (lb)
    if (input.weightLb === undefined || isNaN(input.weightLb)) {
      errors.weight = 'Please enter weight in pounds.';
    } else if (input.weightLb <= 0) {
      errors.weight = 'Weight must be greater than zero.';
    } else {
      const kg = input.weightLb * 0.45359237;
      if (kg < 2 || kg > 500) {
        errors.weight = 'Weight must be between 4.4 lb and 1,100 lb.';
      } else {
        weightInKg = kg;
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return {
      isValid: false,
      errors,
    };
  }

  const bmiRaw = weightInKg / (heightInMeters * heightInMeters);
  const bmiRounded = Math.round(bmiRaw * 10) / 10;
  const isPediatricOrTeen = (input.age ?? 0) < 20;

  let whoCategory: BmiCalculationResult['whoCategory'];
  let obesityClass: BmiCalculationResult['obesityClass'];

  if (!isPediatricOrTeen) {
    if (bmiRounded < 18.5) {
      whoCategory = WHO_CATEGORIES.UNDERWEIGHT;
    } else if (bmiRounded <= 24.9) {
      whoCategory = WHO_CATEGORIES.NORMAL;
    } else if (bmiRounded <= 29.9) {
      whoCategory = WHO_CATEGORIES.OVERWEIGHT;
    } else {
      whoCategory = WHO_CATEGORIES.OBESITY;
      if (bmiRounded < 35.0) {
        obesityClass = 'Class I';
      } else if (bmiRounded < 40.0) {
        obesityClass = 'Class II';
      } else {
        obesityClass = 'Class III';
      }
    }
  }

  const formulaExplanation = `${weightInKg.toFixed(1)} kg / (${heightInMeters.toFixed(2)} m)² = ${bmiRounded.toFixed(1)}`;

  const notes = isPediatricOrTeen
    ? 'Standard adult WHO categories do not apply to individuals under age 20. For children and adolescents, BMI percentiles based on age and sex-specific WHO/CDC growth charts are required. Please consult a pediatrician or qualified healthcare professional.'
    : 'BMI is an epidemiological screening measure based on height and weight. It does not measure body fat directly and does not account for muscle mass, bone density, ethnicity, or overall body composition.';

  return {
    isValid: true,
    errors: {},
    bmi: bmiRounded,
    formattedBmi: bmiRounded.toFixed(1),
    metricHeightM: Number(heightInMeters.toFixed(3)),
    metricWeightKg: Number(weightInKg.toFixed(2)),
    whoCategory,
    obesityClass,
    formulaExplanation,
    isPediatricOrTeen,
    notes,
  };
}
