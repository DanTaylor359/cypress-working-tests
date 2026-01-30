// generate random numeric string (e.g., cardID)
export function randomNumbers(length) {
  const chars = '0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

// generate random alphanumeric string (e.g., accountNumber)
export function randomAlphaNum(length) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}
