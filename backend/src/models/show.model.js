import mongoose from "mongoose";

const showSchema = new mongoose.Schema({
    movieId: { type: mongoose.Schema.Types.ObjectId, ref: 'Movie' },
    theaterId: { type: mongoose.Schema.Types.ObjectId, ref: 'Theater' },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
    startTime: Date,
    endTime: Date,
    status: { type: String, enum: ['planned', 'ongoing', 'finished', 'cancelled'], default: 'planned' }
});

export default mongoose.model('Show', showSchema);