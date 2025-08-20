import Support from "../models/support.model.js";
import responseHandler from "../handlers/response.handler.js";
const createSupportTicket = async (req, res) => {
	try {
		const { subject, message } = req.body;

		// Basic validation
		if (!subject || !message) {
			return responseHandler.badRequest(res, {
				message: "Subject and message are required fields.",
			});
		}

		const newTicket = new Support({
			user: {
				userId: req.user._id,
				email: req.user.email,
			},
			subject,
			message,
		});

		const createdTicket = await newTicket.save();
		return responseHandler.created(res, {
			message: "Support ticket created successfully.",
			ticket: createdTicket,
		});
	} catch (error) {
		console.error("Error creating support ticket:", error);
		responseHandler.error(res);
	}
};

// @desc    Get all support tickets
// @route   GET /api/support
// @access  Private/Admin (depending on application logic)
const getAllSupportTickets = async (req, res) => {
	try {
		const page = parseInt(req.query.page) || 1; // Default to page 1
		const limit = parseInt(req.query.limit) || 10; // Default to 10 tickets per page
		const skip = (page - 1) * limit;

		const totalTickets = await Support.countDocuments({}); // Get total count for pagination info
		const tickets = await Support.find({}).skip(skip).limit(limit);

		return responseHandler.ok(res, {
			message: "Support tickets fetched successfully!",
			total: totalTickets,
			page,
			limit,
			tickets,
		});
	} catch (error) {
		console.error("Error fetching support tickets:", error);
		responseHandler.error(res);
	}
};

// @desc    Get a single support ticket by ID
// @route   GET /api/support/:id
// @access  Private (only accessible by ticket creator or admin)
const getSupportTicketById = async (req, res) => {
	try {
		const ticket = await Support.findById(req.params.id);

		if (!ticket) {
			return responseHandler.notFound(res, "Support ticket not found.");
		}

		return responseHandler.ok(res, {
			message: "Support ticket fetched successfully!",
			ticket,
		});
	} catch (error) {
		console.error("Error fetching support ticket by ID:", error);
		// Check for CastError if ID format is invalid
		if (error.name === "CastError") {
			return res
				.status(400)
				.json({ message: "Invalid ticket ID format." });
		}
		res.status(500).json({
			message: "Server error: Could not retrieve support ticket.",
			error: error.message,
		});
	}
};

// @desc    Update a support ticket
// @route   PUT /api/support/:id
// @access  Private (only accessible by ticket creator or admin)
const updateSupportTicket = async (req, res) => {
	try {
		const { status } = req.body;

		const ticket = await Support.findById(req.params.id);

		if (!ticket) {
			return responseHandler.notFound(res, "Support ticket not found.");
		}

		if (status !== undefined) {
			// Ensure status is one of the allowed enum values
			if (["pending", "resolved"].includes(status)) {
				ticket.status = status;
			} else {
				return responseHandler.badRequest(res, {
					message: "Status must be 'pending' or 'resolved'.",
				});
			}
		}

		const updatedTicket = await ticket.save();
		return responseHandler.ok(res, {
			message: "Support ticket updated successfully!",
			ticket: updatedTicket,
		});
	} catch (error) {
		console.error("Error updating support ticket:", error);
		if (error.name === "CastError") {
			return responseHandler.badRequest(res, {
				message: "Invalid ticket ID format.",
			});
		}
		responseHandler.error(res);
	}
};

// @desc    Delete a support ticket
// @route   DELETE /api/support/:id
// @access  Private/Admin (only accessible by admin)
const deleteSupportTicket = async (req, res) => {
	try {
		const ticket = await Support.findByIdAndDelete(req.params.id);

		if (!ticket) {
			return responseHandler.notFound(res, "Support ticket not found.");
		}

		return responseHandler.ok(res, {
			message: "Support ticket deleted successfully!",
			ticket,
		});
	} catch (error) {
		console.error("Error deleting support ticket:", error);
		if (error.name === "CastError") {
			return res
				.status(400)
				.json({ message: "Invalid ticket ID format." });
		}
		res.status(500).json({
			message: "Server error: Could not delete support ticket.",
			error: error.message,
		});
	}
};

export default {
	createSupportTicket,
	getAllSupportTickets,
	getSupportTicketById,
	updateSupportTicket,
	deleteSupportTicket,
};
