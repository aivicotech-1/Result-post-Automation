export function normalizePhone(phone) {
  if (!phone) return null;

  const digits = String(phone).replace(/\D/g, '');
  if (!digits) return null;

  if (digits.startsWith('92')) return digits;
  if (digits.startsWith('0')) return `92${digits.slice(1)}`;
  if (digits.length === 10) return `92${digits}`;
  return null;
}

export function buildWhatsAppLink(number, message) {
  const normalized = normalizePhone(number);
  if (!normalized) return null;
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${normalized}?text=${encoded}`;
}
