import React from "react";
import { Button } from "../common/button";
import { cn } from "@/utils/utils";

const MovieFilter = ({ activeFilter, onFilterChange }) => {
  const filters = [
    { id: "showing", label: "Đang chiếu" },
    { id: "coming", label: "Sắp chiếu" },
  ];

  return (
    <div className="flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-6 md:gap-8 mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center mb-2 sm:mb-0">
        <span className="w-1 h-4 sm:h-5 bg-[#034ea2] mr-2"></span>
        <h1 className="mr-4 sm:mr-6 text-lg sm:text-xl font-bold uppercase">Phim</h1>
      </div>
      <div className="flex flex-wrap gap-4 sm:gap-6 md:gap-8">
        {filters.map((filter) => (
          <Button
            key={filter.id}
            className={cn(
              "relative font-bold text-[#333] opacity-50 py-1 cursor-pointer transition-colors duration-300 hover:text-[#8DABD0] after:content-[''] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-1/2 after:h-[2px] after:bg-current after:scale-x-0 after:transition-transform after:duration-300 after:ease-in-out text-sm sm:text-base",
              activeFilter === filter.id && "after:scale-x-100 opacity-100 text-[#034EA2] hover:text-[#034EA2]"
            )}
            onClick={() => onFilterChange(filter.id)}
          >
            {filter.label}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default MovieFilter;
