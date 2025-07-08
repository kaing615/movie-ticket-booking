import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    seat_number: {
        type: String,
        required: true,
    },
    seat_type: { 
        type: String, 
        required: true 
    },  
    isDisabled: { 
        type: Boolean, 
        default: false 
    }, 
    isDeleted: { 
        type: Boolean, 
        default: false 
    },
}, { timestamps: true });

export default mongoose.model('Seat', seatSchema);