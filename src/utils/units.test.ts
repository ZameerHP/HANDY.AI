import test from 'node:test';
import assert from 'node:assert/strict';
import { convertUnit, convertColor, convertNumberBase } from './units.ts';

test('1 km = 1,000 m', () => {
  const res = convertUnit('length', 'km', 'm', 1);
  assert.equal(res.value, 1000);
});

test('1 m = 100 cm', () => {
  const res = convertUnit('length', 'm', 'cm', 1);
  assert.equal(res.value, 100);
});

test('0°C = 32°F', () => {
  const res = convertUnit('temperature', 'C', 'F', 0);
  assert.equal(res.value, 32);
});

test('100°C = 212°F and 373.15 K', () => {
  const fRes = convertUnit('temperature', 'C', 'F', 100);
  assert.equal(fRes.value, 212);
  const kRes = convertUnit('temperature', 'C', 'K', 100);
  assert.equal(Math.round(kRes.value * 100) / 100, 373.15);
});

test('1 hour = 3,600 s', () => {
  const res = convertUnit('time', 'h', 's', 1);
  assert.equal(res.value, 3600);
});

test('1 KiB = 1,024 bytes', () => {
  const res = convertUnit('data', 'kib', 'byte', 1);
  assert.equal(res.value, 1024);
});

test('1 KB = 1,000 bytes', () => {
  const res = convertUnit('data', 'kb', 'byte', 1);
  assert.equal(res.value, 1000);
});

test('100 km/h to mph', () => {
  const res = convertUnit('speed', 'km_h', 'mph', 100);
  // 100 / 1.609344 ≈ 62.137119
  assert.ok(Math.abs(res.value - 62.1371) < 0.001);
});

test('8 L/100 km to mpg US and mpg UK', () => {
  const resUS = convertUnit('fuel_economy', 'l_100km', 'mpg_us', 8);
  // 235.214583 / 8 ≈ 29.4018
  assert.ok(Math.abs(resUS.value - 29.4018) < 0.01);

  const resUK = convertUnit('fuel_economy', 'l_100km', 'mpg_uk', 8);
  // 282.4809363 / 8 ≈ 35.3101
  assert.ok(Math.abs(resUK.value - 35.3101) < 0.01);
});

test('Cooking: 1 cup US = 16 tbsp US = 48 tsp US', () => {
  const tbsp = convertUnit('cooking', 'cup_us', 'tbsp_us', 1);
  assert.equal(Math.round(tbsp.value), 16);
  const tsp = convertUnit('cooking', 'cup_us', 'tsp_us', 1);
  assert.equal(Math.round(tsp.value), 48);
});

test('Color conversion HEX to RGB, HSL, HSV', () => {
  const res = convertColor('#172345');
  assert.ok(res !== null);
  assert.equal(res?.rgb, 'rgb(23, 35, 69)');
  assert.ok(res?.hsl.startsWith('hsl(224,'));
});

test('Number base converter with BigInt', () => {
  const res = convertNumberBase('255', 10);
  assert.ok(res !== null);
  assert.equal(res?.binary, '11111111');
  assert.equal(res?.hexadecimal, 'FF');
  assert.equal(res?.octal, '377');
});
