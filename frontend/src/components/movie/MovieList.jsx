import { useQuery } from "@tanstack/react-query";
import React, { useEffect } from "react";
import MovieCard from "../movie/MovieCard";
import { Button } from "@/components/common/button";
import { useNavigate } from "react-router-dom";
import { movieApi } from "../../api/modules/movie.api";

const MovieList = ({ filterId }) => {
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ["movieList", filterId],
    queryFn: () =>
      movieApi.getMovies({
        status: filterId === "nowShowing" ? "Now Showing" : "Coming Soon",
      }),
    keepPreviousData: true,
  });

  const filteredMovies = React.useMemo(() => {
    if (!data?.movies) return [];
    switch (filterId) {
      case "nowShowing":
        return data.movies.filter(
          (movie) => movie.status === "Now Showing"
        );
      case "comingSoon":
        return data.movies.filter(
          (movie) => movie.status === "Coming Soon"
        );
      default:
        return data.movies;
    }
  }, [data, filterId]);

  const displayedMovies = filteredMovies.slice(0, 8);

  const handleShowMore = () => {
    if (filterId === "nowShowing") {
      navigate(`/phim-dang-chieu`);
    } else if (filterId === "comingSoon") {
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
      <div className="w-full grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
        {displayedMovies.length > 0 ? (
          displayedMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            Không có phim nào trong danh mục này
          </div>
        )}
      </div>
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
