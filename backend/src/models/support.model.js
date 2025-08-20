import mongoose from "mongoose";

const supportSchema = new mongoose.Schema(
	{
		user: {
			userId: {
				type: mongoose.Schema.Types.ObjectId,
				ref: "User",
				required: true,
			},
			email: {
				type: String,
				required: true,
			},
		},
		subject: { type: String, required: true },
		message: { type: String, required: true },
		status: {
			type: String,
			enum: ["pending", "resolved", "closed"],
			default: "pending",
		},
	},
	{ timestamps: true }
);

export default mongoose.model("Support", supportSchema);
