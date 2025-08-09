import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewApi } from "../../api/modules/review.api";
import { useSelector } from "react-redux";
import { StarIcon, PencilIcon, Trash2Icon, XIcon, CheckIcon } from "lucide-react";

const getAvatar = (name = "") => {
    if (!name) return "https://ui-avatars.com/api/?name=U";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}`;
};

const MovieReview = ({ movieId }) => {
    const { user } = useSelector((state) => state.auth);
    const queryClient = useQueryClient();

    const { data: reviews = [], isLoading } = useQuery({
        queryKey: ["reviews", movieId],
        queryFn: () => reviewApi.getReviews(movieId),
        enabled: !!movieId,
    });

    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");
    const [error, setError] = useState("");
    const [showAll, setShowAll] = useState(false);

    // State cho edit
    const [editId, setEditId] = useState(null);
    const [editRating, setEditRating] = useState(5);
    const [editComment, setEditComment] = useState("");
    const [editError, setEditError] = useState("");

    const deleteReviewMutation = useMutation({
        mutationFn: (reviewId) => reviewApi.deleteReview(reviewId),
        onSuccess: () => {
            queryClient.invalidateQueries(["reviews", movieId]);
        },
    });

    const updateReviewMutation = useMutation({
        mutationFn: ({ reviewId, data }) => reviewApi.updateReview(reviewId, data),
        onSuccess: () => {
            setEditId(null);
            setEditError("");
            queryClient.invalidateQueries(["reviews", movieId]);
        },
        onError: (err) => {
            setEditError(err?.response?.data?.message || "Có lỗi xảy ra!");
        },
    });

    const createReviewMutation = useMutation({
        mutationFn: (data) => reviewApi.createReview(movieId, data),
        onSuccess: () => {
            setComment("");
            setRating(5);
            setError("");
            queryClient.invalidateQueries(["reviews", movieId]);
        },
        onError: (err) => {
            setError(err?.response?.data?.message || "Có lỗi xảy ra!");
        },
    });

    const sortedReviews = Array.isArray(reviews)
        ? [...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        : [];

    const latestReviews = showAll ? sortedReviews : sortedReviews.slice(0, 3);

    const hasReviewed = !!sortedReviews.find(r => r.userId?._id === user?._id);

    // Khi bấm edit, set state
    const handleEdit = (review) => {
        setEditId(review._id);
        setEditRating(review.rating);
        setEditComment(review.comment);
        setEditError("");
    };

    // Khi lưu edit
    const handleEditSave = (reviewId) => {
        if (!editComment.trim()) {
            setEditError("Vui lòng nhập nhận xét!");
            return;
        }
        updateReviewMutation.mutate({
            reviewId,
            data: { rating: editRating, comment: editComment }
        });
    };

    // Khi hủy edit
    const handleEditCancel = () => {
        setEditId(null);
        setEditError("");
    };

    return (
        <div className="w-full mt-10 mb-10 bg-white rounded-xl shadow-lg py-8 px-4 sm:px-8">
            <div className="flex items-center gap-3 mb-6">
            <span className="block w-1.5 h-8 bg-gradient-to-b from-blue-500 to-orange-400 rounded-full"></span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-blue-700 tracking-tight drop-shadow-sm">
                Đánh giá phim
            </h2>
        </div>
            {/* Form review */}
            {user ? (
                hasReviewed ? (
                    <div className="mb-6 text-green-600 font-medium">
                        Bạn đã đánh giá phim này rồi.
                    </div>
                ) : (
                    <form
                        className="mb-6 flex flex-col gap-3"
                        onSubmit={e => {
                            e.preventDefault();
                            if (!comment.trim()) {
                                setError("Vui lòng nhập nhận xét!");
                                return;
                            }
                            createReviewMutation.mutate({ rating, comment });
                        }}
                    >
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700">Chấm điểm:</span>
                            {[1,2,3,4,5,6,7,8,9,10].map(num => (
                                <button
                                    type="button"
                                    key={num}
                                    className={`mx-0.5 ${rating >= num ? "text-yellow-400" : "text-gray-300"}`}
                                    onClick={() => setRating(num)}
                                    aria-label={`Đánh giá ${num} sao`}
                                >
                                    <StarIcon className="w-5 h-5" fill={rating >= num ? "#facc15" : "none"} />
                                </button>
                            ))}
                            <span className="ml-2 text-sm font-semibold text-blue-600">{rating}/10</span>
                        </div>
                        <textarea
                            className="border rounded px-3 py-2 w-full text-sm"
                            rows={3}
                            placeholder="Nhận xét của bạn về phim này..."
                            value={comment}
                            onChange={e => setComment(e.target.value)}
                        />
                        {error && <div className="text-red-500 text-sm">{error}</div>}
                        <button
                            type="submit"
                            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                            disabled={createReviewMutation.isLoading}
                        >
                            {createReviewMutation.isLoading ? "Đang gửi..." : "Gửi đánh giá"}
                        </button>
                    </form>
                )
            ) : (
                <div className="mb-6 text-gray-500">Bạn cần đăng nhập để đánh giá phim.</div>
            )}

            {/* Danh sách review */}
            <div>
            <h3 className="font-semibold mb-3 text-gray-800 text-lg">
                {showAll ? "Tất cả đánh giá" : "Các đánh giá mới nhất"}
            </h3>
            {isLoading ? (
                <div>Đang tải đánh giá...</div>
            ) : latestReviews.length === 0 ? (
                <div className="text-gray-500">Chưa có đánh giá nào.</div>
            ) : (
                <>
                    <ul className="space-y-4">
                        {latestReviews.map((review) => (
                            <li
                                key={review._id}
                                className={`flex gap-3 items-start border-b pb-3 ${
                                    editId === review._id ? "bg-blue-50/60 rounded-lg px-2 py-2" : ""
                                }`}
                            >
                                <img
                                    src={getAvatar(review.userId?.name)}
                                    alt={review.userId?.name}
                                    className="w-10 h-10 rounded-full object-cover border shadow"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-semibold text-gray-900 text-base">
                                            {review.userId?.userName || "Ẩn danh"}
                                        </span>
                                        <span className="flex items-center text-yellow-500 ml-2">
                                            <StarIcon className="w-5 h-5" fill="#facc15" />
                                            <span className="ml-1 text-base font-bold text-orange-500 drop-shadow">
                                                {review.rating}/10
                                            </span>
                                        </span>
                                        {/* Nút edit/xóa nếu là review của mình */}
                                        {user && review.userId?._id === user._id && (
                                            <span className="flex gap-1 ml-2">
                                                {editId === review._id ? (
                                                    <>
                                                        <button
                                                            className="p-1 rounded hover:bg-gray-200"
                                                            title="Hủy"
                                                            onClick={handleEditCancel}
                                                        >
                                                            <XIcon className="w-4 h-4 text-gray-400" />
                                                        </button>
                                                        <button
                                                            className="p-1 rounded hover:bg-gray-200"
                                                            title="Lưu"
                                                            onClick={() => handleEditSave(review._id)}
                                                            disabled={updateReviewMutation.isLoading}
                                                        >
                                                            <CheckIcon className="w-4 h-4 text-green-600" />
                                                        </button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <button
                                                            className="p-1 rounded hover:bg-gray-100"
                                                            title="Sửa đánh giá"
                                                            onClick={() => handleEdit(review)}
                                                        >
                                                            <PencilIcon className="w-4 h-4 text-blue-500" />
                                                        </button>
                                                        <button
                                                            className="p-1 rounded hover:bg-gray-100"
                                                            title="Xóa đánh giá"
                                                            onClick={() => {
                                                                if (window.confirm("Bạn chắc chắn muốn xóa đánh giá này?")) {
                                                                    deleteReviewMutation.mutate(review._id);
                                                                }
                                                            }}
                                                        >
                                                            <Trash2Icon className="w-4 h-4 text-red-500" />
                                                        </button>
                                                    </>
                                                )}
                                            </span>
                                        )}
                                    </div>
                                    {editId === review._id ? (
                                        <div className="mt-2">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-xs text-gray-700">Chấm điểm:</span>
                                                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                                                    <button
                                                        type="button"
                                                        key={num}
                                                        className={`mx-0.5 ${editRating >= num ? "text-yellow-400" : "text-gray-300"}`}
                                                        onClick={() => setEditRating(num)}
                                                        aria-label={`Đánh giá ${num} sao`}
                                                    >
                                                        <StarIcon className="w-4 h-4" fill={editRating >= num ? "#facc15" : "none"} />
                                                    </button>
                                                ))}
                                                <span className="ml-2 text-xs font-semibold text-blue-600">{editRating}/10</span>
                                            </div>
                                            <textarea
                                                className="border rounded px-3 py-2 w-full text-sm bg-white"
                                                rows={2}
                                                value={editComment}
                                                onChange={e => setEditComment(e.target.value)}
                                            />
                                            {editError && <div className="text-red-500 text-xs mt-1">{editError}</div>}
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-gray-700 text-sm mt-1">{review.comment}</div>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {review.updatedAt && new Date(review.updatedAt).toLocaleString("vi-VN")}
                                            </div>
                                        </>
                                    )}
                                </div>
                            </li>
                        ))}
                    </ul>
                    {sortedReviews.length > 5 && (
                        <div className="flex justify-center mt-4">
                            <button
                                className="text-blue-600 hover:underline font-medium"
                                onClick={() => setShowAll(!showAll)}
                            >
                                {showAll ? "Ẩn bớt" : "Xem thêm"}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
        </div>
    );
};

export default MovieReview;