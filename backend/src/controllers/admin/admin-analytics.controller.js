import mongoose from "mongoose";
import responseHandler from "../../handlers/response.handler.js";
import Ticket from "../../models/ticket.model.js";
import User from "../../models/user.model.js";
import TheaterSystem from "../../models/theaterSystem.model.js";

const DateRangeHelper = (start, end) => {
	// Input validation for dates
	if (!start || !end) {
		// Throw an error that the caller can catch and handle (e.g., send 400)
		throw new Error("Start date or end date is required.");
	}

	let startDate = start ? new Date(start) : null;
	let endDate = end ? new Date(end) : null;

	if (
		(startDate && isNaN(startDate.getTime())) ||
		(endDate && isNaN(endDate.getTime()))
	) {
		throw new Error(
			"Invalid date format. Please use a valid date string (e.g., YYYY-MM-DD)."
		);
	}

	if (startDate && endDate && startDate > endDate) {
		throw new Error("Start date cannot be after end date.");
	}

	// Prevent end date from being in the future relative to the current date
	const currentDate = new Date();
	// Ensure comparison is accurate to the end of the current day
	currentDate.setHours(23, 59, 59, 999);

	if (endDate && endDate > currentDate) {
		throw new Error("End date cannot be in the future.");
	}

	// Adjust dates for full day range
	// Set startDate to the beginning of the day (00:00:00.000)
	if (startDate) startDate.setHours(0, 0, 0, 0);
	// Set endDate to the end of the day (23:59:59.999)
	if (endDate) endDate.setHours(23, 59, 59, 999);

	// Default dates if only one is provided
	if (startDate && !endDate) {
		// If only startDate is provided, endDate defaults to today (end of day)
		endDate = new Date();
		endDate.setHours(23, 59, 59, 999);
	}

	if (!startDate && endDate) {
		// If only endDate is provided, startDate defaults to Epoch (beginning of time)
		startDate = new Date("1970-01-01T00:00:00Z"); // Epoch
	}

	return { startDate, endDate };
};

const getDailyTicketCount = async (req, res) => {
	try {
		const { start, end } = req.query;
		const { startDate, endDate } = DateRangeHelper(start, end);
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
	} catch (error) {
		console.error("Error fetching daily ticket counts:", error);
		responseHandler.error(res, error.message || "Internal server error");
	}
};

const getDailyRevenue = async (req, res) => {
	try {
		const { start, end } = req.query;
		const { startDate, endDate } = DateRangeHelper(start, end);

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
					dailyTotalRevenue: { $sum: "$price" },
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
					dailyTotalRevenue: 1,
				},
			},
			// Stage 4: Sort the results by date in ascending order
			{
				$sort: {
					date: 1,
				},
			},
			// Stage 5: Calculate the overall revenue
			{
				$group: {
					_id: null,
					dailyRevenue: { $push: "$$ROOT" },
					overallTotalRevenue: { $sum: "$dailyTotalRevenue" },
				},
			},
			// Stage 6: Project to format the output (e.g., "YYYY-MM-DD")
			{
				$project: {
					_id: 0, // Exclude the default _id field
					dailyRevenue: 1,
					overallTotalRevenue: 1,
				},
			},
		]);
		return responseHandler.ok(res, {
			message: "Daily revenue retrieved successfully",
			data: dailyRevenue,
		});
	} catch (error) {
		console.error("Error fetching daily revenue:", error);
		responseHandler.error(res, error.message || "Unknown server error.");
	}
};

export const getUserCountByRole = async (req, res) => {
	try {
		const userCountsByRole = await User.aggregate([
			// Stage 1: Group by the 'role' field
			{
				$group: {
					_id: "$role", // Group by the value of the 'role' field
					count: { $sum: 1 }, // Count the number of users in each role
				},
			},
			// Stage 2: Project to rename _id to role for cleaner output
			{
				$project: {
					_id: 0, // Exclude the default _id field
					role: "$_id", // Rename _id to role
					count: 1, // Include the count
				},
			},
			// Stage 3: Sort the results by role name (optional)
			{
				$sort: {
					role: 1,
				},
			},
		]);

		return responseHandler.ok(res, {
			message: "User counts by role retrieved successfully",
			data: userCountsByRole,
		});
	} catch (error) {
		console.error("Error fetching user counts by role:", error);
		responseHandler.error(res, error.message || "Unknown server error.");
	}
};

// ==========================
// Lấy danh sách rạp nhóm theo hệ thống
const aggregateTheatersBySystem = async () => {
	try {
		const pipeline = [
			{ $match: { isDeleted: false } },
			{
				$group: {
					_id: "$theaterSystemId",
					theaters: {
						$push: {
							_id: "$_id",
							managerId: "$managerId",
							theaterName: "$theaterName",
							location: "$location",
						},
					},
					theaterCount: { $sum: 1 },
				},
			},
			{
				$lookup: {
					from: TheaterSystem.collection.name,
					localField: "_id",
					foreignField: "_id",
					as: "systemInfo",
				},
			},
			{
				$unwind: {
					path: "$systemInfo",
					preserveNullAndEmptyArrays: true,
				},
			},
			{
				$project: {
					_id: 0,
					theaterSystemId: "$_id",
					theaterSystemName: "$systemInfo.name",
					theaterSystemCode: "$systemInfo.code",
					theaterSystemLogo: "$systemInfo.logo",
					theaters: "$theaters",
					totalTheaters: "$theaterCount",
				},
			},
		];

		const aggregatedTheaters = await mongoose
			.model("Theater")
			.aggregate(pipeline);
		return aggregatedTheaters;
	} catch (error) {
		console.error("Error aggregating theaters by system:", error);
		throw error;
	}
};

const getTheaterBySystem = async (req, res) => {
	try {
		const theaters = await aggregateTheatersBySystem();
		return responseHandler.ok(res, { theaters });
	} catch (error) {
		console.error("Lỗi lấy danh sách rạp theo hệ thống:", error);
		return responseHandler.serverError(
			res,
			error.message || "Unknown server error."
		);
	}
};

export default {
	getDailyTicketCount,
	getDailyRevenue,
	getUserCountByRole,
	getTheaterBySystem,
};
