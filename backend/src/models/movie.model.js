import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
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
    country: {
      type: String,
      required: true,
    },
    poster: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
      required: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    movieRating: {
      type: String,
      enum: ["P", "K", "T13", "T16", "T18"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Coming Soon", "Now Showing", "Ended"],
      default: "Coming Soon",
    },
    director: {
      type: String,
      required: true,
    },
    trailer: {
      type: String,
      required: true,
    },
    allowedShowStart: {
      type: Date,
      required: true,
    },
    ratingScore: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Movie", movieSchema);
