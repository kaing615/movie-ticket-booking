import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import MovieCard from "../movie/MovieCard";
import { Button } from "@/components/common/button";
import { useNavigate } from "react-router-dom";
import { movieApi } from "../../api/modules/movie.api";
import { AnimatePresence, motion } from "framer-motion";

const MovieList = ({ filterId }) => {
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["movieList", filterId],
    queryFn: () =>
      movieApi.getMovies({
        status: filterId === "showing" ? "showing" : "coming",
      }),
    keepPreviousData: true,
  });

  const movies = Array.isArray(data) ? data : data?.movies || [];
  const filteredMovies = React.useMemo(() => {
    switch (filterId) {
      case "showing":
        return movies.filter((movie) => movie.status === "showing");
      case "coming":
        return movies.filter((movie) => movie.status === "coming");
      default:
        return movies;
    }
  }, [movies, filterId]);

  const displayedMovies = filteredMovies.slice(0, 8);

  const handleShowMore = () => {
    if (filterId === "showing") {
      navigate(`/phim-dang-chieu`);
    } else if (filterId === "coming") {
      navigate(`/phim-sap-chieu`);
    }
  };

  useEffect(() => {
    console.log("filterId truyền vào MovieList:", filterId);
    console.log("Data từ API:", data);
    console.log("filteredMovies:", filteredMovies);
  }, [filterId, data, filteredMovies]);

  return (
    <div className="space-y-6 flex flex-col items-center mb-12">
      <AnimatePresence mode="wait">
        <motion.div
          key={filterId} // key là filterId để Framer Motion nhận biết có sự thay đổi
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6"
        >
          {displayedMovies.length > 0 ? (
            displayedMovies.map((movie) => (
              <MovieCard
                key={movie.id || movie._id || movie.movieId}
                movie={movie}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-8 text-gray-500">
              Không có phim nào trong danh mục này
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {filteredMovies.length > 8 && (
        <Button
          onClick={handleShowMore}
          variant="outline"
          className="px-6 py-2 sm:px-8 sm:py-3 border-[#F26B38] text-[#F26B38] hover:bg-[#F26B38] hover:text-white transition-all duration-200 cursor-pointer text-sm sm:text-base"
        >
          Xem thêm
        </Button>
      )}
    </div>
  );
};

export default MovieList;
