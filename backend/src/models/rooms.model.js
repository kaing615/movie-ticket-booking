import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
    theaterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater', required: true },
    roomNumber: {
        type: String,
        required: true,
        unique: true,
    },
});