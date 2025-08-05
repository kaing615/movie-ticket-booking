import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { theaterApi } from "../../api/modules/theater.api";
import { theaterSystemApi } from "../../api/modules/theaterSystem.api";
import { showApi } from "../../api/modules/show.api";
import { AnimatePresence, motion } from "framer-motion";

const TheaterSystem = () => {
  const { id: theaterSystemId } = useParams();
  const [selectedTheaterId, setSelectedTheaterId] = useState("");

  // Lấy danh sách rạp thuộc hệ thống này
  const { data: theaters, isLoading: theatersLoading } = useQuery({
    queryKey: ["theaters-by-system", theaterSystemId],
    queryFn: () => theaterApi.getTheater(theaterSystemId),
    enabled: !!theaterSystemId,
  });

  // Lấy lịch chiếu của rạp đã chọn
  const { data: shows, isLoading: showsLoading } = useQuery({
    queryKey: ["shows", selectedTheaterId],
    queryFn: () => showApi.getShowsByTheater(selectedTheaterId),
    enabled: !!selectedTheaterId,
  });

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mt-8">
      <h1 className="text-2xl font-bold mb-6 uppercase tracking-wide text-gray-800">
        Hệ Thống Rạp
      </h1>

      {/* Danh sách rạp */}
      <div className="flex flex-wrap gap-3 mb-8">
        {theatersLoading ? (
          <div>Đang tải danh sách rạp...</div>
        ) : (
          theaters?.map((theater) => (
            <button
              key={theater._id}
              onClick={() => setSelectedTheaterId(theater._id)}
              className={`px-4 py-2 rounded-full font-semibold border text-base shadow transition-all
                ${
                  selectedTheaterId === theater._id
                    ? "bg-blue-50 text-blue-700 border-blue-700"
                    : "bg-white text-gray-800 border-gray-200 hover:bg-gray-100"
                }`}
            >
              {theater.theaterName}
            </button>
          ))
        )}
      </div>

      {/* Lịch chiếu phim của rạp đã chọn */}
      <div className="bg-white rounded-xl border p-5 shadow-lg min-h-[180px]">
        <h3 className="text-lg font-bold mb-4 text-blue-700">
          {selectedTheaterId
            ? `Lịch chiếu tại rạp`
            : "Chọn một rạp để xem lịch chiếu"}
        </h3>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTheaterId}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.3 }}
          >
            {showsLoading ? (
              <div className="text-center text-gray-400 py-6">Đang tải lịch chiếu...</div>
            ) : shows && shows.length > 0 ? (
              <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {shows.map((show) => (
                  <div
                    key={show._id}
                    className="flex items-center gap-5 p-3 bg-gray-50 rounded-xl shadow border hover:scale-105 transition cursor-pointer group"
                  >
                    <img
                      src={show.movieId?.poster}
                      alt={show.movieId?.movieName}
                      className="w-14 h-20 rounded-xl object-cover border border-gray-300 shadow"
                    />
                    <div className="flex-1 flex flex-col">
                      <h4 className="text-base font-bold mb-1 group-hover:text-blue-700 truncate">
                        {show.movieId?.movieName}
                      </h4>
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {new Date(show.startTime).toLocaleString("vi-VN", {
                            hour: "2-digit",
                            minute: "2-digit",
                            weekday: "short",
                            day: "2-digit",
                            month: "2-digit",
                          })}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          {show.movieId?.genres?.slice(0, 2).join(", ")}
                        </span>
                        <span className="text-sm text-black-700 px-2 py-1 rounded">
                          {show.movieId?.duration} phút
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedTheaterId ? (
              <div className="text-center text-gray-400 py-12">
                Không có lịch chiếu!
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TheaterSystem;
