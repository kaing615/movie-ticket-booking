// src/pages/customer/SeatSelection.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showApi } from "../../api/modules/show.api";
import { bookingApi } from "../../api/modules/booking.api";
import { Button } from "../../components/common/button";
import { ClockIcon, RefreshCw, XCircle, CheckCircle2 } from "lucide-react";

/* ================= Helpers ================= */
const PRICE_MAP = {
  VIP: 120000,
  "Tiêu chuẩn": 90000,
  Couple: 180000,
  standard: 90000,
};
const formatVND = (n = 0) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
    n
  );
const seatTypeLabel = (t) => (t === "standard" ? "Tiêu chuẩn" : t);
const seatRowKey = (seatNumber = "") =>
  (seatNumber.match(/^[A-Za-z]+/)?.[0] || "").toUpperCase();

const buildRows = (seats = []) => {
  const rows = new Map();
  seats.forEach((s) => {
    const key = seatRowKey(s.seatNumber);
    if (!rows.has(key)) rows.set(key, []);
    rows.get(key).push(s);
  });
  for (const [, arr] of rows) {
    arr.sort((a, b) => {
      const na = parseInt(a.seatNumber.replace(/\D/g, "") || "0", 10);
      const nb = parseInt(b.seatNumber.replace(/\D/g, "") || "0", 10);
      return na - nb;
    });
  }
  return Array.from(rows.entries()).sort((a, b) => a[0].localeCompare(b[0]));
};

const useCountdown = (expiresAt) => {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (!expiresAt) return;
    const calc = () =>
      Math.max(0, Math.floor((new Date(expiresAt) - new Date()) / 1000));
    setLeft(calc());
    const id = setInterval(() => setLeft((s) => (s > 0 ? s - 1 : 0)), 1000);
    return () => clearInterval(id);
  }, [expiresAt]);
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");
  return { left, label: `${mm}:${ss}` };
};

/* =============== Small UI bits =============== */
const LegendDot = ({ className }) => (
  <span className={`w-4 h-4 rounded ${className}`} />
);

const CurvedScreen = () => (
  <div className="relative mb-8">
    {/* SVG màn hình cong xuống */}
    <svg
      viewBox="0 0 100 16"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-12"
    >
      <defs>
        <linearGradient id="screenStroke" x1="0" x2="1" y1="0" y2="0">
          <stop offset="0%" stopColor="#e5e7eb" />
          <stop offset="50%" stopColor="#9ca3af" />
          <stop offset="100%" stopColor="#e5e7eb" />
        </linearGradient>
        <linearGradient id="screenGlow" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <filter id="softShadow" x="-10%" y="-50%" width="120%" height="200%">
          <feDropShadow
            dx="0"
            dy="2"
            stdDeviation="1.5"
            floodColor="#9ca3af"
            floodOpacity="0.35"
          />
        </filter>
      </defs>

      {/* đường cong (stroke) */}
      <path
        d="M0,2 Q50,14 100,2"
        stroke="url(#screenStroke)"
        strokeWidth="1.6"
        fill="none"
        filter="url(#softShadow)"
      />
      {/* vùng lóe sáng nhẹ phía dưới màn hình */}
      <path d="M0,2 Q50,14 100,2 L100,16 L0,16 Z" fill="url(#screenGlow)" />
    </svg>

    <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[11px] tracking-widest text-gray-500">
      Màn hình
    </div>
  </div>
);

