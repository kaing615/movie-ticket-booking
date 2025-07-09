const responseSuccess = (res, statusCode, data) => {
	res.status(statusCode).json({
		data: data,
	});
};

const responseError = (res, statusCode, message, errorDetails = null) => {
	const responseBody = {
		status: statusCode,
		message: message,
	};
	// Only include 'error' key if details are provided
	if (errorDetails) {
		responseBody.error = errorDetails;
	}
	res.status(statusCode).json(responseBody);
};

// --- Success Helpers ---
const ok = (res, data) => responseSuccess(res, 200, data);
const created = (res, data) => responseSuccess(res, 201, data);

// --- Error Helpers (Now using the new responseError helper) ---
// Fixed: Renamed to serverError to avoid confusion, and accepts actual error details
const serverError = (res, details = null) =>
	responseError(res, 500, "Oops! Something went wrong", details);

const badRequest = (res, message) => responseError(res, 400, message);

const unauthorized = (res, message) =>
	responseError(res, 401, message || "Unauthorized");

const notFound = (res, message) => {
	// This is your specifically identified function, now correctly fixed.
	responseError(res, 404, message || "Resource not found");
};

export default {
	error: serverError, // Export the fixed server error function under 'error'
	badRequest,
	ok,
	created,
	unauthorized,
	notFound,
};
