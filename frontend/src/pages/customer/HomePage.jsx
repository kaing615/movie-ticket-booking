import TheaterInfo from "../../components/theater-info/TheaterInfo";
import MovieFilter from "@/components/movie/MovieFilter";
import MovieList from "@/components/movie/MovieList";
import Carousel from "@/components/common/Carousel";
import React, { useState } from "react";

const HomePage = () => {
  const [activeFilter, setActiveFilter] = useState("showing");

  const handleFilterChange = (filterId) => {
    setActiveFilter(filterId);
  };

  return (
    <>
      <div className="w-full pt-2 pb-4 lg:pt-4 lg:pb-8">
        <Carousel />
      </div>
      <div className="container mx-auto lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl">
        <div className="w-full pt-6 pb-12 px-4">
          <MovieFilter activeFilter={activeFilter} onFilterChange={handleFilterChange} />
          <MovieList filterId={activeFilter} />
          <TheaterInfo />
        </div>
      </div>
    </>
  );
};

export default HomePage;
