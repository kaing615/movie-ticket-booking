export const priceByType = (t) => ({
  standard: 90000,
  VIP: 120000,
  couple: 180000,
  "Tiêu chuẩn": 90000,
  "Couple": 180000,
}[t] ?? 90000);