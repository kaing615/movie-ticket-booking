import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { theaterSystemApi } from "../../api/modules/theaterSystem.api.js";
import { theaterApi } from "../../api/modules/theater.api.js";
import { showApi } from "../../api/modules/show.api.js";

const ShowManagement = () => {
  const [systemId, setSystemId] = useState("");
  const [theaterId, setTheaterId] = useState("");

  // Lấy danh sách hệ thống rạp
  const { data: theaterSystems } = useQuery({
    queryFn: () => theaterSystemApi.getAllTheaterSystems(),
    queryKey: ["theaterSystems"],
  });

  // Lấy danh sách rạp khi chọn hệ thống rạp
  const { data: theaters } = useQuery({
    queryFn: () => theaterApi.getTheater(systemId),
    queryKey: ["theaters", systemId],
    enabled: !!systemId,
  });

  // Lấy danh sách lịch chiếu khi chọn rạp
  const { data: showtimes, isLoading, error } = useQuery({
    queryFn: () => showApi.getShowsByTheater(theaterId),
    queryKey: ["showtimes", theaterId],
    enabled: !!theaterId,
  });

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="font-bold text-2xl text-indigo-700 mb-6 tracking-wide">
        🎬 Quản lý lịch chiếu phim theo rạp
      </h1>

      {/* Card chọn hệ thống rạp và rạp */}
      <div className="bg-white shadow-md rounded-2xl p-6 mb-8 flex flex-col md:flex-row md:items-center gap-6">
        {/* Chọn hệ thống rạp */}
        <div>
          <label className="block font-semibold mb-1 text-gray-700">
            Hệ thống rạp
          </label>
          <select
            value={systemId}
            onChange={e => {
              setSystemId(e.target.value);
              setTheaterId("");
            }}
            className="w-56 px-2 py-2 border rounded-lg outline-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-gray-50"
          >
            <option value="">Chọn hệ thống rạp</option>
            {theaterSystems?.map(sys => (
              <option key={sys._id} value={sys._id}>
                {sys.name}
              </option>
            ))}
          </select>
        </div>

        {/* Chọn rạp */}
        {systemId && (
          <div>
            <label className="block font-semibold mb-1 text-gray-700">
              Rạp
            </label>
            <select
              value={theaterId}
              onChange={e => setTheaterId(e.target.value)}
              className="w-56 px-2 py-2 border rounded-lg outline-indigo-400 focus:ring-2 focus:ring-indigo-200 bg-gray-50"
            >
              <option value="">Chọn rạp</option>
              {theaters?.map(theater => (
                <option key={theater._id} value={theater._id}>
                  {theater.theaterName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Danh sách lịch chiếu */}
      {theaterId && (
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4 text-indigo-600 flex items-center gap-2">
            <span>Danh sách lịch chiếu</span>
            <span className="font-normal text-gray-500 text-base">
              ({theaters?.find(t => t._id === theaterId)?.theaterName || ""})
            </span>
          </h3>
          {isLoading ? (
            <div className="text-gray-500">Đang tải lịch chiếu...</div>
          ) : error ? (
            <div className="text-red-500">Lỗi khi tải lịch chiếu!</div>
          ) : !showtimes || showtimes.length === 0 ? (
            <div>Chưa có lịch chiếu nào.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-indigo-100 text-indigo-800">
                    <th className="p-3 border">Phim</th>
                    <th className="p-3 border">Phòng</th>
                    <th className="p-3 border">Thời gian bắt đầu</th>
                    <th className="p-3 border">Thời gian kết thúc</th>
                    <th className="p-3 border">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {showtimes.map((show) => (
                    <tr
                      key={show._id}
                      className="hover:bg-indigo-50 transition"
                    >
                      <td className="p-3 border font-medium">{show.movieId?.movieName || "?"}</td>
                      <td className="p-3 border">{show.roomId?.roomNumber || "?"}</td>
                      <td className="p-3 border">
                        {show.startTime
                          ? new Date(show.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
                            " " +
                            new Date(show.startTime).toLocaleDateString("vi-VN")
                          : ""}
                      </td>
                      <td className="p-3 border">
                        {show.endTime
                          ? new Date(show.endTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) +
                            " " +
                            new Date(show.endTime).toLocaleDateString("vi-VN")
                          : ""}
                      </td>
                      <td className="p-3 border capitalize">{show.status || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShowManagement;
