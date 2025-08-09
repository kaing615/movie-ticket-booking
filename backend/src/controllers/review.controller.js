import responseHandler from "../handlers/response.handler.js";
import Review from "../models/review.model.js";

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
            return responseHandler.badRequest(res, "Bạn đã đánh giá phim này rồi!");
        }

        const review = new Review({ userId, movieId, rating, comment });
        await review.save();

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
            return responseHandler.forbidden(res, "Bạn không có quyền sửa đánh giá này!");
        }
        if (typeof rating !== "undefined") review.rating = rating;
        if (typeof comment !== "undefined") review.comment = comment;
        await review.save();
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
            return responseHandler.forbidden(res, "Bạn không có quyền xóa đánh giá này!");
        }
        await review.deleteOne();
        responseHandler.ok(res, { message: "Xóa đánh giá thành công!" });
    } catch (err) {
        responseHandler.error(res, err.message);
    }
};

export default {
    createReview,
    getReviews,
    updateReview,
    deleteReview,
};