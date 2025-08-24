import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    seatIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Seat' }],
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
    totalPrice: { type: Number,  required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "expired", "refunded"],
      default: "pending",
    },
    theaterId: { type: mongoose.Schema.Types.ObjectId, ref: "Theater", index: true }, 
    paidAt: { type: Date, index: true },
    cancelledAt: { type: Date },
    refundedAt: { type: Date },
    canReview: { type: Boolean, default: false }
}, { timestamps: true });

bookingSchema.index({ theaterId: 1, paidAt: 1 });
bookingSchema.index({ createdAt: 1 });

// Tự set mốc thời gian khi đổi status
bookingSchema.pre("save", function (next) {
  if (this.isModified("status")) {
    if (this.status === "paid" && !this.paidAt) this.paidAt = new Date();
    if (this.status === "cancelled" && !this.cancelledAt) this.cancelledAt = new Date();
    if (this.status === "refunded" && !this.refundedAt) this.refundedAt = new Date();
  }
  next();
});

export default mongoose.model('Booking', bookingSchema);