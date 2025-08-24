import mongoose from "mongoose";

const theaterSchema = new mongoose.Schema({
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
    unique: true,
    sparse: true,
  },
  theaterName: {
    type: String,
    required: true,
  },
  location: {
    type: String,
    required: true,
	trim: true,
  },
  theaterSystemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TheaterSystem",
    required: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

theaterSchema.index(
  { theaterSystemId: 1, theaterName: 1, isDeleted: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export default mongoose.model("Theater", theaterSchema);
