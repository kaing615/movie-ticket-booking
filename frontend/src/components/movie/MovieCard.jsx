import { Button } from "@/components/common/button";
import { TicketIcon, Youtube } from "lucide-react";
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MovieTrailer from "./MovieTrailer";

const MovieCard = ({ movie }) => {
  const navigate = useNavigate();
  const [showTrailer, setShowTrailer] = useState(false);

  return (
    <>
      <div className="w-full aspect-[2/3] flex flex-col gap-2 sm:gap-3">
        <div
          className="relative w-full h-full rounded-lg overflow-hidden group"
          onClick={() => navigate(`/movie-details/${movie.movieId}`)}
        >
          <div className=" absolute top-0 left-0 w-full h-full cursor-pointer opacity-0 hidden xl:flex flex-col items-center justify-center gap-4 group-hover:opacity-100 bg-[rgba(0,0,0,0.5)] transition-all duration-300">
            <Button
              variant="default"
              className="bg-[#F26B38] border-1 border-transparent cursor-pointer w-1/3 hover:border-1 hover:border-white transition-all duration-200"
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/movie-details/${movie.movieId}`);
              }}
            >
              <TicketIcon />
              Mua vé
            </Button>
            <Button
              variant="outline"
              className="cursor-pointer transition-all duration-200 hover:bg-transparent hover:text-white w-1/3"
              onClick={(e) => {
                e.stopPropagation();
                setShowTrailer(true);
              }}
            >
              <Youtube />
              Trailer
            </Button>
          </div>
          <img src={movie.poster} alt={movie.movieName} className="w-full h-full object-cover" />
        </div>
        <div className="cursor-pointer px-1" onClick={() => navigate(`/detail-movie/${movie.movieId}`)}>
          <h3 className="font-bold line-clamp-2 text-sm sm:text-base md:text-lg leading-tight">{movie.movieName}</h3>
        </div>
      </div>

      {/* Trailer Modal */}
      {showTrailer && (
        <div
          className="fixed inset-0 bg-[rgba(0,0,0,0.8)] flex items-center justify-center z-50"
          onClick={() => setShowTrailer(false)}
        >
          <div className="relative w-3/4 aspect-video">
            <MovieTrailer trailer={movie.trailer} />
          </div>
        </div>
      )}
    </>
  );
};

export default MovieCard;
