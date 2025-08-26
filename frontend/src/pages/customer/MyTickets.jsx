// src/pages/customer/MyTickets.jsx
import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "../../api/modules/booking.api";
import ETicket from "./ETicket";
import BookingHistory from "./BookingHistory";
const MyTickets = () => {
  const { data: bookings = [], isLoading, isError } = useQuery({
    queryKey: ["my-tickets", "paid"],
    queryFn: () => bookingApi.getMyBookings({ status: "paid" }),
  });

  // Flatten: mỗi ticket kèm context booking để render
  const items = useMemo(
    () =>
      (bookings || []).flatMap((b) =>
        (b.tickets || []).map((t) => ({ ticket: t, booking: b }))
      ),
    [bookings]
  );

  return (
    <div className="container mx-auto px-4 py-6 lg:py-8 lg:max-w-6xl">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1 h-6 bg-blue-700 rounded" />
        <h1 className="text-2xl font-bold tracking-wide text-gray-800">
          Vé của tôi
        </h1>
      </div>

      <BookingHistory />
      
    </div>
  );
};

export default MyTickets;
