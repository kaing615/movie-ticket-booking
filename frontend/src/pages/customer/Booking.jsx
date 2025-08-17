import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { theaterSystemApi } from "../../api/modules/theaterSystem.api";
import { theaterApi } from "../../api/modules/theater.api";
import { movieApi } from "../../api/modules/movie.api";
import { showApi } from "../../api/modules/show.api";
import { Button } from "../../components/common/button";
import { CUSTOMER_PATH } from "../../routes/path";
import { Check, ChevronDown, MapPin, Film, Clock } from "lucide-react";

/* ===== helpers ===== */
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" });
const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });

const groupByDate = (shows = []) => {
  const map = new Map();
  shows.forEach((s) => {
    const key = new Date(s.startTime).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(s);
  });
  return Array.from(map.entries()).map(([k, v]) => ({ date: new Date(k), items: v }));
};

/* ===== step wrapper ===== */
const StepCard = ({ index, title, icon, done, open, onToggle, children }) => (
  <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4"
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full grid place-items-center ${done ? "bg-green-500 text-white" : "bg-blue-600 text-white"}`}>
          {done ? <Check size={18} /> : <span className="text-sm font-bold">{index}</span>}
        </div>
        <div className="flex items-center gap-2 text-gray-800 font-semibold">
          {icon}
          <span className="text-base sm:text-lg">{title}</span>
        </div>
      </div>
      <ChevronDown className={`transition ${open ? "rotate-180" : ""}`} />
    </button>
    {open && <div className="border-t px-4 sm:px-5 py-4 sm:py-5">{children}</div>}
  </div>
);

/* ===== main ===== */
const Booking = () => {
  const navigate = useNavigate();
  const { movieId: movieIdParam } = useParams(); // nếu vào /booking/:movieId -> preselect

  const [step, setStep] = useState(1);
  const [systemId, setSystemId] = useState("");
  const [theaterId, setTheaterId] = useState("");
  const [movieId, setMovieId] = useState(movieIdParam || "");

  /* ---- queries ---- */
  const { data: systems = [], isLoading: loadingSys } = useQuery({
    queryKey: ["theaterSystems"],
    queryFn: () => theaterSystemApi.getAllTheaterSystems(),
  });

  const { data: theaters = [], isLoading: loadingTheaters } = useQuery({
    queryKey: ["theaters", systemId],
    queryFn: () => theaterApi.getTheater(systemId),
    enabled: !!systemId,
  });

  const { data: moviesOfTheater = [], isLoading: loadingMovies } = useQuery({
    queryKey: ["movies-of-theater", theaterId],
    queryFn: () => movieApi.getMoviesOfTheater(theaterId),
    enabled: !!theaterId,
  });

  // Lấy show của rạp (populated movieId). Lọc theo movieId nếu đã chọn.
  const { data: showsInTheater = [], isLoading: loadingShows } = useQuery({
    queryKey: ["shows-theater", theaterId],
    queryFn: () => showApi.getShowsByTheater(theaterId), // đã có filter upcoming mặc định
    enabled: !!theaterId,
  });

  const showsForPickedMovie = useMemo(
    () => (movieId ? showsInTheater.filter((s) => (s.movieId?._id || s.movieId) === movieId) : []),
    [showsInTheater, movieId]
  );
  const grouped = useMemo(() => groupByDate(showsForPickedMovie), [showsForPickedMovie]);

  /* ---- auto choose firsts / step sync ---- */
  useEffect(() => {
    if (!systemId && systems.length) setSystemId(systems[0]._id);
  }, [systems, systemId]);

  useEffect(() => {
    setTheaterId(""); // reset theater when change system
    setMovieId(movieIdParam || "");
    if (systemId) setStep(2);
  }, [systemId]); // eslint-disable-line

  useEffect(() => {
    setMovieId(movieIdParam || "");
    if (theaterId) setStep(3);
  }, [theaterId]); // eslint-disable-line

  useEffect(() => {
    if (movieIdParam) {
      setMovieId(movieIdParam);
      // nếu có rạp rồi: nhảy sang step 4; nếu chưa có rạp -> giữ ở 2-3
      if (theaterId) setStep(4);
      else setStep(Math.max(step, 3));
    }
  }, [movieIdParam, theaterId]); // eslint-disable-line

  useEffect(() => {
    if (movieId) setStep(4);
  }, [movieId]);

  /* ---- pick handlers ---- */
  const pickSystem = (id) => {
    setSystemId(id);
  };
  const pickTheater = (id) => {
    setTheaterId(id);
  };
  const pickMovie = (id) => {
    setMovieId(id);
  };

  /* ---- summary card (phải) ---- */
  const pickedMovie = useMemo(
    () => (moviesOfTheater || []).find((m) => (m._id || m.movieId) === movieId),
    [moviesOfTheater, movieId]
  );
  const pickedSystem = systems.find((s) => s._id === systemId);
  const pickedTheater = theaters.find((t) => t._id === theaterId);

  return (
    <div className="w-full bg-gray-50">
      {/* breadcrumb / stepper header (đơn giản) */}
      <div className="border-b bg-white">
        <div className="container mx-auto px-4 py-3 lg:max-w-6xl">
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className={step >= 1 ? "text-blue-700 font-semibold" : ""}>Chọn hệ thống</span>
            <span>›</span>
            <span className={step >= 2 ? "text-blue-700 font-semibold" : ""}>Chọn rạp</span>
            <span>›</span>
            <span className={step >= 3 ? "text-blue-700 font-semibold" : ""}>Chọn phim</span>
            <span>›</span>
            <span className={step >= 4 ? "text-blue-700 font-semibold" : ""}>Chọn suất</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 lg:py-8 lg:max-w-6xl grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">
        {/* LEFT: steps */}
        <div className="space-y-4">
          {/* Step 1: Hệ thống rạp */}
          <StepCard
            index={1}
            title="Chọn hệ thống rạp"
            icon={<MapPin className="w-5 h-5 text-blue-600" />}
            done={!!systemId}
            open={step === 1}
            onToggle={() => setStep(step === 1 ? 0 : 1)}
          >
            {loadingSys ? (
              <div className="text-gray-500">Đang tải...</div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {systems.map((s) => (
                  <button
                    key={s._id}
                    onClick={() => pickSystem(s._id)}
                    className={[
                      "group rounded-full border px-3 py-2 flex items-center gap-2",
                      "bg-white hover:bg-blue-50 transition shadow-sm",
                      systemId === s._id
                        ? "border-blue-600 text-blue-700 ring-2 ring-blue-200"
                        : "border-gray-200 text-gray-800",
                    ].join(" ")}
                  >
                    <img src={s.logo} alt={s.name} className="w-6 h-6 object-contain" />
                    <span className="font-medium">{s.name}</span>
                  </button>
                ))}
              </div>
            )}
          </StepCard>

          {/* Step 2: Rạp */}
          <StepCard
            index={2}
            title="Chọn rạp"
            icon={<MapPin className="w-5 h-5 text-blue-600" />}
            done={!!theaterId}
            open={step === 2}
            onToggle={() => setStep(step === 2 ? 0 : 2)}
          >
            {!systemId ? (
              <div className="text-gray-500">Hãy chọn hệ thống trước.</div>
            ) : loadingTheaters ? (
              <div className="text-gray-500">Đang tải...</div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {theaters.map((t) => (
                  <button
                    key={t._id}
                    onClick={() => pickTheater(t._id)}
                    className={[
                      "px-4 py-2 rounded-full border text-sm font-semibold shadow-sm",
                      "hover:bg-blue-50 transition",
                      theaterId === t._id
                        ? "bg-blue-50 text-blue-700 border-blue-600"
                        : "bg-white text-gray-800 border-gray-200",
                    ].join(" ")}
                  >
                    {t.theaterName}
                  </button>
                ))}
              </div>
            )}
          </StepCard>

          {/* Step 3: Phim */}
          <StepCard
            index={3}
            title="Chọn phim"
            icon={<Film className="w-5 h-5 text-blue-600" />}
            done={!!movieId}
            open={step === 3}
            onToggle={() => setStep(step === 3 ? 0 : 3)}
          >
            {!theaterId ? (
              <div className="text-gray-500">Hãy chọn rạp trước.</div>
            ) : loadingMovies ? (
              <div className="text-gray-500">Đang tải...</div>
            ) : moviesOfTheater.length === 0 ? (
              <div className="text-gray-500">Rạp này chưa có phim phù hợp.</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {moviesOfTheater.map((m) => {
                  const id = m._id || m.movieId;
                  return (
                    <button
                      key={id}
                      onClick={() => pickMovie(id)}
                      className={[
                        "group relative overflow-hidden rounded-xl ring-1 ring-gray-200 bg-white shadow-sm",
                        "hover:shadow-lg hover:ring-blue-300 transition",
                        movieId === id ? "ring-2 ring-blue-600" : "",
                      ].join(" ")}
                      title={m.movieName}
                    >
                      <img
                        src={m.poster}
                        alt={m.movieName}
                        className="aspect-[2/3] w-full object-cover group-hover:scale-[1.03] transition-transform"
                      />
                      <div className="p-2">
                        <div className="text-sm font-semibold line-clamp-2">{m.movieName}</div>
                        <div className="text-xs text-gray-500">{m.duration} phút</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </StepCard>

          {/* Step 4: Suất */}
          <StepCard
            index={4}
            title="Chọn suất"
            icon={<Clock className="w-5 h-5 text-blue-600" />}
            done={false}
            open={step === 4}
            onToggle={() => setStep(step === 4 ? 0 : 4)}
          >
            {!movieId ? (
              <div className="text-gray-500">Hãy chọn phim trước.</div>
            ) : loadingShows ? (
              <div className="text-gray-500">Đang tải...</div>
            ) : showsForPickedMovie.length === 0 ? (
              <div className="text-gray-500">Chưa có suất chiếu phù hợp.</div>
            ) : (
              <div className="space-y-4">
                {grouped.map(({ date, items }) => (
                  <div key={date.toISOString()} className="space-y-2">
                    <div className="text-sm font-bold text-gray-700">{fmtDate(date)}</div>
                    <div className="flex flex-wrap gap-2">
                      {items.map((show) => (
                        <Button
                          key={show._id}
                          variant="outline"
                          className="
                            text-xs font-medium text-gray-700 border border-gray-300
                            px-3 py-2 rounded-md bg-white shadow-sm
                            transition-all duration-200 ease-out
                            hover:text-blue-700 hover:border-blue-400 hover:bg-blue-50
                            hover:shadow-md motion-safe:hover:-translate-y-0.5
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40
                          "
                          onClick={() => navigate(`/booking/show/${show._id}`)}
                          title="Chọn suất này"
                        >
                          {fmtTime(show.startTime)}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

            )}
          </StepCard>
        </div>

        {/* RIGHT: summary */}
        <aside className="space-y-3">
          <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b font-semibold text-gray-800">Tóm tắt</div>
            <div className="p-4 flex gap-3">
              <div className="w-20 h-28 bg-gray-100 rounded-lg overflow-hidden shrink-0 ring-1 ring-gray-200">
                {pickedMovie?.poster ? (
                  <img src={pickedMovie.poster} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full grid place-items-center text-gray-400">—</div>
                )}
              </div>
              <div className="flex-1 text-sm">
                <div className="font-semibold line-clamp-2">{pickedMovie?.movieName || "-"}</div>
                <div className="text-gray-600 mt-1">{pickedSystem?.name || "-"}</div>
                <div className="text-gray-600">{pickedTheater?.theaterName || "-"}</div>
                <div className="text-gray-500 text-xs mt-1">
                  Chọn các bước bên trái để tiếp tục
                </div>
              </div>
            </div>
          </div>

          <Button
            disabled={!systemId || !theaterId || !movieId || showsForPickedMovie.length === 0}
            onClick={() => {
              // Chọn suất ở bước 4 mới enable thật sự; nút này chỉ nhắc
              const first = showsForPickedMovie[0];
              if (first) navigate(`${CUSTOMER_PATH.BOOKING}/show/${first._id}`);
            }}
            className="w-full h-11 text-base"
          >
            Tiếp tục
          </Button>

          <button
            onClick={() => window.history.back()}
            className="w-full h-11 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium hover:bg-gray-50"
          >
            Quay lại
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Booking;
