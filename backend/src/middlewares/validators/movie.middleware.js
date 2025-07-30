import { body, param } from "express-validator";

const movieIdValidator = [
	param("id").isMongoId().withMessage("Invalid movie ID."),
];
// Middleware to validate movie creation data
const createMovieValidation = [
	// movieName validation
	body("movieName")
		.notEmpty()
		.withMessage("Movie name is required.")
		.isString()
		.withMessage("Movie name must be a string.")
		.trim()
		.isLength({ min: 2, max: 255 })
		.withMessage("Movie name must be between 2 and 255 characters."),

	// description validation
	body("description")
		.notEmpty()
		.withMessage("Description is required.")
		.isString()
		.withMessage("Description must be a string.")
		.trim()
		.isLength({ min: 10 })
		.withMessage("Description must be at least 10 characters long."),

	// genres validation
	body("genres")
		.notEmpty()
		.withMessage("Genres are required.")
		.isArray()
		.withMessage("Genres must be an array.")
		.custom((value) => {
			if (!Array.isArray(value) || value.length === 0) {
				throw new Error("Genres array cannot be empty.");
			}
			for (const genre of value) {
				if (typeof genre !== "string" || genre.trim() === "") {
					throw new Error("Each genre must be a non-empty string.");
				}
			}
			return true;
		}),

	// duration validation
	body("duration")
		.notEmpty()
		.withMessage("Duration is required.")
		.isInt({ min: 1 })
		.withMessage(
			"Duration must be a positive integer representing minutes."
		),

	// releaseDate validation
	body("releaseDate")
		.notEmpty()
		.withMessage("Release date is required.")
		.isISO8601()
		.withMessage(
			"Release date must be a valid ISO 8601 date string (e.g., YYYY-MM-DD)."
		)
		.toDate(), // Converts the string to a Date object

	// country validation
	body("country")
		.notEmpty()
		.withMessage("Country is required.")
		.isString()
		.withMessage("Country must be a string.")
		.trim(),

	// poster validation
	body("poster")
		.notEmpty()
		.withMessage("Poster URL is required.")
		.isURL()
		.withMessage("Poster must be a valid URL."),

	// banner validation
	body("banner")
		.notEmpty()
		.withMessage("Banner URL is required.")
		.isURL()
		.withMessage("Banner must be a valid URL."),

	// movieRating validation
	body("movieRating")
		.notEmpty()
		.withMessage("Movie rating is required.")
		.isIn(["P", "K", "T13", "T16", "T18"])
		.withMessage("Invalid movie rating. Must be P, K, T13, T16, or T18."),

	// status validation (optional as it has a default)
	body("status")
		.optional() // Allows the field to be absent
		.isIn(["coming", "showing", "ended"])
		.withMessage(
			"Invalid movie status. Must be Coming Soon, Now Showing, or Ended."
		),

	// director validation
	body("director")
		.notEmpty()
		.withMessage("Director is required.")
		.isString()
		.withMessage("Director must be a string.")
		.trim(),

	// trailer validation
	body("trailer")
		.notEmpty()
		.withMessage("Trailer URL is required.")
		.isURL()
		.withMessage("Trailer must be a valid URL."),

	// allowedShowStart validation
	body("allowedShowStart")
		.notEmpty()
		.withMessage("Allowed show start date is required.")
		.isISO8601()
		.withMessage(
			"Allowed show start date must be a valid ISO 8601 date string (e.g., YYYY-MM-DD)."
		)
		.toDate(), // Converts the string to a Date object
];

const updateMovieValidation = [
	param("id").isMongoId().withMessage("Invalid movie ID."),
	// movieName validation (optional)
	body("movieName")
		.optional() // Field is optional for update
		.isString()
		.withMessage("Movie name must be a string.")
		.trim()
		.isLength({ min: 2, max: 255 })
		.withMessage("Movie name must be between 2 and 255 characters."),

	// description validation (optional)
	body("description")
		.optional()
		.isString()
		.withMessage("Description must be a string.")
		.trim()
		.isLength({ min: 10 })
		.withMessage("Description must be at least 10 characters long."),

	// genres validation (optional)
	body("genres")
		.optional()
		.isArray()
		.withMessage("Genres must be an array.")
		.custom((value) => {
			if (!Array.isArray(value) || value.length === 0) {
				// If genres array is provided but empty, it's an error.
				// If not provided (due to optional()), this check won't run.
				throw new Error("Genres array cannot be empty if provided.");
			}
			for (const genre of value) {
				if (typeof genre !== "string" || genre.trim() === "") {
					throw new Error(
						"Each genre must be a non-empty string if provided."
					);
				}
			}
			return true;
		}),

	// duration validation (optional)
	body("duration")
		.optional()
		.isInt({ min: 1 })
		.withMessage(
			"Duration must be a positive integer representing minutes."
		),

	// releaseDate validation (optional)
	body("releaseDate")
		.optional()
		.isISO8601()
		.withMessage(
			"Release date must be a valid ISO 8601 date string (e.g., YYYY-MM-DD)."
		)
		.toDate(),

	// country validation (optional)
	body("country")
		.optional()
		.isString()
		.withMessage("Country must be a string.")
		.trim(),

	// poster validation (optional)
	body("poster")
		.optional()
		.isURL()
		.withMessage("Poster must be a valid URL."),

	// banner validation (optional)
	body("banner")
		.optional()
		.isURL()
		.withMessage("Banner must be a valid URL."),

	// movieRating validation (optional)
	body("movieRating")
		.optional()
		.isIn(["P", "K", "T13", "T16", "T18"])
		.withMessage("Invalid movie rating. Must be P, K, T13, T16, or T18."),

	// status validation (optional)
	body("status")
		.optional()
		.isIn(["coming", "showing", "ended"])
		.withMessage(
			"Invalid movie status. Must be Coming Soon, Now Showing, or Ended."
		),

	// director validation (optional)
	body("director")
		.optional()
		.isString()
		.withMessage("Director must be a string.")
		.trim(),

	// trailer validation (optional)
	body("trailer")
		.optional()
		.isURL()
		.withMessage("Trailer must be a valid URL."),

	// allowedShowStart validation (optional)
	body("allowedShowStart")
		.optional()
		.isISO8601()
		.withMessage(
			"Allowed show start date must be a valid ISO 8601 date string (e.g., YYYY-MM-DD)."
		)
		.toDate(),
];

export default {
	movieIdValidator,
	createMovieValidation,
	updateMovieValidation,
};
