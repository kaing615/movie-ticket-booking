import mongoose from "mongoose";

const ticketSchema = new mongoose.Schema({
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    showId: { type: mongoose.Schema.Types.ObjectId, ref: 'Show' },
    price: {
        type: Number,
        required: true,
    },
    seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat' },
    isDeleted: { 
        type: Boolean, 
        default: false 
    },
}, { timestamps: true });

export default mongoose.model('Ticket', ticketSchema);