import { configuredPrivateClient } from "../clients/configuredClient";

const pick = (r) => (r && r.data && (r.data.data ?? r.data)) || r;

export const bookingEndpoints = {
  getMyBookings: "booking/me",
  createBooking: "booking",
  updateBooking: (id) => `booking/${id}`,
  deleteBooking: (id) => `booking/${id}`,
};

export const bookingApi = {
  getMyBookings: (params) =>
    configuredPrivateClient.get(bookingEndpoints.getMyBookings, { params }).then((r) => r.data?.bookings || []),
  createBooking: (data) => configuredPrivateClient.post(bookingEndpoints.createBooking, data).then((r) => r.data),
  updateBooking: (id, data) => configuredPrivateClient.put(bookingEndpoints.updateBooking(id), data).then((r) => r.data),
  deleteBooking: (id) => configuredPrivateClient.delete(bookingEndpoints.deleteBooking(id)).then((r) => r.data),

  confirmFromHold: (showId) =>
    configuredPrivateClient.post(`booking/confirm`, { showId }).then(pick),
};