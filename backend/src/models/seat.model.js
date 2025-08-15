import mongoose from "mongoose";

const seatSchema = new mongoose.Schema({
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    seatNumber: {
        type: String,
        required: true,
    },
    seatType: { 
        type: String, 
        enum: ["VIP", "Tiêu chuẩn", "Couple"],
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
    row : { type: String },
}, { timestamps: true });

export default mongoose.model('Seat', seatSchema);