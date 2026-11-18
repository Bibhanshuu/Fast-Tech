import type { DeviceCategory, PricingConfig, Product } from '../types/fastTech';

export interface VisitationQuote {
  tier: 1 | 2 | 3;
  tierLabel: string;
  baseFee: number;
  urgentSurcharge: number;
  totalFee: number;
  inCoverage: boolean;
}

export function calculateVisitationFee(
  distanceKm: number,
  pricing: PricingConfig,
  isUrgent = false
): VisitationQuote {
  const safeDist = Math.max(0.2, Number.isFinite(distanceKm) ? distanceKm : 1);
  let tier: 1 | 2 | 3 = 1;
  let tierLabel = `Tier 1 (0–${pricing.tier1MaxKm} km)`;
  let baseFee = pricing.tier1Fee;
  let inCoverage = true;

  if (safeDist <= pricing.tier1MaxKm) {
    tier = 1;
    tierLabel = `Tier 1 (0–${pricing.tier1MaxKm} km)`;
    baseFee = pricing.tier1Fee;
  } else if (safeDist <= pricing.tier2MaxKm) {
    tier = 2;
    tierLabel = `Tier 2 (${pricing.tier1MaxKm}–${pricing.tier2MaxKm} km)`;
    baseFee = pricing.tier2Fee;
  } else if (safeDist <= pricing.tier3MaxKm) {
    tier = 3;
    tierLabel = `Tier 3 (${pricing.tier2MaxKm}–${pricing.tier3MaxKm} km)`;
    baseFee = pricing.tier3Fee;
  } else {
    tier = 3;
    tierLabel = `Extended Zone (>${pricing.tier3MaxKm} km)`;
    baseFee = pricing.tier3Fee;
    inCoverage = false;
  }

  const urgentSurcharge = isUrgent ? pricing.urgentSurcharge : 0;
  return {
    tier,
    tierLabel,
    baseFee,
    urgentSurcharge,
    totalFee: baseFee + urgentSurcharge,
    inCoverage,
  };
}

export function maskPhoneNumber(phone: string): string {
  const cleaned = phone.trim();
  if (cleaned.length <= 4) return '••••';
  const lastThree = cleaned.slice(-3);
  const prefixMatch = cleaned.match(/^(\+\d{1,3}\s?)/);
  const prefix = prefixMatch ? prefixMatch[1] : '';
  return `${prefix}••••• ••${lastThree}`;
}

export function toggleEngineerSpecialization(
  current: DeviceCategory[],
  target: DeviceCategory
): { next: DeviceCategory[]; error: string | null } {
  if (current.includes(target)) {
    return {
      next: current.filter((item) => item !== target),
      error: null,
    };
  }
  if (current.length >= 2) {
    return {
      next: current,
      error:
        'Strict Dual-Specialization Policy: Maximum 2 proficiencies allowed. Deselect an active specialization first.',
    };
  }
  return {
    next: [...current, target],
    error: null,
  };
}

// Maps 0-100 grid coordinates relative to Fast Tech Kolkata Hub (50, 50) -> 0.5km to 18km
export function calculateDistanceKm(
  pin: { x: number; y: number },
  hub: { x: number; y: number } = { x: 50, y: 50 }
): number {
  const dx = pin.x - hub.x;
  const dy = pin.y - hub.y;
  const raw = Math.sqrt(dx * dx + dy * dy) * 0.28;
  return Math.max(0.8, Math.round(raw * 10) / 10);
}

export function cascadeDispatchTier(
  currentTier: 1 | 2 | 3,
  reason: 'rejected' | 'timeout'
): {
  nextTier: 1 | 2 | 3;
  escalated: boolean;
  logMessage: string;
} {
  const reasonLabel = reason === 'timeout' ? '60s timer expired' : 'declined by technician';
  if (currentTier === 1) {
    return {
      nextTier: 2,
      escalated: false,
      logMessage: `Tier 1 ${reasonLabel}. Waterfall cascaded to Tier 2 zone.`,
    };
  }
  if (currentTier === 2) {
    return {
      nextTier: 3,
      escalated: false,
      logMessage: `Tier 2 ${reasonLabel}. Waterfall cascaded to Tier 3 metro ring.`,
    };
  }
  return {
    nextTier: 3,
    escalated: true,
    logMessage: `Tier 3 ${reasonLabel}. Escalated to Fast Tech Dispatch Desk.`,
  };
}

export interface TicketFormValidationInput {
  serialNumber: string;
  model: string;
  subject: string;
  description: string;
}

export function validateTicketForm(
  input: TicketFormValidationInput
): Record<string, string> {
  const errors: Record<string, string> = {};
  const serial = input.serialNumber.trim();
  if (!serial) {
    errors.serialNumber = 'Device Serial Number is mandatory for warranty & parts matching.';
  } else if (serial.length < 5 || !/^[A-Za-z0-9-]+$/.test(serial)) {
    errors.serialNumber = 'Enter a valid alphanumeric serial number (min 5 characters).';
  }
  if (!input.model.trim()) {
    errors.model = 'Device model name is required (e.g., MacBook Pro M3, ThinkPad X1).';
  }
  if (!input.subject.trim() || input.subject.trim().length < 4) {
    errors.subject = 'Provide a short issue summary (min 4 characters).';
  }
  if (!input.description.trim() || input.description.trim().length < 10) {
    errors.description = 'Describe the fault symptoms in at least 10 characters.';
  }
  return errors;
}

export function filterProducts(
  products: Product[],
  searchQuery: string,
  serialFilter: string,
  selectedCategory: string
): Product[] {
  const q = searchQuery.trim().toLowerCase();
  const s = serialFilter.trim().toLowerCase();

  return products.filter((product) => {
    if (selectedCategory !== 'All' && product.category !== selectedCategory) {
      return false;
    }
    if (q) {
      const haystack = `${product.name} ${product.sku} ${product.compatibleModels} ${product.description}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    if (s) {
      const serialMatch =
        product.sku.toLowerCase().includes(s) ||
        product.compatibleModels.toLowerCase().includes(s) ||
        product.serialNumbers.some((sn) => sn.toLowerCase().includes(s));
      if (!serialMatch) return false;
    }
    return true;
  });
}

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN', {
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatCountdown(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
