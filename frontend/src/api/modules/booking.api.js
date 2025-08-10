import { configuredPrivateClient } from "../clients/configuredClient";

export const bookingEndpoints = {
    getMyBookings: "booking/me",
    createBooking: "booking",
    updateBooking: (id) => `booking/${id}`,
    deleteBooking: (id) => `booking/${id}`,

};

export const bookingApi = {
    getMyBookings: (params) =>
        configuredPrivateClient
            .get(bookingEndpoints.getMyBookings, { params })
            .then((res) => res.data?.bookings || []),
    createBooking: (data) =>
        configuredPrivateClient
            .post(bookingEndpoints.createBooking, data)
            .then((res) => res.data),

    updateBooking: (id, data) =>
        configuredPrivateClient
            .put(bookingEndpoints.updateBooking(id), data)
            .then((res) => res.data),

    deleteBooking: (id) =>
        configuredPrivateClient
            .delete(bookingEndpoints.deleteBooking(id))
            .then((res) => res.data),
};