/* =================== Page =================== */
const SeatSelection = () => {
  const { showId } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();

  const [selected, setSelected] = useState([]);
  const [myHold, setMyHold] = useState({ seatIds: [], expiresAt: null });

  /* --- Load seats --- */
  const {
    data: seatData = { seats: [], sold: [], held: [], serverTime: null },
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["seats-of-show", showId],
    enabled: !!showId,
    queryFn: () => showApi.getSeatsOfShow(showId),
    placeholderData: { seats: [], sold: [], held: [], serverTime: null },
  });

  const { seats, sold, held } = seatData;

  const soldSet = useMemo(() => new Set((sold || []).map(String)), [sold]);
  const heldSet = useMemo(() => new Set((held || []).map(String)), [held]);
  const rows = useMemo(() => buildRows(seats), [seats]);

  const selectedSet = useMemo(() => {
    const ids = myHold.seatIds?.length ? myHold.seatIds : selected;
    return new Set(ids.map((x) => String(x)));
  }, [selected, myHold]);

  const selectedSeats = useMemo(
    () => seats.filter((s) => selectedSet.has(String(s._id))),
    [seats, selectedSet]
  );

  const totalPrice = useMemo(
    () =>
      selectedSeats.reduce((sum, s) => sum + (PRICE_MAP[s.seatType] || 0), 0),
    [selectedSeats]
  );

  /* --- Mutations --- */
  const holdMutation = useMutation({
    mutationFn: (seatIds) => showApi.holdSeats(showId, seatIds, 180),
    onSuccess: (res) => {
      setMyHold(res?.hold || { seatIds: [], expiresAt: null });
      setSelected([]);
      refetch();
    },
  });

  const refreshMutation = useMutation({
    mutationFn: () => showApi.refreshHold(showId, 180),
    onSuccess: (res) => {
      setMyHold(res?.hold || { seatIds: [], expiresAt: null });
      refetch();
    },
  });

  const releaseMutation = useMutation({
    mutationFn: (seatIds) => showApi.releaseHold(showId, seatIds),
    onSuccess: () => {
      setMyHold({ seatIds: [], expiresAt: null });
      setSelected([]);
      refetch();
    },
  });

  const confirmMutation = useMutation({
    mutationFn: () => bookingApi.confirmFromHold(showId),
    onSuccess: (res) => {
      setMyHold({ seatIds: [], expiresAt: null });
      setSelected([]);
      qc.invalidateQueries({ queryKey: ["seats-of-show", showId] });
      qc.invalidateQueries({ queryKey: ["booking/me"] });
      qc.invalidateQueries({ queryKey: ["my-tickets", "paid"] }); // nếu trang vé dùng key này
      alert(res?.message || "Thanh toán thành công, đã xuất vé!");
      nav("/my-tickets");
    },
    onError: (err) => {
      alert(
        err?.response?.data?.message ||
        err?.message ||
        "Có lỗi xảy ra. Vui lòng thử lại."
      );
    },
  });

  const { left, label } = useCountdown(myHold.expiresAt);

  // ✅ Viết handlePay bên trong để dùng state & hook ở trên
  const handlePay = () => {
    if (!myHold.seatIds?.length) {
      alert("Bạn cần giữ ghế trước khi thanh toán.");
      return;
    }
    if (left === 0) {
      alert("Thời gian giữ ghế đã hết. Vui lòng giữ lại ghế.");
      return;
    }
    confirmMutation.mutate();
  };

  useEffect(() => {
    return () => {
      if (myHold.seatIds?.length) showApi.releaseHold(showId).catch(() => {});
    };
  }, [myHold.seatIds, showId]);

  const toggleSeat = (seat) => {
    const id = String(seat._id);
    const disabled =
      soldSet.has(id) ||
      heldSet.has(id) ||
      myHold.seatIds?.map(String).includes(id);
    if (disabled) return;
    setSelected((cur) =>
      cur.map(String).includes(id)
        ? cur.filter((x) => String(x) !== id)
        : [...cur, seat._id]
    );
  };

  /* --- Seat styles --- */
  const seatClass = (s) => {
    const id = String(s._id);
    const isSold = soldSet.has(id);
    const isHeld = heldSet.has(id);
    const isMine = myHold.seatIds?.map(String).includes(id);
    const isSel = selected.map(String).includes(id);

    const base =
      "h-8 w-10 rounded-lg border text-[11px] font-semibold grid place-items-center " +
      "transition transform select-none shadow-sm active:scale-[0.98]";

    const typeRing =
      s.seatType === "VIP"
        ? "ring-2 ring-purple-300/70"
        : s.seatType === "Couple"
        ? "ring-2 ring-rose-300/70"
        : "";

    if (isSold)
      return `${base} ${typeRing} bg-gray-300 border-gray-300 text-gray-500 cursor-not-allowed`;
    if (isMine)
      return `${base} ${typeRing} bg-green-600 border-green-600 text-white shadow`;
    if (isHeld)
      return `${base} ${typeRing} bg-amber-100 border-amber-300 text-amber-700 cursor-not-allowed`;
    if (isSel)
      return `${base} ${typeRing} bg-blue-600 border-blue-600 text-white shadow hover:shadow-md`;
    return `${base} ${typeRing} bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-400 hover:-translate-y-0.5`;
  };

  return (
    <div className="w-full bg-gradient-to-b from-white via-gray-50 to-white">
      {/* Header */}
      <div className="container mx-auto px-4 pt-6 lg:pt-8 lg:max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-700 rounded" />
            <h1 className="text-2xl font-bold tracking-wide text-gray-800">
              Chọn ghế
            </h1>
          </div>

          {/* Stepper mini */}
          <div className="flex items-center gap-2 text-sm">
            <span className="px-2 py-1 rounded-full bg-blue-600 text-white font-semibold">
              1
            </span>
            <span>Chọn ghế</span>
            <span className="text-gray-400">—</span>
            <span
              className={`px-2 py-1 rounded-full font-semibold ${
                myHold.seatIds?.length
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </span>
            <span>Thanh toán</span>
            <span className="text-gray-400">—</span>
            <span className="px-2 py-1 rounded-full bg-gray-200 text-gray-600 font-semibold">
              3
            </span>
            <span>Xác nhận</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8 lg:max-w-6xl grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* LEFT */}
        <div className="xl:pr-2">
          {/* Màn hình cong */}
          <CurvedScreen />

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mb-4 text-xs">
            <span className="inline-flex items-center gap-2">
              <LegendDot className="bg-white border border-gray-300" /> Trống
            </span>
            <span className="inline-flex items-center gap-2">
              <LegendDot className="bg-blue-600" /> Đang chọn
            </span>
            <span className="inline-flex items-center gap-2">
              <LegendDot className="bg-amber-200 border border-amber-300" />{" "}
              Người khác giữ
            </span>
            <span className="inline-flex items-center gap-2">
              <LegendDot className="bg-gray-300" /> Đã bán
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 rounded ring-2 ring-purple-300/70" /> VIP
            </span>
            <span className="inline-flex items-center gap-2">
              <span className="w-4 h-4 rounded ring-2 ring-rose-300/70" />{" "}
              Couple
            </span>
          </div>

          {/* Seat grid */}
          <div className="rounded-2xl border bg-white p-4 shadow-sm">
            {isLoading ? (
              <div className="text-gray-500">Đang tải sơ đồ ghế…</div>
            ) : isError ? (
              <div className="text-red-600">
                Không tải được ghế. Vui lòng thử lại.
              </div>
            ) : rows.length === 0 ? (
              <div className="text-gray-500">Phòng chưa cấu hình ghế.</div>
            ) : (
              <div className="space-y-3">
                {rows.map(([rowKey, arr]) => (
                  <div
                    key={rowKey}
                    className="grid grid-cols-[40px_1fr_40px] items-center"
                  >
                    {/* label bên trái (ngoài cùng) */}
                    <div className="text-center font-semibold text-gray-600 text-xs">
                      {rowKey}
                    </div>

                    {/* dãy ghế ở giữa, luôn căn giữa và có wrap */}
                    <div className="min-w-0 flex flex-wrap justify-center gap-2">
                      {arr.map((s) => (
                        <button
                          key={s._id}
                          onClick={() => toggleSeat(s)}
                          className={seatClass(s)}
                          disabled={
                            soldSet.has(String(s._id)) ||
                            heldSet.has(String(s._id)) ||
                            myHold.seatIds?.map(String).includes(String(s._id))
                          }
                          title={`${s.seatNumber} • ${seatTypeLabel(
                            s.seatType
                          )}`}
                        >
                          {s.seatNumber}
                        </button>
                      ))}
                    </div>

                    {/* label bên phải (ngoài cùng) */}
                    <div className="text-center font-semibold text-gray-600 text-xs">
                      {rowKey}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT (sticky) */}
        <aside className="xl:pl-2">
          <div className="xl:sticky xl:top-24 space-y-3">
            <div className="rounded-2xl border bg-white shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
                <div className="font-bold text-gray-800">Tóm tắt</div>
                <div className="mt-1 text-xs text-gray-500 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" /> Giữ ghế:
                  </span>
                  <span
                    className={`font-semibold ${
                      myHold.expiresAt
                        ? left > 0
                          ? "text-blue-700"
                          : "text-red-600"
                        : "text-gray-400"
                    }`}
                  >
                    {myHold.expiresAt ? label : "—"}
                  </span>
                </div>
              </div>

              <div className="px-5 py-4 space-y-3">
                {/* Ghế đã chọn */}
                <div>
                  <div className="text-sm font-semibold mb-1">Ghế đã chọn</div>
                  {selectedSeats.length === 0 ? (
                    <div className="text-sm text-gray-500">Chưa chọn ghế.</div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSeats.map((s) => (
                        <span
                          key={s._id}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded bg-blue-50 text-blue-700 text-xs font-semibold"
                        >
                          {s.seatNumber}
                          <span className="text-[10px] text-blue-500/70">
                            ({seatTypeLabel(s.seatType)})
                          </span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tổng tiền */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <span className="text-sm text-gray-600">Tổng cộng</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatVND(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="px-5 py-4 bg-gray-50 border-t flex flex-col gap-2">
                <Button
                  disabled={
                    selectedSeats.length === 0 || holdMutation.isPending
                  }
                  onClick={() =>
                    holdMutation.mutate(selectedSeats.map((s) => s._id))
                  }
                  className="w-full"
                >
                  Giữ ghế{" "}
                  {selectedSeats.length > 0 ? `(${selectedSeats.length})` : ""}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    disabled={!myHold.expiresAt || refreshMutation.isPending}
                    onClick={() => refreshMutation.mutate()}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Gia hạn
                  </Button>
                  <Button
                    variant="destructive"
                    className="flex-1"
                    disabled={
                      !myHold.seatIds?.length || releaseMutation.isPending
                    }
                    onClick={() => releaseMutation.mutate()}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Bỏ giữ
                  </Button>
                </div>

                <Button
                  className="w-full"
                  disabled={
                    !myHold.seatIds?.length ||
                    left === 0 ||
                    confirmMutation.isPending
                  }
                  onClick={handlePay}
                >
                  {confirmMutation.isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-200 border-t-transparent" />
                      Đang xử lý…
                    </span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Thanh toán & xuất vé
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-gray-500 mt-1">
                  Sau khi giữ ghế, bạn có <b>3 phút</b> để thanh toán. Hết thời
                  gian, ghế sẽ tự mở lại.
                </p>
              </div>
            </div>

            <Button variant="ghost" onClick={() => nav(-1)} className="w-full">
              ← Quay lại
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default SeatSelection;
