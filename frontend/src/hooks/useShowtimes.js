import { useState, useEffect } from "react";

export const useShowtimes = (listShowtime, maCumRap, movieId = null) => {
  const [showtimes, setShowtimes] = useState(null);
  const [hasData, setHasData] = useState(false);

  const getShowtimes = (listShowtime, maCumRap, movieId = null) => {
    if (!listShowtime || !listShowtime[0] || !listShowtime[0].lstCumRap || !maCumRap) {
      return null;
    }

    // Nếu chọn "all", hiển thị tất cả phim từ tất cả cụm rạp
    if (maCumRap === "all") {
      const allMovies = [];

      listShowtime[0].lstCumRap.forEach((cumRap) => {
        if (cumRap.danhSachPhim) {
          cumRap.danhSachPhim.forEach((movie) => {
            // Nếu có movieId thì lọc theo movieId, không thì lấy tất cả
            if (!movieId || movie.maPhim === movieId) {
              allMovies.push({
                ...movie,
                tenCumRap: cumRap.tenCumRap,
              });
            }
          });
        }
      });

      return allMovies.length > 0 ? allMovies : null;
    }

    // Nếu chọn cụm rạp cụ thể
    const cumRap = listShowtime[0].lstCumRap.find((item) => item.maCumRap === maCumRap);
    if (!cumRap || !cumRap.danhSachPhim) {
      return null;
    }

    // Nếu có movieId thì lọc theo movieId, không thì lấy tất cả phim của cụm rạp
    if (movieId) {
      const filteredMovies = cumRap.danhSachPhim
        .filter((movie) => {
          return movie.maPhim === movieId;
        })
        .map((movie) => ({
          ...movie,
          tenCumRap: cumRap.tenCumRap,
        }));

      return filteredMovies.length > 0 ? filteredMovies : null;
    } else {
      return cumRap.danhSachPhim.map((movie) => ({
        ...movie,
        tenCumRap: cumRap.tenCumRap,
      }));
    }
  };

  useEffect(() => {
    if (listShowtime && maCumRap) {
      const result = getShowtimes(listShowtime, maCumRap, movieId);
      setShowtimes(result);
      setHasData(!!result);
    } else {
      setShowtimes(null);
      setHasData(false);
    }
  }, [listShowtime, maCumRap, movieId]);

  return { showtimes, hasData, isEmpty: !hasData && !!listShowtime && !!maCumRap };
};
