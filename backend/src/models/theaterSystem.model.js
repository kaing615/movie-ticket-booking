import mongoose from "mongoose";

const theaterSystemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        set: v => String(v || "").toUpperCase()
    },
    logo: {
        type: String,
        default: "https://example.com/default-logo.png",
    },
    description: {
        type: String,
        default: "No description available.",
    },
});

export default mongoose.model("TheaterSystem", theaterSystemSchema);