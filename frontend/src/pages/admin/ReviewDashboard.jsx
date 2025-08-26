import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { movieApi } from "../../api/modules/movie.api";
import { reviewApi } from "../../api/modules/review.api";
import { StarIcon } from "lucide-react";
import { Table, Modal, Button, Spin } from "antd";

const ReviewDashboard = () => {
  // Lấy toàn bộ phim
  const { data: allMovies, isLoading: isLoadingMovies } = useQuery({
    queryKey: ["allMovies"],
    queryFn: () => movieApi.getMovies(),
  });

  console.log("allMovies", allMovies);

  // Lấy review tổng hợp cho tất cả phim
  const { data: allReviews = [], isLoading: isLoadingReviews } = useQuery({
    queryKey: ["allReviews"],
    queryFn: () => reviewApi.getAllReviews(), // API trả về tất cả review, mỗi review có movieId
  });

  console.log("allReviews", allReviews);

  // Tính điểm TB và số lượt cho từng phim
  const calculateRatings = (movies, reviews) => {
    const grouped = reviews.reduce((acc, r) => {
      const id = r.movieId?._id || r.movieId; // đề phòng API trả về dạng object hoặc string
      if (!acc[id]) {
        acc[id] = { total: 0, count: 0 };
      }
      acc[id].total += r.rating;
      acc[id].count += 1;
      return acc;
    }, {});

    return movies.map((m) => {
      const id = m._id || m.movieId;
      const stats = grouped[id];
      if (stats) {
        return {
          ...m,
          ratingCount: stats.count,
          ratingScore: stats.total / stats.count, // giữ số thực, render sẽ format
        };
      }
      return { ...m, ratingCount: 0, ratingScore: 0 };
    });
  };

  // Tạo dataSource cho Table
  const moviesWithStats = useMemo(
    () => calculateRatings(allMovies, allReviews),
    [allMovies, allReviews]
  );

  // State cho modal review
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  // Lấy review cho phim đang chọn
  // Lấy review cho phim đang chọn
  const reviews = useMemo(() => {
  if (!selectedMovie) return [];
    const selectedId = selectedMovie._id?.toString() || selectedMovie.movieId?.toString();
    return allReviews.filter((r) => {
      const rid = r.movieId?._id?.toString() || r.movieId?.toString();
      return rid === selectedId;
    });
  }, [selectedMovie, allReviews]);

  console.log("reviews for selected movie", reviews);
  console.log("selectedMovie", selectedMovie);
  const columns = [
    {
      title: "Tên phim",
      dataIndex: "movieName",
      render: (text, record) => <span className="font-semibold">{text}</span>,
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

  if (isLoadingMovies || isLoadingReviews) {
    return <Spin />;
  }

  console.log("moviesWithStats", moviesWithStats);


  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">Tổng hợp đánh giá phim</h1>
      <Table
        dataSource={moviesWithStats}
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
          </div>
        }
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={700}
      >
        {isLoadingReviews ? (
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
              <h3 className="flex items-center gap-2 mb-4 text-xl font-bold text-orange-600 tracking-wide uppercase">
          
                Danh sách các đánh giá
                <span className="ml-2 text-base font-medium text-gray-400">
                  ({reviews.length} đánh giá)
                </span>
              </h3>
              {reviews.length === 0 ? (
                <div className="text-gray-500">Chưa có đánh giá nào.</div>
              ) : (
                <ul className="space-y-3 max-h-80 overflow-y-auto">
                  {reviews.map((r) => (
                    <li key={r._id} className="border-b pb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-base text-gray-900">
                          {r.userId?.userName || "Ẩn danh"}
                        </span>
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