import responseHandler from "../handlers/response.handler.js";
import Movie from "../models/movie.model.js";

export const getMovies = async (req, res) => {
	try {
		const { status, genre } = req.query;
		let filter = { isDeleted: false };
		if (status) filter.status = status;
		if (genre) filter.genres = genre;

		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const skip = (page - 1) * limit;

		const movies = await Movie.find(filter).skip(skip).limit(limit);
		const total = await Movie.countDocuments(filter);

		const moviesWithId = movies.map((movie) => {
			const obj = movie.toObject();
			obj.movieId = obj._id;
			delete obj._id;
			delete obj.__v;
			return obj;
		});

		return responseHandler.ok(res, {
			message: "Lấy danh sách phim thành công!",
			total,
			page,
			limit,
			movies: moviesWithId,
		});
	} catch (err) {
		console.error("Error fetching movies:", err);
		responseHandler.error(res, err.message);
	}
};

export const createMovie = async (req, res) => {
	try {
		const {
			movieName,
			description,
			genres,
			duration,
			releaseDate,
			country,
			poster,
			banner,
			movieRating,
			status,
			director,
			trailer,
			allowedShowStart,
		} = req.body;

		const newMovie = new Movie({
			movieName,
			description,
			genres,
			duration,
			releaseDate,
			country,
			poster,
			banner,
			movieRating,
			status,
			director,
			trailer,
			allowedShowStart,
		});
		await newMovie.save();
		return responseHandler.created(res, {
			message: "Thêm phim mới thành công!",
			movie: newMovie,
		});
	} catch (err) {
		console.error("Error creating movie:", err);
		responseHandler.error(res, err.message);
	}
};

export const deleteMovie = async (req, res) => {
	try {
		const deletedMovie = await Movie.findById(req.params.id);
		if (!deletedMovie || deletedMovie.isDeleted)
			return responseHandler.notFound(
				res,
				"Phim không tồn tại hoặc đã bị xóa."
			);
		deletedMovie.isDeleted = true;
		await deletedMovie.save();
		responseHandler.ok(res, { message: "Xóa phim thành công!" });
	} catch (err) {
		responseHandler.error(res, err.message);
	}
};
export const updateMovie = async (req, res) => {
	try {
		const {
			movieName,
			description,
			genres,
			duration,
			releaseDate,
			country,
			poster,
			banner,
			movieRating,
			status,
			director,
			trailer,
			allowedShowStart,
		} = req.body;

		const updatedMovie = await Movie.findById(req.params.id);
		if (!updatedMovie || updatedMovie.isDeleted)
			return responseHandler.notFound(res, "Phim không tồn tại!");

		if (movieName) updatedMovie.movieName = movieName;
		if (description) updatedMovie.description = description;
		if (genres) updatedMovie.genres = genres;
		if (duration) updatedMovie.duration = duration;
		if (releaseDate) updatedMovie.releaseDate = releaseDate;
		if (country) updatedMovie.country = country;
		if (poster) updatedMovie.poster = poster;
		if (banner) updatedMovie.banner = banner;
		if (movieRating) updatedMovie.movieRating = movieRating;
		if (status) updatedMovie.status = status;
		if (director) updatedMovie.director = director;
		if (trailer) updatedMovie.trailer = trailer;
		if (allowedShowStart) updatedMovie.allowedShowStart = allowedShowStart;

		await updatedMovie.save();

		responseHandler.ok(res, {
			message: "Cập nhật phim thành công!",
			movie: updatedMovie,
		});
	} catch (err) {
		console.error("Error updating movie:", err);
		responseHandler.error(res, err.message);
	}
};

export const getMovieById = async (req, res) => {
	try {
		const movie = await Movie.findById(req.params.id);
		if (!movie) return responseHandler.notFound(res, "Phim không tồn tại!");
		responseHandler.ok(res, {
			message: "Lấy thông tin phim thành công!",
			movie,
		});
	} catch (err) {
		console.error("Error fetching movie by ID:", err);
		responseHandler.error(res, err.message);
	}
};

export default {
	getMovies,
	createMovie,
	deleteMovie,
	updateMovie,
	getMovieById,
};
