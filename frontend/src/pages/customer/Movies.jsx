import React from "react";
import { useParams } from "react-router-dom";
import MovieList from "../../components/movie/MovieList";

const statusTitle = {
  showing: "Phim đang chiếu",
  coming: "Phim sắp chiếu",
};

const Movies = () => {
  const { status } = useParams();

  return (
    <div className="w-full min-h-screen bg-[#f8fafc] py-10">
      <div className="container max-w-6xl mx-auto px-2 sm:px-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#034EA2] text-center mb-8 tracking-wide">
          {statusTitle[status] || "Danh sách phim"}
        </h1>
        
        <div className="bg-white rounded-2xl border border-[#e6e8ee] shadow p-5 md:p-8">
          {/* List phim sẽ nằm trong grid bên trong MovieList */}
          <MovieList filterId={status} />
        </div>
      </div>
    </div>
  );
};

export default Movies;
