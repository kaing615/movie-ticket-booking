import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    seatNumber: {
        type: String,
        required: true,
    },
    seatType: { 
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