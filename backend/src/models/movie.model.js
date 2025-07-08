import mongoose from "mongoose";

const movieSchema = new mongoose.Schema({
    movieName: {
        type: String,
        required: true,
        unique: true,
    },
    description: {
        type: String,
        required: true,
    },
    genres: {
        type: [String],
        required: true,
    },
    duration: {
        type: Number,
        required: true,
    },
    releaseDate: {
        type: Date,
        required: true,
    },
    poster: {
        type: String,
        required: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    movieRating: {
        type: String,
        enum: ['P', 'K', 'T13', 'T16', 'T18'],
        required: true,
    }
});