import React, { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { theaterApi } from "../../api/modules/theater.api";
import { showApi } from "../../api/modules/show.api";
import { Clock, Film, FilmIcon, Loader2 } from "lucide-react";

const GenreIcon = () => (
  <FilmIcon className="inline-block w-4 h-4 mr-1 text-blue-400" />
);

const Theater = () => {
  const { theaterId } = useParams();
  const navigate = useNavigate();

  // Query lấy info rạp
  const { data: theater, isLoading: theaterLoading, isError: theaterError } = useQuery({
    queryKey: ["theater", theaterId],
    queryFn: () => theaterApi.getTheaterById(theaterId),
    enabled: !!theaterId,
  });

  // Query lấy tất cả suất chiếu ở rạp này
  const { data: shows, isLoading: showsLoading, isError: showsError } = useQuery({
    queryKey: ["shows-by-theater", theaterId],
    queryFn: () => showApi.getShowsByTheater(theaterId),
    enabled: !!theaterId,
  });

  // Gom show theo movie
  const showsByMovie = useMemo(() => {
    const group = {};
    (shows || []).forEach(show => {
      const m = show.movieId;
      if (!group[m._id]) group[m._id] = { movie: m, shows: [] };
      group[m._id].shows.push(show);
    });
    return Object.values(group);
  }, [shows]);

  if (theaterLoading)
    return (
      <div className="flex flex-col items-center py-24 text-blue-600">
        <Loader2 className="animate-spin w-8 h-8 mb-4" /> Đang tải thông tin rạp...
      </div>
    );
  if (theaterError || !theater)
    return (
      <div className="py-24 text-center text-red-600 text-lg font-semibold">
        Không thể tải thông tin rạp.
      </div>
    );

  return (
    <div className="w-full bg-gradient-to-b from-[#f4f7fa] to-[#e8eefc]">
      {/* Banner */}
      <div className="relative w-full h-[280px] md:h-[350px] bg-gradient-to-r from-[#034ea2] via-[#4596d9] to-[#8DABD0] flex items-end justify-center shadow-lg">
        <div className="absolute top-8 left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
        </div>
      </div>

      {/* Box info rạp */}
      <div className="relative z-40 flex justify-center -mt-16 md:-mt-20">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:px-16 px-6 w-full max-w-3xl border-[3px] border-blue-100 flex flex-col items-center text-center">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-3 tracking-wide drop-shadow">
            {theater.theaterName}
          </h1>
          <div className="flex flex-col gap-1 text-base md:text-lg text-gray-700 mb-1">
            <div>
              <span className="font-bold">Địa chỉ:</span>{" "}
              {theater.location || (
                <span className="italic text-gray-400">Chưa cập nhật</span>
              )}
            </div>
            <div>
              <span className="font-bold">Hệ thống:</span>{" "}
              {theater.theaterSystemId?.name ||
                theater.theaterSystem?.name ||
                <span className="italic text-gray-400">-</span>}
            </div>
            <div>
              <span className="font-bold">Mô tả:</span>{" "}
              {theater.theaterSystemId?.description || (
                <span className="italic text-gray-400">Chưa có mô tả.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Lịch chiếu phim */}
      <div className="container mx-auto max-w-4xl px-2 pb-12 mt-24">
        <div className="flex items-center mb-7">
          <div className="w-1 h-7 bg-blue-600 mr-3 rounded"></div>
          <h2 className="text-2xl md:text-3xl font-bold text-[#034ea2] tracking-tight">
            Lịch chiếu tại rạp
          </h2>
        </div>
        {showsLoading ? (
          <div className="flex items-center text-blue-500 gap-2">
            <Loader2 className="animate-spin w-6 h-6" />
            Đang tải lịch chiếu...
          </div>
        ) : showsError ? (
          <div className="text-red-500 font-semibold">Không thể tải lịch chiếu.</div>
        ) : showsByMovie.length > 0 ? (
          <div className="flex flex-col gap-10">
            {showsByMovie.map(({ movie, shows }) => (
              <div
                key={movie._id}
                onClick={() => navigate(`/movie-details/${movie._id}`)}
                className="cursor-pointer relative border border-blue-100 rounded-xl bg-white/95 shadow-md hover:shadow-xl transition p-5 md:p-7 flex flex-col md:flex-row gap-7 group overflow-hidden"
              >
                {/* Movie poster */}
                <img
                  src={movie.poster || "/img/no-poster.png"}
                  alt={movie.movieName}
                  className="w-32 h-44 rounded-2xl object-cover border-2 border-blue-200 shadow group-hover:scale-105 transition-all"
                />
                {/* Movie info + showtimes */}
                <div className="flex-1 flex flex-col">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <Film className="text-blue-400 w-6 h-6" />
                    <div className="text-2xl font-bold">{movie.movieName}</div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-1 text-sm">
                    <span className="bg-blue-50 text-blue-700 rounded px-2 py-1 font-semibold flex items-center">
                      <GenreIcon />
                      {Array.isArray(movie.genres) && movie.genres.length > 0
                        ? movie.genres.join(", ")
                        : <span className="italic text-gray-400">Đang cập nhật</span>}
                    </span>
                    <span className="bg-gray-100 rounded px-2 py-1 text-gray-600 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 mr-1" />
                      Thời lượng: {movie.duration} phút
                    </span>
                  </div>
                  <div className="text-gray-600 mb-2 text-sm line-clamp-2">
                    {movie.description || <span className="italic text-gray-400">Chưa có mô tả.</span>}
                  </div>
                  {/* Showtimes */}
                  <div className="flex flex-wrap gap-2 mt-auto pt-2">
                    {shows.map(show => (
                      <button
                        key={show._id}
                        className="flex items-center gap-1 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold shadow hover:scale-105 hover:shadow-lg active:scale-95 transition-all text-xs"
                        onClick={() => navigate(`/booking/${show._id}`)}
                        title={`Đặt vé lúc ${new Date(show.startTime).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })} ngày ${new Date(show.startTime).toLocaleDateString("vi-VN")}`}
                      >
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        {new Date(show.startTime).toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        <span className="ml-2 text-white/70 font-light">
                          {new Date(show.startTime).toLocaleDateString("vi-VN")}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
                {/* Badge trending/new nếu muốn thêm */}
                {/* <div className="absolute top-2 right-2 bg-orange-500 text-white px-2 py-1 rounded shadow text-xs font-bold uppercase">HOT</div> */}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center mt-16 text-gray-400">
            <FilmIcon className="w-16 h-16 mb-4 opacity-40" />
            <div className="text-lg font-medium">Không có lịch chiếu!</div>
            <div className="text-sm">Các suất chiếu mới sẽ được cập nhật ở đây.</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Theater;
