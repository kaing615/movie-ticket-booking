import express from "express";
import reviewController from "../controllers/review.controller.js";
import requestHandler from "../handlers/request.handler.js";
import tokenMiddleware from "../middlewares/token.middleware.js";

const router = express.Router();

// Lấy danh sách review (không cần đăng nhập)
router.get("/:movieId", reviewController.getReviews);

// Các route dưới đây yêu cầu đăng nhập
router.use(tokenMiddleware.auth);
// phải xem phim rồi thì mới được đánh giá
router.get(
    "/:movieId/check-watched",
    reviewController.checkWatched);
// Tạo review mới
router.post(
    "/create-review/:movieId",
    // Có thể thêm validator nếu muốn
    requestHandler.validate,
    reviewController.createReview
);
// Cập nhật review (chỉ cho phép cập nhật review của chính mình)
router.put(
    "/update-review/:id",
    requestHandler.validate,
    reviewController.updateReview
);
// Xóa review (chỉ cho phép xóa review của chính mình)
router.delete(
    "/:id",
    requestHandler.validate,
    reviewController.deleteReview
);
export default router;