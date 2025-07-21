import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { theaterSystemApi } from "../../api/modules/theaterSystem.api";
import { theaterApi } from "../../api/modules/theater.api";
import { showApi } from "../../api/modules/show.api";

const TheaterInfo = () => {
  const [selectedSystemId, setSelectedSystemId] = useState("");
  const [selectedTheaterId, setSelectedTheaterId] = useState("");
  const navigate = useNavigate();

  // Lấy danh sách hệ thống rạp
  const { data: theaterSystems } = useQuery({
    queryKey: ["theaterSystems"],
    queryFn: () => theaterSystemApi.getAllTheaterSystems(),
  });

  // Lấy danh sách rạp theo hệ thống đã chọn
  const { data: theaters } = useQuery({
    queryKey: ["theaters", selectedSystemId],
    queryFn: () => theaterApi.getTheater(selectedSystemId),
    enabled: !!selectedSystemId,
  });

  // Lấy lịch chiếu của rạp đã chọn
  const { data: shows } = useQuery({
    queryKey: ["shows", selectedTheaterId],
    queryFn: () => showApi.getShowsByTheater(selectedTheaterId),
    enabled: !!selectedTheaterId,
  });

  // Auto chọn hệ thống đầu tiên khi có data
  useEffect(() => {
    if (theaterSystems && theaterSystems.length > 0 && !selectedSystemId) {
      setSelectedSystemId(theaterSystems[0]._id);
    }
  }, [theaterSystems, selectedSystemId]);

  // Auto chọn rạp đầu tiên khi có data
  useEffect(() => {
    if (theaters && theaters.length > 0 && !selectedTheaterId) {
      setSelectedTheaterId(theaters[0]._id);
    }
  }, [theaters, selectedTheaterId]);

  // Handler khi chọn hệ thống rạp
  const handleSelectSystem = (id) => {
    setSelectedSystemId(id);
    setSelectedTheaterId(""); // Reset theater khi đổi system
  };

  // Handler khi chọn rạp
  const handleSelectTheater = (id) => {
    setSelectedTheaterId(id);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8">
      <div className="flex items-center mb-4 sm:mb-6 lg:mb-8">
        <span className="w-1 h-5 bg-[#034ea2] mr-2"></span>
        <h1 className="text-lg sm:text-xl font-bold uppercase">
          Thông tin lịch chiếu
        </h1>
      </div>

      {/* Filter Hệ Thống Rạp */}
      <div className="flex flex-wrap gap-2 mb-4">
        {theaterSystems?.map((system) => (
          <button
            key={system._id}
            className={`flex items-center justify-center rounded-lg w-14 h-14 p-2 border 
              ${
                selectedSystemId === system._id
                  ? "bg-gray-100 border-[#034ea2]"
                  : "border-gray-200"
              }
              hover:bg-gray-100 transition`}
            onClick={() => handleSelectSystem(system._id)}
          >
            <img
              src={system.logo}
              alt={system.name}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>

      {/* Filter Rạp */}
      {theaters && (
        <div className="flex flex-wrap gap-2 mb-6">
          {theaters.map((theater) => (
            <button
              key={theater._id}
              className={`px-3 py-2 rounded border 
                ${
                  selectedTheaterId === theater._id
                    ? "bg-blue-50 border-[#034ea2]"
                    : "border-gray-200"
                }
                hover:bg-gray-100 transition`}
              onClick={() => handleSelectTheater(theater._id)}
            >
              <span className="font-semibold">{theater.theaterName}</span>
              <span className="block text-xs text-gray-500">
                {theater.address}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Lịch Chiếu */}
      <div className="bg-white rounded-lg border p-4">
        <h3 className="text-sm font-semibold mb-3 text-gray-700">
          Lịch chiếu phim
        </h3>
        {shows && shows.length > 0 ? (
          <div className="space-y-3 max-h-[450px] overflow-y-auto">
            {shows.map((show) => (
              <div
                key={show._id}
                className="flex gap-4 items-center border-b border-gray-100 pb-3 last:border-b-0 hover:bg-gray-50 p-2 rounded-lg cursor-pointer"
                onClick={() => navigate(`/movie-details/${show.movieId._id}`)}
              >
                <img
                  src={show.movieId?.poster}
                  alt={show.movieId?.movieName}
                  className="w-14 h-20 rounded object-cover"
                />
                <div className="flex-1">
                  <h4 className="text-base font-semibold">
                    {show.movieId?.movieName}
                  </h4>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <span className="text-xs bg-blue-50 px-2 py-1 rounded text-blue-600">
                      {new Date(show.startTime).toLocaleString("vi-VN")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400">Không có lịch chiếu!</div>
        )}
      </div>
    </div>
  );
};

export default TheaterInfo;
