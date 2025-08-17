import React, { useState, useMemo } from "react";
import BlurLeft from "../../assets/img/blur-left.png";
import BlurRight from "../../assets/img/blur-right.png";
import { CalendarIcon, ClockIcon, Play, StarIcon } from "lucide-react";
import { movieApi } from "../../api/modules/movie.api";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MovieTrailer from "../../components/movie/MovieTrailer";
import MovieReview from "./MovieReview";
import { Label } from "../../components/common/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/common/select";
import { theaterSystemApi } from "../../api/modules/theaterSystem.api";
import { theaterApi } from "../../api/modules/theater.api";
import { showApi } from "../../api/modules/show.api";
import { Button } from "../../components/common/button";
import { CUSTOMER_PATH } from "../../routes/path";

const MovieDetails = () => {
  const [showTrailer, setShowTrailer] = useState(false);
  const { id } = useParams();
  console.log("Param id:", id);

  const navigate = useNavigate();

  const {
    data: movie,
    isLoading: isMovieLoading,
    error: movieError,
  } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => movieApi.getMovieById(id),
    enabled: !!id,
    retry: 1,
  });
  console.log("Movie: ", movie);

  const { data: theaterSystemsList = [] } = useQuery({
    queryKey: ["theaterSystems"],
    queryFn: () => theaterSystemApi.getAllTheaterSystems(),
  });
  console.log("TheaterSystemsList: ", theaterSystemsList);

  const [selectedSystemId, setSelectedSystemId] = useState("");
  const [selectedTheaterId, setSelectedTheaterId] = useState("all");

  React.useEffect(() => {
    if (
      Array.isArray(theaterSystemsList) &&
      theaterSystemsList.length > 0 &&
      !selectedSystemId
    ) {
      setSelectedSystemId(theaterSystemsList[0]._id);
      setSelectedTheaterId("all");
    }
  }, [theaterSystemsList, selectedSystemId]);

  const { data: theaters = [], isLoading: isTheaterLoading } = useQuery({
    queryKey: ["theaters", selectedSystemId],
    queryFn: () => theaterApi.getTheater(selectedSystemId),
    enabled: !!selectedSystemId,
  });
  console.log("Theater from API: ", theaters);

  const { data: shows = [], isLoading: isShowsLoading } = useQuery({
    queryKey: ["shows-by-movie", id],
    queryFn: () => showApi.getShowsByMovie(id, { upcoming: true, graceMin: 2, sort: "asc" }),
    enabled: !!id,
    refetchInterval: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
  console.log("Shows from API:", shows);

  // Bộ lọc ngày (dựa trên shows trả về)
  const uniqueDates = useMemo(() => {
    const set = new Set();
    (shows || []).forEach((show) => {
      const d = new Date(show.startTime);
      set.add(d.toLocaleDateString("vi-VN"));
    });
    return Array.from(set);
  }, [shows]);

  const [selectedDate, setSelectedDate] = useState(uniqueDates[0] || "");

  // Khi shows đổi thì auto chọn ngày đầu tiên có showtimes
  React.useEffect(() => {
    if (uniqueDates.length > 0 && !selectedDate) {
      setSelectedDate(uniqueDates[0]);
    }
  }, [uniqueDates, selectedDate]);

  React.useEffect(() => {
    setSelectedTheaterId("all");
  }, [selectedSystemId]);

  const theaterIds = Array.isArray(theaters) ? theaters.map((t) => t._id) : [];

  // Filter showtimes theo system, theater, date
  const filteredShows = useMemo(() => {
    return (shows || []).filter((show) => {
      // Chỉ show lịch chiếu thuộc các rạp của hệ thống đang chọn
      const systemOk =
        !selectedSystemId || theaterIds.includes(show.theaterId._id);

      // Lọc theo rạp con (nếu chọn cụ thể)
      const theaterOk =
        selectedTheaterId === "all" || show.theaterId._id === selectedTheaterId;

      // Lọc theo ngày
      const dateOk =
        !selectedDate ||
        new Date(show.startTime).toLocaleDateString("vi-VN") === selectedDate;

      return systemOk && theaterOk && dateOk;
    });
  }, [shows, selectedTheaterId, selectedSystemId, selectedDate, theaters]);

  // Group showtimes theo rạp (nếu muốn)
  const showsByTheater = useMemo(() => {
    const group = {};
    filteredShows.forEach((show) => {
      const theater = show.theaterId;
      if (!group[theater._id]) group[theater._id] = { theater, shows: [] };
      group[theater._id].shows.push(show);
    });
    return Object.values(group);
  }, [filteredShows]);

  console.log("MovieId:", movie?.movieId);

  // chuyển "dd/mm/yyyy" -> Date
  const parseViDate = (s) => {
    const [d, m, y] = s.split("/").map(Number);
    return new Date(y, m - 1, d);
  };

  const weekdayLabel = (viDateStr) => {
    const d = parseViDate(viDateStr);
    const today = new Date();
    const isToday =
      d.getFullYear() === today.getFullYear() &&
      d.getMonth() === today.getMonth() &&
      d.getDate() === today.getDate();

    if (isToday) return "Hôm nay";
    const days = [
      "Chủ Nhật",
      "Thứ 2",
      "Thứ 3",
      "Thứ 4",
      "Thứ 5",
      "Thứ 6",
      "Thứ 7",
    ];
    return days[d.getDay()];
  };

  const isToday = (viDateStr) => {
    const d = parseViDate(viDateStr);
    const t = new Date();
    return (
      d.getFullYear() === t.getFullYear() &&
      d.getMonth() === t.getMonth() &&
      d.getDate() === t.getDate()
    );
  };
  const isWeekend = (viDateStr) => {
    const d = parseViDate(viDateStr).getDay();
    return d === 0 || d === 6; // CN hoặc Th7
  };

  // --- UI ---
  return (
    <>
      {/* Hero Banner Section */}
      <div className="relative bg-black flex justify-center w-full min-h-[250px] sm:min-h-[350px] lg:min-h-[500px]">
        <div className="absolute w-full h-full z-10 bg-black/30"></div>
        <div className="relative h-full">
          <div className="absolute top-0 left-0 z-20 hidden lg:block">
            <img
              alt="Blur Left"
              className="w-auto h-[250px] sm:h-[350px] lg:h-[500px] object-cover"
              src={BlurLeft}
            />
          </div>
          <div className="relative flex justify-center">
            <img
              alt="Movie Banner"
              className="w-full h-[250px] sm:h-[350px] lg:h-[500px] lg:w-[860px] object-cover"
              src={movie?.poster}
            />
            <button
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30 w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-white rounded-full cursor-pointer hover:scale-110 transition-all duration-300 shadow-lg"
              onClick={() => setShowTrailer(true)}
            >
              <Play className="w-6 h-6 sm:w-8 sm:h-8 pl-0.5 text-gray-800" />
            </button>
          </div>
          <div className="absolute top-0 right-0 z-20 hidden lg:block">
            <img
              alt="Blur Right"
              className="w-auto h-[250px] sm:h-[350px] lg:h-[500px] object-cover"
              src={BlurRight}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 lg:py-8 lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl">
        {/* Movie Info Section */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Movie Poster */}
          <div className="flex-shrink-0 mx-auto lg:mx-0 lg:-mt-20 z-50">
            <img
              alt={movie?.movieName}
              className="w-48 h-64 sm:w-56 sm:h-72 lg:w-70 lg:h-100 object-cover rounded-lg border-2 border-white shadow-2xl"
              src={movie?.poster}
            />
          </div>
          {/* Movie Details */}
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 text-center lg:text-left">
              {movie?.movieName}
            </h1>
            <div className="flex flex-wrap justify-center lg:justify-start gap-4 mb-4">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ClockIcon className="w-4 h-4 text-orange-500" />
                <span>{movie?.duration || "120"} phút</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <CalendarIcon className="w-4 h-4 text-orange-500" />
                <span>
                  {movie?.releaseDate &&
                    new Date(movie.releaseDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
              <StarIcon className="w-5 h-5 text-orange-500 fill-orange-500" />
              <span className="text-lg font-semibold">
                {Number(movie?.ratingScore / movie?.ratingCount).toFixed(1) || "0"}
              </span>
              <span className="text-sm text-gray-500">
                ({movie?.ratingCount || "0"} lượt đánh giá)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex flex-col sm:flex-row">
                <span className="font-medium text-gray-600 w-full sm:w-24 mb-1 sm:mb-0">
                  Quốc gia:
                </span>
                <span className="text-gray-800">
                  {movie?.country || "Đang cập nhật"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="font-medium text-gray-600 w-full sm:w-28 mb-1 sm:mb-0">
                  Nhà sản xuất:
                </span>
                <span className="text-gray-800">
                  {movie?.producer || "Đang cập nhật"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="font-medium text-gray-600 w-full sm:w-24 mb-1 sm:mb-0">
                  Thể loại:
                </span>
                <span className="text-gray-800">
                  {Array.isArray(movie?.genres)
                    ? movie.genres.join(", ")
                    : movie?.genres || "Đang cập nhật"}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row">
                <span className="font-medium text-gray-600 w-full sm:w-28 mb-1 sm:mb-0">
                  Đạo diễn:
                </span>
                <span className="text-gray-800">
                  {movie?.director || "Đang cập nhật"}
                </span>
              </div>
              {/* Có thể thêm diễn viên nếu muốn */}
              <div className="flex flex-col sm:flex-row">
                <span className="font-medium text-gray-600 w-full sm:w-28 mb-1 sm:mb-0">
                  Diễn viên:
                </span>
                <span className="text-gray-800">
                  {Array.isArray(movie?.actors)
                    ? movie.actors.join(", ")
                    : movie?.actors || "Đang cập nhật"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Movie Content Section */}
        <div className="mt-8 lg:mt-12">
          <div className="flex items-center mb-4">
            <div className="w-1 h-6 bg-blue-600 mr-3"></div>
            <h2 className="text-lg font-bold text-gray-900">Nội dung phim</h2>
          </div>
          <div className="text-gray-700 text-sm leading-relaxed">
            <p className="mb-4">
              {movie?.description ||
                "Thông tin nội dung phim đang được cập nhật..."}
            </p>
          </div>
        </div>

        {/* Showtime Section */}
        <div className="mt-8 lg:mt-12">
          <div className="flex items-center mb-6">
            <div className="w-1 h-6 bg-blue-600 mr-3"></div>
            <h2 className="text-lg font-bold text-gray-900">Lịch chiếu</h2>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-0 xl:gap-10">
            {/* Date Filter */}
            <div className="relative overflow-x-auto pb-2 mb-6">
              {/* fade 2 mép */}
              <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-6 bg-gradient-to-r from-white to-transparent" />
              <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-white to-transparent" />

              <div className="flex gap-2 min-w-max px-1 snap-x snap-mandatory">
                {uniqueDates.map((date, idx) => {
                  const selected = date === selectedDate;
                  const weekend = isWeekend(date);
                  return (
                    <button
                      key={idx}
                      role="tab"
                      aria-selected={selected}
                      onClick={() => setSelectedDate(date)}
                      className={[
                        "group relative snap-start select-none",
                        "flex flex-col items-center justify-center text-center",
                        "min-w-[88px] h-16 rounded-xl px-2 transition-all duration-200",
                        "cursor-pointer",
                        selected
                          ? "text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg ring-2 ring-blue-500/40"
                          : "bg-white text-gray-700 border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md motion-safe:hover:-translate-y-0.5",
                      ].join(" ")}
                    >
                      {/* chữ to: thứ / Hôm nay */}
                      <span
                        className={[
                          "font-semibold text-sm sm:text-base leading-5",
                          !selected && weekend ? "text-rose-600" : "",
                        ].join(" ")}
                      >
                        {isToday(date) ? "Hôm nay" : weekdayLabel(date)}
                      </span>

                      {/* chữ nhỏ: ngày */}
                      <span
                        className={[
                          "text-[11px] sm:text-xs opacity-80 leading-4",
                          selected ? "opacity-95" : "",
                        ].join(" ")}
                      >
                        {date}
                      </span>

                      {/* shine khi hover */}
                      <span
                        className="
              pointer-events-none absolute inset-y-0 -left-1/2 w-1/2
              bg-gradient-to-r from-transparent via-white/40 to-transparent
              translate-x-[-120%] group-hover:translate-x-[220%]
              transition-transform duration-500
            "
                      />

                      {/* chấm nhỏ cho 'hôm nay' */}
                      {isToday(date) && (
                        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-white/90 shadow" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Location Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              {/* Hệ thống rạp */}
              <div className="space-y-1">
                <Label className="text-sm font-medium">Hệ thống rạp</Label>
                <Select
                  onValueChange={setSelectedSystemId}
                  value={selectedSystemId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn hệ thống rạp" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {theaterSystemsList?.map((item) => (
                      <SelectItem
                        key={item._id}
                        value={item._id}
                        className="z-100"
                      >
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Rạp */}
              <div className="space-y-1">
                <Label className="text-sm font-medium">Rạp</Label>
                <Select
                  onValueChange={setSelectedTheaterId}
                  value={selectedTheaterId}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn rạp" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="all">Tất cả</SelectItem>
                    {theaters?.map((item) => (
                      <SelectItem key={item._id} value={item._id}>
                        {item.theaterName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="w-full h-0.5 bg-[#034EA2] mb-4 lg:mb-8"></div>

          {/* Showtimes by theater */}
          {showsByTheater.length > 0 ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {showsByTheater.map(({ theater, shows }) => (
                <div
                  key={theater._id}
                  className="border-b border-gray-200 pb-3"
                >
                  <div className="flex flex-col gap-2 ">
                    <h4 className="text-lg font-semibold">
                      {theater.theaterName}
                    </h4>
                    <div className="grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5 items-center">
                      {shows.map((show) => (
                        <Button
                          key={show._id}
                          variant="outline"
                          onClick={() => navigate(`/booking/${movie.movieId}`)}
                          className="
                            text-xs font-medium text-gray-700 border border-gray-300
                            px-3 py-2 rounded-md bg-white shadow-sm
                            transition-all duration-200 ease-out
                            hover:text-blue-700 hover:border-blue-400 hover:bg-blue-50
                            hover:shadow-md motion-safe:hover:-translate-y-0.5
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40
                            cursor-pointer
                            "
                        >
                          {new Date(show.startTime).toLocaleTimeString(
                            "vi-VN",
                            { hour: "2-digit", minute: "2-digit" }
                          )}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-500">
                <svg
                  className="w-16 h-16 mx-auto mb-4 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-gray-600 font-medium">Không có lịch chiếu</p>
                <p className="text-sm text-gray-400 mt-1">
                  Vui lòng chọn hệ thống rạp và rạp khác
                </p>
              </div>
            </div>
          )}
        </div>
        <MovieReview movieId={movie?.movieId} />
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-50"
          onClick={() => setShowTrailer(false)}
        >
          <div className="relative w-3/4 aspect-video">
            <MovieTrailer trailer={movie?.trailer} />
          </div>
        </div>
      )}
    </>
  );
};

export default MovieDetails;
