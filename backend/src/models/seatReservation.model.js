import mongoose from "mongoose";

const SeatReservationSchema = new mongoose.Schema({
  showId:  { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: true },
  seatId:  { type: mongoose.Schema.Types.ObjectId, ref: "Seat", required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" }, // sau khi paid
}, { timestamps: true });

SeatReservationSchema.index({ showId: 1, seatId: 1 }, { unique: true });

export default mongoose.model("SeatReservation", SeatReservationSchema);
