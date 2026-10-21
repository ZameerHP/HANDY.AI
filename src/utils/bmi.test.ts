import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateBmi } from './bmi.ts';

test('Normal adult BMI calculation (metric: 70kg, 175cm, age 28)', () => {
  const result = calculateBmi({
    unitSystem: 'metric',
    heightCm: 175,
    weightKg: 70,
    age: 28,
  });

  assert.equal(result.isValid, true);
  // 70 / (1.75^2) = 22.857... -> 22.9
  assert.equal(result.formattedBmi, '22.9');
  assert.equal(result.whoCategory, 'Normal range');
  assert.equal(result.isPediatricOrTeen, false);
});

test('Overweight category calculation (metric: 85kg, 175cm, age 35)', () => {
  const result = calculateBmi({
    unitSystem: 'metric',
    heightCm: 175,
    weightKg: 85,
    age: 35,
  });

  assert.equal(result.isValid, true);
  // 85 / (1.75^2) = 27.755 -> 27.8
  assert.equal(result.formattedBmi, '27.8');
  assert.equal(result.whoCategory, 'Overweight');
});

test('Underweight category calculation (metric: 48kg, 170cm, age 24)', () => {
  const result = calculateBmi({
    unitSystem: 'metric',
    heightCm: 170,
    weightKg: 48,
    age: 24,
  });

  assert.equal(result.isValid, true);
  // 48 / (1.7^2) = 16.6
  assert.equal(result.formattedBmi, '16.6');
  assert.equal(result.whoCategory, 'Underweight');
});

test('Imperial calculation (5 ft 10 in, 160 lb, age 40)', () => {
  const result = calculateBmi({
    unitSystem: 'imperial',
    heightFeet: 5,
    heightInches: 10,
    weightLb: 160,
    age: 40,
  });

  assert.equal(result.isValid, true);
  // 70 inches = 1.778 m. 160 lb = 72.5748 kg. 72.5748 / (1.778^2) ≈ 22.96 -> 23.0
  assert.equal(result.formattedBmi, '23.0');
  assert.equal(result.whoCategory, 'Normal range');
});

test('Pediatric/teen rule (< 20 years old gives no adult WHO category)', () => {
  const result = calculateBmi({
    unitSystem: 'metric',
    heightCm: 165,
    weightKg: 55,
    age: 15,
  });

  assert.equal(result.isValid, true);
  assert.equal(result.isPediatricOrTeen, true);
  assert.equal(result.whoCategory, undefined);
  assert.ok(result.notes?.includes('Standard adult WHO categories do not apply'));
});

test('Input validation: rejects zero, negative, and invalid bounds', () => {
  const zeroHeight = calculateBmi({
    unitSystem: 'metric',
    heightCm: 0,
    weightKg: 70,
    age: 25,
  });
  assert.equal(zeroHeight.isValid, false);
  assert.ok(zeroHeight.errors.height);

  const negativeWeight = calculateBmi({
    unitSystem: 'metric',
    heightCm: 180,
    weightKg: -10,
    age: 25,
  });
  assert.equal(negativeWeight.isValid, false);
  assert.ok(negativeWeight.errors.weight);

  const missingAge = calculateBmi({
    unitSystem: 'metric',
    heightCm: 180,
    weightKg: 70,
  });
  assert.equal(missingAge.isValid, false);
  assert.ok(missingAge.errors.age);
});
