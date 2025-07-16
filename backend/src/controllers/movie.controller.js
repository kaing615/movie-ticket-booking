import responseHandler from "../handlers/response.handler.js";
import Movie from "../models/movie.model.js";

export const getMovies = async (req, res) => {
  try {
    const { status, genre } = req.query;
    let filter = {};
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

		return responseHandler.success(res, {
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
    const newMovie = new Movie(req.body);
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
    const deleted = await Movie.findByIdAndDelete(req.params.id);
    if (!deleted) return responseHandler.notFound(res, "Phim không tồn tại!");
    responseHandler.ok(res, { message: "Xóa phim thành công!" });
  } catch (err) {
    responseHandler.error(res, err.message);
  }
};
export const updateMovie = async (req, res) => {
  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!updatedMovie)
      return responseHandler.notFound(res, "Phim không tồn tại!");
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
  getMovieById,
  createMovie,
  deleteMovie, 
  updateMovie
}