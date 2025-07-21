import React, { useState, useMemo } from "react";
import BlurLeft from "../../assets/img/blur-left.png";
import BlurRight from "../../assets/img/blur-right.png";
import { CalendarIcon, ClockIcon, Play, StarIcon } from "lucide-react";
import { movieApi } from "../../api/modules/movie.api";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import MovieTrailer from "../../components/movie/MovieTrailer";
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

  const { data: movieRes } = useQuery({
    queryKey: ["movie", id],
    queryFn: () => movieApi.getMovieById(id),
    enabled: !!id,
  });
  const movie = movieRes?.movie;
  console.log("Movie: ", movie);

  const { data: theaterSystemsList = [] } = useQuery({
    queryKey: ["theaterSystems"],
    queryFn: () =>
      theaterSystemApi.getAllTheaterSystems().then((res) => res.data),
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

  const { data: theaters } = useQuery({
    queryKey: ["theaters", selectedSystemId],
    queryFn: () => theaterApi.getTheater(selectedSystemId),
    enabled: !!selectedSystemId,
  });
  console.log("Theater from API: ", theaters);

  const { data: showsRes } = useQuery({
    queryKey: ["shows-by-movie", id],
    queryFn: () => showApi.getShowsByMovie(id),
    enabled: !!id,
  });
  const shows = showsRes;
  console.log("Shows from API:", shows);

  React.useEffect(() => {
    if (showsRes) {
      console.log("showsRes raw:", showsRes);
    }
  }, [showsRes]);

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
                {movie?.ratingScore || "0"}
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
            <div className="overflow-x-auto pb-2 mb-6">
              <div className="flex gap-2 min-w-max">
                {uniqueDates.map((date, idx) => (
                  <button
                    key={idx}
                    className={`flex flex-col items-center text-center text-xs sm:text-sm min-w-[70px] sm:min-w-[80px] h-16 rounded-lg py-2 cursor-pointer transition-all duration-200 ${
                      date === selectedDate
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                    onClick={() => setSelectedDate(date)}
                  >
                    <span className="font-medium">
                      {date === new Date().toLocaleDateString("vi-VN")
                        ? "Hôm nay"
                        : date}
                    </span>
                    <span className="text-xs opacity-80">{date}</span>
                  </button>
                ))}
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
                  <SelectContent>
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
                  <SelectContent>
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
                    <h4 className="text-sm font-semibold">
                      {theater.theaterName}
                    </h4>
                    <div className="grid 2xl:grid-cols-6 xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-5 items-center">
                      {shows.map((show) => (
                        <Button
                          key={show._id}
                          className="text-xs text-gray-500 cursor-pointer"
                          variant="outline"
                          onClick={() =>
                            navigate(`${CUSTOMER_PATH.BOOKING}/${show._id}`)
                          }
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
