import responseHandler from "../handlers/response.handler.js";
import Review from "../models/review.model.js";
import Show from "../models/show.model.js";
import Ticket from "../models/ticket.model.js";
import Movie from "../models/movie.model.js";

const updateMovieRating = async (movieId) => {
    const reviews = await Review.find({ movieId });
    const totalScore = reviews.reduce((sum, review) => sum + review.rating, 0);
    const avgScore = reviews.length > 0 ? totalScore / reviews.length : 0;

    await Movie.findByIdAndUpdate(movieId, {
        ratingScore: Number(avgScore.toFixed(2)),
        ratingCount: reviews.length
    });
};

export const createReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const { movieId } = req.params;
        const userId = req.user._id;

        if (!movieId) {
            return responseHandler.badRequest(res, "Thiếu movieId!");
        }

        // Kiểm tra đã review chưa (1 user chỉ review 1 lần cho 1 phim)
        const existed = await Review.findOne({ userId, movieId });
        if (existed) {
            return responseHandler.ok(res, "Bạn đã đánh giá phim này rồi!");
        }

        // Tìm tất cả các show của phim này
        const shows = await Show.find({ movieId });
        const showIds = shows.map(show => show._id);

        // Kiểm tra xem user đã xem phim chưa (có ticket status = used)
        const hasWatched = await Ticket.exists({
            ownerId: userId,
            showId: { $in: showIds },
            status: "used"
        });

        if (!hasWatched) {
            return responseHandler.ok(res, 
                "Bạn cần xem phim trước khi đánh giá!"
            );
        }

        const review = new Review({ userId, movieId, rating, comment });
        await review.save();

        // Update movie rating after creating review
        await updateMovieRating(movieId);

        responseHandler.created(res, {
            message: "Đánh giá thành công!",
            review,
        });
    } catch (err) {
        responseHandler.error(res, err.message);
    }
};

export const getReviews = async (req, res) => {
    try {
        const { movieId } = req.params;
        const filter = movieId ? { movieId } : {};
        const reviews = await Review.find(filter)
            .populate("userId", "userName email")
            .populate("movieId", "movieName");
        responseHandler.ok(res, {
            message: "Lấy danh sách đánh giá thành công!",
            reviews,
        });
    } catch (err) {
        responseHandler.error(res, err.message);
    }
};

export const updateReview = async (req, res) => {
    try {
        const { rating, comment } = req.body;
        const review = await Review.findById(req.params.id);
        if (!review) return responseHandler.notFound(res, "Đánh giá không tồn tại!");
        // Chỉ cho phép update review của chính mình
        if (review.userId.toString() !== req.user._id.toString()) {
            return responseHandler.badRequest(res, "Bạn không có quyền sửa đánh giá này!");
        }
        const oldRating = review.rating;

        if (typeof rating !== "undefined") review.rating = rating;
        if (typeof comment !== "undefined") review.comment = comment;
        await review.save();

        // Update movie rating if rating changed
        if (oldRating !== rating) {
            await updateMovieRating(review.movieId);
        }

        responseHandler.ok(res, {
            message: "Cập nhật đánh giá thành công!",
            review,
        });
    } catch (err) {
        responseHandler.error(res, err.message);
    }
};

export const deleteReview = async (req, res) => {
    try {
        const review = await Review.findById(req.params.id);
        if (!review) return responseHandler.notFound(res, "Đánh giá không tồn tại!");
        // Chỉ cho phép xóa review của chính mình
        if (review.userId.toString() !== req.user._id.toString()) {
            return responseHandler.badRequest(res, "Bạn không có quyền xóa đánh giá này!");
        }
        const movieId = review.movieId;
        await review.deleteOne();
        // Update movie rating after deleting review
        await updateMovieRating(movieId);
        responseHandler.ok(res, { message: "Xóa đánh giá thành công!" });
    } catch (err) {
        responseHandler.error(res, err.message);
    }
};

export const checkWatched = async (req, res) => {
    try {
        const userId = req.user._id;
        const { movieId } = req.params;

        // Tìm tất cả các show của phim này
        const shows = await Show.find({ movieId });
        const showIds = shows.map(show => show._id);

        // Kiểm tra xem user đã xem phim chưa (có ticket status = used)
        const hasWatched = await Ticket.exists({
            ownerId: userId,
            showId: { $in: showIds },
            status: "used"
        });

        responseHandler.ok(res, {
            hasWatched: !!hasWatched
        });
    } catch (err) {
        responseHandler.error(res, err.message);
    }
};


export default {
    createReview,
    getReviews,
    updateReview,
    deleteReview,
    checkWatched
};