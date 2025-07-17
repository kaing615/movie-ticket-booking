import responseHandler from "../../handlers/response.handler.js";
import Ticket from "../../models/ticket.model.js";

const DateRangeHelper = (res, start, end) => {
	// Input validation for dates
	if (!start && !end) {
		return res.status(400).json({
			success: false,
			message: "Start or end date is required.",
		});
	}

	let startDate = start ? new Date(start) : null;
	let endDate = end ? new Date(end) : null;

	if (
		(startDate && isNaN(startDate.getTime())) ||
		(endDate && isNaN(endDate.getTime()))
	) {
		return res
			.status(400)
			.json({ success: false, message: "Invalid date format." });
	}

	if (startDate && endDate && startDate > endDate) {
		return res.status(400).json({
			success: false,
			message: "Start date cannot be after end date.",
		});
	}

	// Prevent end date from being in the future relative to the current date
	const currentDate = new Date();
	currentDate.setHours(23, 59, 59, 999); // Set to end of current day for comparison

	if (endDate && endDate > currentDate) {
		return res.status(400).json({
			success: false,
			message: "End date cannot be in the future.",
		});
	}

	// Adjust dates for full day range
	if (startDate) startDate.setHours(0, 0, 0, 0);
	if (endDate) endDate.setHours(23, 59, 59, 999);

	// Default dates if only one is provided
	if (startDate && !endDate) {
		endDate = new Date(); // Today
		endDate.setHours(23, 59, 59, 999);
	}

	if (!startDate && endDate) {
		startDate = new Date("1970-01-01T00:00:00Z"); // Epoch
	}

	return { startDate, endDate };
};

const getDailyTicketCount = async (req, res) => {
	try {
		const { start, end } = req.query;
		const { startDate, endDate } = DateRangeHelper(res, start, end);
		const dailyTicketCounts = await Ticket.aggregate([
			// Stage 1: Filter tickets by date range if startDate or endDate are provided
			{
				$match: {
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
					isDeleted: false,
				},
			},
			// Stage 2: Group by the date part of the createdAt timestamp
			{
				$group: {
					_id: {
						year: { $year: "$createdAt" },
						month: { $month: "$createdAt" },
						day: { $dayOfMonth: "$createdAt" },
					},
					count: { $sum: 1 }, // Count the number of tickets in each group
				},
			},
			// Stage 3: Project to format the output (e.g., "YYYY-MM-DD")
			{
				$project: {
					_id: 0, // Exclude the default _id field
					date: {
						$dateFromParts: {
							year: "$_id.year",
							month: "$_id.month",
							day: "$_id.day",
						},
					},
					count: 1,
				},
			},
			// Stage 4: Sort the results by date in ascending order
			{
				$sort: {
					date: 1,
				},
			},
		]);

		return responseHandler.ok(res, {
			message: "Daily ticket counts retrieved successfully",
			data: dailyTicketCounts,
		});

		// res.status(200).json({
		// 	message: "Daily ticket counts retrieved successfully",
		// 	data: dailyTicketCounts,
		// });
	} catch (error) {
		console.error("Error fetching daily ticket counts:", error);
		responseHandler.error(res);
	}
};

const getDailyRevenue = async (req, res) => {
	try {
		const { start, end } = req.query;
		const { startDate, endDate } = DateRangeHelper(res, start, end);

		const dailyRevenue = await Ticket.aggregate([
			// Stage 1: Filter bookings by date range if startDate or endDate are provided
			{
				$match: {
					createdAt: {
						$gte: startDate,
						$lte: endDate,
					},
					isDeleted: false,
				},
			},
			// Stage 2: Group by the date part of the createdAt timestamp
			{
				$group: {
					_id: {
						year: { $year: "$createdAt" },
						month: { $month: "$createdAt" },
						day: { $dayOfMonth: "$createdAt" },
					},
					totalRevenue: { $sum: "$price" },
				},
			},
			// Stage 3: Project to format the output (e.g., "YYYY-MM-DD")
			{
				$project: {
					_id: 0, // Exclude the default _id field
					date: {
						$dateFromParts: {
							year: "$_id.year",
							month: "$_id.month",
							day: "$_id.day",
						},
					},
					totalRevenue: 1,
				},
			},
			// Stage 4: Sort the results by date in ascending order
			{
				$sort: {
					date: 1,
				},
			},
		]);
		return responseHandler.ok(res, {
			message: "Daily revenue retrieved successfully",
			data: dailyRevenue,
		});
	} catch (error) {
		console.error("Error fetching daily revenue:", error);
		res.status(500).json({ message: "Server error", error: error.message });
	}
};

export default {
	getDailyTicketCount,
	getDailyRevenue,
};
