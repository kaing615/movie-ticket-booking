import mongoose from "mongoose";

const SeatHoldSchema = new mongoose.Schema({
  showId:   { type: mongoose.Schema.Types.ObjectId, ref: "Show", required: true, index: true },
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  seatIds:  [{ type: mongoose.Schema.Types.ObjectId, ref: "Seat", required: true }],
  expiresAt:{ type: Date, required: true, index: true },
}, { timestamps: true });

SeatHoldSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("SeatHold", SeatHoldSchema);
