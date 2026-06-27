const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;

export function normalizeMobile(input: string): string {
  return input.replace(/\D/g, "").slice(-10);
}

export function validateIndianMobile(input: string): boolean {
  return INDIAN_MOBILE_PATTERN.test(normalizeMobile(input));
}

export function formatMobileDisplay(mobile: string): string {
  const digits = normalizeMobile(mobile);
  return digits.length === 10 ? digits : mobile.trim();
}
