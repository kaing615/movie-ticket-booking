import { Button } from "@/components/common/button";
import { TicketIcon, Youtube } from "lucide-react";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import MovieTrailer from "./MovieTrailer";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);
  const movieId = movie._id || movie.movieId || movie.id;

  // Tính điểm đánh giá trung bình (nếu có)
  const avgRating =
    movie.ratingCount > 0
      ? (movie.ratingScore / movie.ratingCount).toFixed(1)
      : null;

  return (
    <>
      <div className="relative bg-[#161616] rounded-xl shadow-xl overflow-hidden flex flex-col transition-all group hover:shadow-2xl hover:-translate-y-2 border border-zinc-800">
        {/* Ảnh poster */}
        <div
          className="relative aspect-[2/3] w-full overflow-hidden cursor-pointer group"
          onClick={() => navigate(`/movie-details/${movieId}`)}
        >
          {/* Overlay khi hover */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 z-10">
            <Button
              variant="default"
              className="cursor-pointer bg-[#F26B38] font-bold text-sm px-5 py-2 rounded-xl shadow flex items-center"
              onClick={e => {
                e.stopPropagation();
                navigate(`/movie-details/${movieId}`);
              }}
            >
              <TicketIcon size={18} className="mr-1" />
              Mua vé
            </Button>
            <Button
              variant="outline"
              className="text-white border-white hover:bg-[#F26B38] hover:border-[#F26B38] font-bold px-5 py-2 rounded-xl flex items-center"
              onClick={e => {
                e.stopPropagation();
                setShowTrailer(true);
              }}
            >
              <Youtube size={18} className="mr-1" />
              Trailer
            </Button>
          </div>
          {/* Rating */}
          {avgRating && (
            <span className="absolute top-3 right-3 bg-white/90 text-yellow-500 font-bold rounded px-2 py-0.5 text-xs z-20">
              ★ {avgRating}/10
            </span>
          )}
          <img
            src={movie.poster}
            alt={movie.movieName}
            className="object-cover w-full h-full group-hover:scale-105 transition-transform rounded-t-xl"
            loading="lazy"
          />
        </div>
        {/* Thông tin phim */}
        <div className="p-3 flex-1 flex flex-col justify-between bg-gradient-to-b from-[#161616] via-[#232323] to-black">
          <h3 className="font-bold text-base md:text-lg text-white leading-tight line-clamp-2 group-hover:text-[#F26B38] transition-colors mb-1">
            {movie.movieName}
          </h3>
          <div className="flex flex-wrap items-center gap-2 text-xs text-gray-400 mb-1">
            {/* Genres: chỉ lấy 2 cái đầu */}
            {movie.genres?.slice(0, 2).map((g, idx) => (
              <span key={g} className="px-2 py-0.5 bg-[#2223] rounded-full">
                {g}
              </span>
            ))}
            {/* Nếu có nhiều hơn 2 genres, thêm badge ... */}
            {movie.genres?.length > 2 && (
              <span className="px-2 py-0.5 bg-[#2223] rounded-full">...</span>
            )}
            <span className="ml-auto text-gray-300">{movie.duration}'</span>
          </div>
        </div>
      </div>

      {/* Popup Trailer */}
      {showTrailer && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[1000]"
          onClick={() => setShowTrailer(false)}
        >
          <div
            className="relative w-[95vw] max-w-2xl aspect-video"
            onClick={e => e.stopPropagation()}
          >
            <MovieTrailer trailer={movie.trailer} />
            <button
              className="absolute top-1 right-2 text-white text-2xl font-bold bg-black/60 rounded-full w-8 h-8 flex items-center justify-center hover:bg-black"
              onClick={() => setShowTrailer(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default MovieCard;
