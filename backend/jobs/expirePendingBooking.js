import Booking from "../models/booking.model.js";
import Ticket from "../models/ticket.model.js";

export const startExpireJob = (minutes = 10) => {
  const intervalMs = 60 * 1000;
  setInterval(async () => {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    const pendings = await Booking.find({
      status: "pending",
      createdAt: { $lt: cutoff },
    }).select("_id");

    if (!pendings.length) return;
    const ids = pendings.map((b) => b._id);

    await Booking.updateMany({ _id: { $in: ids } }, { $set: { status: "expired" } });
    await Ticket.updateMany(
      { bookingId: { $in: ids }, status: "active" },
      { $set: { status: "cancelled" } }
    );
    console.log(`Expired ${ids.length} pending bookings`);
  }, intervalMs);
};
