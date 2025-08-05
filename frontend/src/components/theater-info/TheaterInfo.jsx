import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { theaterSystemApi } from "../../api/modules/theaterSystem.api";
import { theaterApi } from "../../api/modules/theater.api";
import { showApi } from "../../api/modules/show.api";
import { AnimatePresence, motion } from "framer-motion";

const TheaterInfo = () => {
  const [selectedSystemId, setSelectedSystemId] = useState("");
  const [selectedTheaterId, setSelectedTheaterId] = useState("");
  const navigate = useNavigate();

  // Query data
  const { data: theaterSystems } = useQuery({
    queryKey: ["theaterSystems"],
    queryFn: () => theaterSystemApi.getAllTheaterSystems(),
  });

  const { data: theaters } = useQuery({
    queryKey: ["theaters", selectedSystemId],
    queryFn: () => theaterApi.getTheater(selectedSystemId),
    enabled: !!selectedSystemId,
  });

  const { data: shows } = useQuery({
    queryKey: ["shows", selectedTheaterId],
    queryFn: () => showApi.getShowsByTheater(selectedTheaterId),
    enabled: !!selectedTheaterId,
  });

  // Auto select first
  useEffect(() => {
    if (theaterSystems && theaterSystems.length > 0 && !selectedSystemId) {
      setSelectedSystemId(theaterSystems[0]._id);
    }
  }, [theaterSystems, selectedSystemId]);
  useEffect(() => {
    if (theaters && theaters.length > 0 && !selectedTheaterId) {
      setSelectedTheaterId(theaters[0]._id);
    }
  }, [theaters, selectedTheaterId]);

  // Handlers
  const handleSelectSystem = (id) => {
    setSelectedSystemId(id);
    setSelectedTheaterId("");
  };
  const handleSelectTheater = (id) => setSelectedTheaterId(id);

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 mt-8">
      <div className="flex items-center mb-6 gap-2">
        <span className="w-1 h-6 bg-blue-700 rounded" />
        <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-800">
          Thông tin lịch chiếu
        </h1>
      </div>

      {/* Hệ Thống Rạp */}
      <div className="flex flex-wrap gap-4 mb-4">
        {theaterSystems?.map((system) => (
          <button
            key={system._id}
            className={`rounded-full p-1 w-16 h-16 flex items-center justify-center border-2 transition shadow-lg
              ${
                selectedSystemId === system._id
                  ? "border-blue-700 scale-110 bg-white shadow"
                  : "border-gray-200 bg-gray-50 hover:scale-105"
              }`}
            onClick={() => handleSelectSystem(system._id)}
          >
            <img
              src={system.logo}
              alt={system.name}
              className="w-12 h-12 object-contain drop-shadow"
              title={system.name}
            />
          </button>
        ))}
      </div>

      {/* Danh sách Rạp */}
      <div className="flex flex-wrap gap-2 mb-8">
        {theaters?.map((theater) => (
          <button
            key={theater._id}
            className={`px-4 py-2 rounded-full font-semibold border text-base shadow
              ${
                selectedTheaterId === theater._id
                  ? "bg-blue-50 text-blue-700 border-blue-700"
                  : "bg-white text-gray-800 border-gray-200 hover:bg-gray-100"
              }`}
            onClick={() => handleSelectTheater(theater._id)}
          >
            {theater.theaterName}
          </button>
        ))}
      </div>

      {/* Lịch Chiếu */}
      <div className="bg-white rounded-xl border p-5 shadow-lg min-h-[180px]">
        <h3 className="text-lg font-bold mb-4 text-blue-700">
          Lịch chiếu phim
        </h3>
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedTheaterId || selectedSystemId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.38, ease: "easeInOut" }}
            className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            {shows && shows.length > 0 ? (
              shows.map((show) => (
                <div
                  key={show._id}
                  className="flex items-center gap-5 p-3 bg-gray-50 rounded-xl shadow border hover:scale-105 transition cursor-pointer group"
                  onClick={() =>
                    navigate(`/movie-details/${show.movieId._id}`)
                  }
                  title="Xem chi tiết phim"
                >
                  <div className="relative min-w-[56px]">
                    <img
                      src={show.movieId?.poster}
                      alt={show.movieId?.movieName}
                      className="w-14 h-20 rounded-xl object-cover border border-gray-300 shadow"
                    />
                    {/* Overlay: phim đang chiếu? */}
                  </div>
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
              ))
            ) : (
              <div className="text-center text-gray-400 py-12 col-span-full">
                Không có lịch chiếu!
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TheaterInfo;