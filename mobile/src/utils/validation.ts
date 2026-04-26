export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPhone(phone: string): boolean {
  return /^0[5-9]\d{8}$/.test(phone.replace(/[-\s]/g, ''));
}

export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}
