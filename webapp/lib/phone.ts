// India-only for now. Accepts "98765 43210", "09876543210", "+91 98765-43210", "919876543210"
// and returns E.164 ("+919876543210"), or null if it isn't a valid Indian mobile number.
export function normalizeIndianMobile(input: string): string | null {
  let digits = input.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  return /^[6-9]\d{9}$/.test(digits) ? `+91${digits}` : null;
}

// "+919876543210" -> "98765 43210" for an input that already shows the +91 prefix.
export function formatNationalNumber(e164: string | null | undefined): string {
  if (!e164) return "";
  const national = e164.replace(/^\+91/, "");
  return national.length === 10 ? `${national.slice(0, 5)} ${national.slice(5)}` : national;
}
