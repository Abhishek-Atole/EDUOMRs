export function formatIndianPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `+91${cleaned}`;
  }

  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned}`;
  }

  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return `+91${cleaned.slice(1)}`;
  }

  return `+${cleaned}`;
}

export function maskPhone(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length < 6) return phone;
  const visible = cleaned.slice(0, 2);
  const lastTwo = cleaned.slice(-2);
  const masked = '*'.repeat(Math.max(0, cleaned.length - 4));
  return `${visible}${masked}${lastTwo}`;
}

export function isValidIndianPhone(phone) {
  const cleaned = phone.replace(/\D/g, '');
  return /^(?:\+91|91)?[6-9]\d{9}$/.test(cleaned);
}
