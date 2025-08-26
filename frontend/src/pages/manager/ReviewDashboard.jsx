import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { movieApi } from "../../api/modules/movie.api";
import { reviewApi } from "../../api/modules/review.api";
import { showApi } from "../../api/modules/show.api";
import { StarIcon } from "lucide-react";
import { Table, Modal, Button, Spin } from "antd";

const ReviewDashboard = () => {
  const { user } = useSelector((state) => state.auth);

  // Lấy thông tin rạp của manager
  const { data: theater, isLoading: isLoadingTheater } = useQuery({
    queryKey: ["theater", user?._id],
    queryFn: () => import("../../api/modules/theater.api").then(m => m.theaterApi.getTheaterByManagerId(user?._id)),
    enabled: !!user?._id,
  });

  // Lấy toàn bộ show của rạp này
  const { data: theaterShows, isLoading: isLoadingShows } = useQuery({
    queryKey: ["theaterShows", theater?._id],
    queryFn: () => showApi.getShowsByTheater(theater?._id),
    enabled: !!theater?._id,
  });

  // Lấy toàn bộ phim (nếu cần thông tin chi tiết)
  const { data: allMovies, isLoading: isLoadingMovies } = useQuery({
    queryKey: ["allMovies"],
    queryFn: () => movieApi.getMovies(),
  });

  // Lọc ra các movieId đã từng có show tại rạp này
  const movieIdsInTheater = useMemo(() => {
    if (!theaterShows) return [];
    const ids = new Set();
    theaterShows.forEach((show) => {
      if (show.movieId?._id || show.movieId) {
        ids.add(show.movieId._id ? show.movieId._id.toString() : show.movieId.toString());
      }
    });
    return Array.from(ids);
  }, [theaterShows]);

  // Lọc ra danh sách phim đã từng chiếu tại rạp này
  const moviesInTheater = useMemo(() => {
    if (!allMovies) return [];
    return allMovies.filter(
      (movie) =>
        movieIdsInTheater.includes(
          movie.movieId ? movie.movieId.toString() : movie._id?.toString()
        )
    );
  }, [allMovies, movieIdsInTheater]);

  // State cho modal review
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Lấy review cho phim đang chọn
  const { data: reviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ["reviews", selectedMovie?.movieId],
    queryFn: () => reviewApi.getReviews(selectedMovie?.movieId),
    enabled: !!selectedMovie,
  });

  const columns = [
    {
      title: "Tên phim",
      dataIndex: "movieName",
      render: (text, record) => (
        <span className="font-semibold">{text}</span>
      ),
    },
    {
      title: "Điểm TB",
      dataIndex: "ratingScore",
      render: (score, record) =>
        record.ratingCount > 0 ? (
          <span className="flex items-center gap-1 font-bold text-orange-600">
            <StarIcon className="w-4 h-4 text-yellow-400" />
            {(score / record.ratingCount).toFixed(1)}
          </span>
        ) : (
          <span className="text-gray-400">-</span>
        ),
    },
    {
      title: "Số lượt đánh giá",
      dataIndex: "ratingCount",
      render: (count) => <span>{count || 0}</span>,
    },
    {
      title: "Xem đánh giá",
      render: (_, record) => (
        <Button
          type="link"
          onClick={() => {
            setSelectedMovie(record);
            setModalOpen(true);
          }}
        >
          Xem chi tiết
        </Button>
      ),
    },
  ];

  if (isLoadingTheater || isLoadingShows || isLoadingMovies) {
    return <Spin />;
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Tổng hợp đánh giá phim trong rạp</h1>
      <Table
        dataSource={moviesInTheater}
        columns={columns}
        rowKey={(r) => r.movieId || r._id}
        pagination={{ pageSize: 10 }}
      />

      {/* Modal xem review chi tiết */}
      <Modal
        open={modalOpen}
        title={
            <div className="flex flex-col items-center gap-1">
            <span className="text-2xl font-bold text-blue-700 drop-shadow-sm">
                {selectedMovie?.movieName}
            </span>
            <span className="text-base text-gray-500 font-medium">
                Tổng quan đánh giá phim
            </span>
            </div>
        }
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={700}
        >
        {loadingReviews ? (
            <Spin />
        ) : (
            <div>
            <div className="mb-5 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-8 justify-center">
                <div className="flex flex-col items-center">
                <span className="text-gray-500 text-sm">Điểm trung bình</span>
                <span className="flex items-center gap-2 text-3xl font-extrabold text-orange-500 drop-shadow">
                    <StarIcon className="w-7 h-7 text-yellow-400" />
                    {selectedMovie?.ratingCount > 0
                    ? (selectedMovie.ratingScore / selectedMovie.ratingCount).toFixed(1)
                    : "--"}
                </span>
                </div>
                <div className="flex flex-col items-center">
                <span className="text-gray-500 text-sm">Số lượt đánh giá</span>
                <span className="text-2xl font-bold text-blue-600">
                    {selectedMovie?.ratingCount || 0}
                </span>
                </div>
            </div>
            <div>
                <h3 className="font-semibold mb-2 text-lg text-gray-800">Danh sách đánh giá:</h3>
                {reviews.length === 0 ? (
                <div className="text-gray-500">Chưa có đánh giá nào.</div>
                ) : (
                <ul className="space-y-3 max-h-80 overflow-y-auto">
                    {reviews.map((r) => (
                    <li key={r._id} className="border-b pb-2">
                        <div className="flex items-center gap-2">
                        <span className="font-medium text-base text-gray-900">{r.userId?.userName || "Ẩn danh"}</span>
                        <span className="flex items-center text-yellow-500 ml-2">
                            <StarIcon className="w-4 h-4" fill="#facc15" />
                            <span className="ml-1 font-bold">{r.rating}/10</span>
                        </span>
                        <span className="ml-2 text-xs text-gray-400">
                            {r.updatedAt && new Date(r.updatedAt).toLocaleString("vi-VN")}
                        </span>
                        </div>
                        <div className="text-gray-700 text-sm mt-1">{r.comment}</div>
                    </li>
                    ))}
                </ul>
                )}
            </div>
            </div>
        )}
        </Modal>
    </div>
  );
};

export default ReviewDashboard;