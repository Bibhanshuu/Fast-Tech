import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDistanceKm,
  calculateVisitationFee,
  cascadeDispatchTier,
  filterProducts,
  formatCountdown,
  maskPhoneNumber,
  toggleEngineerSpecialization,
  validateTicketForm,
} from './fastTechEngine';
import type { PricingConfig, Product } from '../types/fastTech';

const defaultPricing: PricingConfig = {
  tier1MaxKm: 5,
  tier1Fee: 200,
  tier2MaxKm: 10,
  tier2Fee: 300,
  tier3MaxKm: 20,
  tier3Fee: 400,
  urgentSurcharge: 100,
  dispatchTimerSec: 60,
};

test('calculateVisitationFee computes dynamic brackets and urgent surcharge', () => {
  const t1 = calculateVisitationFee(3.2, defaultPricing, false);
  assert.equal(t1.tier, 1);
  assert.equal(t1.totalFee, 200);
  assert.equal(t1.inCoverage, true);

  const t2 = calculateVisitationFee(7.8, defaultPricing, true);
  assert.equal(t2.tier, 2);
  assert.equal(t2.baseFee, 300);
  assert.equal(t2.urgentSurcharge, 100);
  assert.equal(t2.totalFee, 400);

  const t3 = calculateVisitationFee(15.4, defaultPricing, false);
  assert.equal(t3.tier, 3);
  assert.equal(t3.totalFee, 400);

  const customPricing = { ...defaultPricing, tier1Fee: 250 };
  assert.equal(calculateVisitationFee(2.5, customPricing, false).totalFee, 250);
});

test('maskPhoneNumber hides subscriber digits while preserving country prefix and last 3 digits', () => {
  const masked = maskPhoneNumber('+91 98304 51218');
  assert.equal(masked, '+91 ••••• ••218');
  assert.equal(masked.includes('98304'), false);
});

test('toggleEngineerSpecialization strictly enforces max 2 proficiencies', () => {
  const res1 = toggleEngineerSpecialization(['NoteBook', 'Printer'], 'MacBook');
  assert.deepEqual(res1.next, ['NoteBook', 'Printer']);
  assert.ok(res1.error && res1.error.includes('Maximum 2'));

  const res2 = toggleEngineerSpecialization(['NoteBook', 'Printer'], 'Printer');
  assert.deepEqual(res2.next, ['NoteBook']);
  assert.equal(res2.error, null);

  const res3 = toggleEngineerSpecialization(['NoteBook'], 'MacBook');
  assert.deepEqual(res3.next, ['NoteBook', 'MacBook']);
  assert.equal(res3.error, null);
});

test('cascadeDispatchTier advances Tier 1 -> Tier 2 -> Tier 3 -> Escalated', () => {
  const c1 = cascadeDispatchTier(1, 'timeout');
  assert.equal(c1.nextTier, 2);
  assert.equal(c1.escalated, false);

  const c2 = cascadeDispatchTier(2, 'rejected');
  assert.equal(c2.nextTier, 3);
  assert.equal(c2.escalated, false);

  const c3 = cascadeDispatchTier(3, 'timeout');
  assert.equal(c3.nextTier, 3);
  assert.equal(c3.escalated, true);
});

test('validateTicketForm requires serial number, model, subject, and description', () => {
  const invalid = validateTicketForm({
    serialNumber: '',
    model: '',
    subject: 'No',
    description: 'Short',
  });
  assert.ok(invalid.serialNumber);
  assert.ok(invalid.model);
  assert.ok(invalid.subject);
  assert.ok(invalid.description);

  const valid = validateTicketForm({
    serialNumber: 'C02Z9123LVDL',
    model: 'MacBook Pro 14 M3',
    subject: 'Display backlight flicker',
    description: 'Screen dims randomly after 10 minutes of thermal load.',
  });
  assert.deepEqual(valid, {});
});

test('calculateDistanceKm and formatCountdown return predictable formatted values', () => {
  assert.equal(calculateDistanceKm({ x: 50, y: 50 }), 0.8);
  assert.ok(calculateDistanceKm({ x: 80, y: 50 }) > 7);
  assert.equal(formatCountdown(58), '00:58');
  assert.equal(formatCountdown(0), '00:00');
});

test('filterProducts matches serial numbers and SKU prefixes', () => {
  const sampleProducts: Product[] = [
    {
      id: 'p1',
      sku: 'FT-SSD-1TB',
      name: 'Fast Tech 1TB Gen4 NVMe SSD',
      category: 'SSD',
      price: 6499,
      stock: 12,
      serialTracked: true,
      serialNumbers: ['SN-NVME-99401', 'SN-NVME-99402'],
      compatibleModels: 'MacBook / ThinkPad / XPS',
      imageUrl: '',
      description: 'High-speed PCIe Gen4 drive.',
    },
    {
      id: 'p2',
      sku: 'FT-RAM-32G',
      name: 'DDR5 32GB Kit',
      category: 'RAM',
      price: 7899,
      stock: 8,
      serialTracked: true,
      serialNumbers: ['SN-DDR5-77120'],
      compatibleModels: 'Workstation / Dell Precision',
      imageUrl: '',
      description: 'Dual-channel SO-DIMM kit.',
    },
  ];

  const bySerial = filterProducts(sampleProducts, '', '99401', 'All');
  assert.equal(bySerial.length, 1);
  assert.equal(bySerial[0].id, 'p1');
});
