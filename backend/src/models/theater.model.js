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
		unique: true,
	},
	location: {
		type: String,
		required: true,
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

export default mongoose.model("Theater", theaterSchema);
