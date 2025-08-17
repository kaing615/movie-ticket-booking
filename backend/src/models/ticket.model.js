import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema(
  {
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
    ownerId:   { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true, index: true },
    showId:    { type: mongoose.Schema.Types.ObjectId, ref: "Show",    required: true, index: true },
    seatId:    { type: mongoose.Schema.Types.ObjectId, ref: "Seat",    required: true, index: true },

    seatLabel: { type: String },     
    seatType:  { type: String },    

    price: { type: Number, required: true },
    currency: { type: String, default: "VND" },

    code: { type: String, unique: true, index: true },

    status: {
      type: String,
      enum: ["active", "used", "cancelled", "refunded"],
      default: "active",
      index: true,
    },
    usedAt: Date,
    checkedInBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    cancelReason: String,
    refundAmount: Number,
    refundAt: Date,

    isDeleted: { type: Boolean, default: false }, 
  },
  { timestamps: true }
);

ticketSchema.index(
  { showId: 1, seatId: 1 },
  {
    unique: true,
    partialFilterExpression: {
      isDeleted: false,
      status: { $in: ["active", "used"] },
    },
  }
);

export default mongoose.model("Ticket", ticketSchema);
