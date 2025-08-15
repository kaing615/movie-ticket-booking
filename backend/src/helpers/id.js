export const genTicketCode = (seatId) =>
  `T${Date.now().toString(36).toUpperCase()}-${String(seatId).slice(-4)}-${Math.random().toString(36).slice(2,6).toUpperCase()}`;
