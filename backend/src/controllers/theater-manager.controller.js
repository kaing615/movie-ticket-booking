import responseHandler from "../handlers/response.handler.js";
import Movie from "../models/movie.model.js"; 


// Thêm phim mới
const addMovie = async (req, res) => {
  try {
    const { movieName, description, genre, duration, releaseDate, poster, movieRating } = req.body;

    const newMovie = new Movie({
      movieName,
      description,
      genre,
      duration,
      releaseDate,
      poster,
      movieRating,
      theaterManagerId: req.user._id, // Lưu ID của theater manager
    });

    await newMovie.save();
    return responseHandler.created(res, { message: "Thêm phim thành công!", movie: newMovie });
  } catch (err) {
    console.error("Lỗi thêm phim:", err);
    responseHandler.error(res);
  }
};

// Cập nhật thông tin phim
 const updateMovie = async (req, res) => {
  try {
    const { movieId } = req.params;
    const { movieName, description, genre, duration, releaseDate, poster, movieRating } = req.body;

    const movie = await Movie.findOne({ _id: movieId });
    if (!movie) return responseHandler.notFound(res, "Không tìm thấy phim.");

    movie.movieName = movieName || movie.movieName;
    movie.description = description || movie.description;
    movie.genre = genre || movie.genre;
    movie.duration = duration || movie.duration;
    movie.releaseDate = releaseDate || movie.releaseDate;
    movie.poster = poster || movie.poster;
    movie.movieRating = movieRating || movie.movieRating;

    await movie.save();
    return responseHandler.ok(res, { message: "Cập nhật phim thành công!", movie });
  } catch (err) {
    console.error("Lỗi cập nhật phim:", err);
    responseHandler.error(res);
  }
};

// Xóa phim (soft delete)
const deleteMovie = async (req, res) => {
  try {
    const { movieId } = req.params;

    const movie = await Movie.findOne({ _id: movieId});
    if (!movie) return responseHandler.notFound(res, "Không tìm thấy phim.");

    movie.isDeleted = true;
    await Movie.deleteOne({ _id: movieId });

    return responseHandler.ok(res, { message: "Xóa phim thành công!" });
  } catch (err) {
    console.error("Lỗi xóa phim:", err);
    responseHandler.error(res);
  }
};


export default {
  addMovie,
  updateMovie,
  deleteMovie
};
