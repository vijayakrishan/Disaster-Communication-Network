/**
 * Utility functions for Indian phone number standardization (+91).
 */

/**
 * Normalizes a phone number to a clean digits-only format of the last 10 digits.
 */
export const normalizeIndianPhoneNumber = (phone) => {
  if (!phone) return '';
  const digits = phone.toString().replace(/\D/g, '');
  return digits.substring(Math.max(0, digits.length - 10));
};

/**
 * Formats any phone number into the standard India format: +91 XXXXX XXXXX.
 */
export const formatIndianPhoneNumber = (phone) => {
  if (!phone) return '—';
  const local = normalizeIndianPhoneNumber(phone);
  if (local.length === 10) {
    return `+91 ${local.substring(0, 5)} ${local.substring(5)}`;
  }
  return phone;
};

/**
 * Validates whether a phone number is a valid 10-digit Indian mobile number.
 */
export const isValidIndianPhoneNumber = (phone) => {
  if (!phone) return false;
  const normalized = normalizeIndianPhoneNumber(phone);
  return /^[6-9]\d{9}$/.test(normalized);
};
