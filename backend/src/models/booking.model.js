import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show', required: true },
    tickets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' }],
    totalPrice: {
        type: Number, 
        required: true 
    },
    status: {
      type: String,
      enum: ["pending", "paid", "cancelled", "expired", "refunded"],
      default: "pending",
    },
}, { timestamps: true });

export default mongoose.model('Booking', bookingSchema);