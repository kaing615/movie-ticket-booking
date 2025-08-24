// src/pages/customer/SeatSelection.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { showApi } from "../../api/modules/show.api";
import { bookingApi } from "../../api/modules/booking.api";
import { Button } from "../../components/common/button";
import { ClockIcon, RefreshCw, XCircle, CheckCircle2 } from "lucide-react";
import { theme } from "antd";

/* ================= Helpers ================= */
const PRICE_MAP = {
  VIP: 120000,
  "Tiêu chuẩn": 90000,
  Couple: 180000,
  standard: 90000,
};
const formatVND = (n = 0) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

// lấy row+số (tương thích A1/B2… hoặc row + seatNumber tách riêng)
const getRow = (s) => {
  if (s.row) return String(s.row).toUpperCase();
  const m = String(s.seatNumber || "").match(/^[A-Za-z]+/);
  return (m?.[0] || "").toUpperCase();
};
const getNum = (s) => {
  const digits = String(s.seatNumber ?? "").replace(/\D/g, "");
  const n = parseInt(digits, 10);
  return Number.isFinite(n) ? n : 0;
};

// Chuẩn hoá: đảm bảo luôn có row hợp lệ
const normalizeSeats = (list = []) =>
  list.map((s) => {
    let row = (s.row || "").trim().toUpperCase();
    if (!row) {
      const m = String(s.seatNumber || "").match(/^[A-Za-z]+/);
      row = m?.[0]?.toUpperCase() || (s.seatType === "VIP" ? "VIP" : "A");
    }
    return { ...s, row };
  });

// build rows: A..Z + VIP cuối
const buildRows = (seats = []) => {
  const vip = [];
  const rowsMap = new Map();

  for (const s of seats) {
    const row = getRow(s);
    if (s.seatType === "VIP" || row === "VIP") {
      vip.push(s);
    } else {
      if (!rowsMap.has(row)) rowsMap.set(row, []);
      rowsMap.get(row).push(s);
    }
  }

  for (const [, arr] of rowsMap) arr.sort((a, b) => getNum(a) - getNum(b));
  const normalRows = Array.from(rowsMap.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  );

  if (vip.length) vip.sort((a, b) => getNum(a) - getNum(b));
  if (vip.length) normalRows.push(["VIP", vip]);

  return normalRows;
};

const seatTypeLabel = (t) => (t === "standard" ? "Tiêu chuẩn" : t);

// đếm ngược giữ ghế
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

/* =================== Page =================== */
const SeatSelection = () => {
  theme.useToken(); // giữ context AntD

  const { showId } = useParams();
  const nav = useNavigate();
  const qc = useQueryClient();

  const [selectedIds, setSelectedIds] = useState([]); // id ghế đang chọn (Couple có thể 2 id)
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

  // chuẩn hoá seats từ API
  const seats = useMemo(() => normalizeSeats(seatData.seats || []), [seatData.seats]);
  const sold = seatData.sold || [];
  const held = seatData.held || [];

  const soldSet = useMemo(() => new Set(sold.map(String)), [sold]);
  const heldSet = useMemo(() => new Set(held.map(String)), [held]);

  const rows = useMemo(() => buildRows(seats), [seats]);

  const effectiveSelected = useMemo(
    () => (myHold.seatIds?.length ? myHold.seatIds : selectedIds),
    [selectedIds, myHold.seatIds]
  );
  const selectedSet = useMemo(
    () => new Set(effectiveSelected.map(String)),
    [effectiveSelected]
  );

  const selectedSeats = useMemo(
    () => seats.filter((s) => selectedSet.has(String(s._id))),
    [seats, selectedSet]
  );

  const totalPrice = useMemo(
    () => selectedSeats.reduce((sum, s) => sum + (PRICE_MAP[s.seatType] || 0), 0),
    [selectedSeats]
  );

  /* --- Mutations --- */
  const holdMutation = useMutation({
    mutationFn: (seatIds) => showApi.holdSeats(showId, seatIds, 180),
    onSuccess: (res) => {
      setMyHold(res?.hold || { seatIds: [], expiresAt: null });
      setSelectedIds([]);
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
    mutationFn: () => showApi.releaseHold(showId),
    onSuccess: () => {
      setMyHold({ seatIds: [], expiresAt: null });
      setSelectedIds([]);
      refetch();
    },
  });

  const confirmMutation = useMutation({
    mutationFn: () => bookingApi.confirmFromHold(showId),
    onSuccess: (res) => {
      setMyHold({ seatIds: [], expiresAt: null });
      setSelectedIds([]);
      qc.invalidateQueries({ queryKey: ["seats-of-show", showId] });
      qc.invalidateQueries({ queryKey: ["booking/me"] });
      qc.invalidateQueries({ queryKey: ["my-tickets", "paid"] });
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

  useEffect(() => {
    return () => {
      if (myHold.seatIds?.length) showApi.releaseHold(showId).catch(() => {});
    };
  }, [myHold.seatIds, showId]);

  /* ------------ Toggle logic (Couple = 1 block) ------------ */
  const getPairedSeat = (seat) => {
    if (seat.seatType !== "Couple") return null;
    const row = getRow(seat);
    const num = getNum(seat);
    return seats.find(
      (s) =>
        s._id !== seat._id &&
        s.seatType === "Couple" &&
        getRow(s) === row &&
        Math.abs(getNum(s) - num) === 1
    );
  };

  const canInteractSeat = (id) =>
    !soldSet.has(String(id)) &&
    !heldSet.has(String(id)) &&
    !myHold.seatIds?.map(String).includes(String(id));

  const toggleSeat = (seat) => {
    const id = String(seat._id);

    // Couple → chọn / bỏ cả cặp
    if (seat.seatType === "Couple") {
      const pair = getPairedSeat(seat);
      const ids = pair ? [id, String(pair._id)] : [id];

      if (!ids.every((sid) => canInteractSeat(sid))) return;

      setSelectedIds((cur) => {
        const hasBoth = ids.every((sid) => cur.map(String).includes(sid));
        return hasBoth ? cur.filter((x) => !ids.includes(String(x))) : [...cur, ...ids];
      });
      return;
    }

    // Standard/VIP
    if (!canInteractSeat(id)) return;
    setSelectedIds((cur) =>
      cur.map(String).includes(id)
        ? cur.filter((x) => String(x) !== id)
        : [...cur, seat._id]
    );
  };

  /* --- Seat styles (Tailwind class) --- */
  const seatBtnClass = (base) =>
    base +
    " h-10 w-[46px] md:w-[52px] rounded-2xl border text-[11px] font-semibold grid place-items-center transition-all select-none shadow-sm active:scale-[0.98] backdrop-blur";

  const styleForSeatClass = (s) => {
    const id = String(s._id);
    const isSold = soldSet.has(id);
    const isHeld = heldSet.has(id);
    const isMine = myHold.seatIds?.map(String).includes(id);
    const isSel = selectedSet.has(id);

    // highlight theo loại (glass ring)
    const typeRing =
      s.seatType === "VIP"
        ? " ring-2 ring-amber-300/70"
        : s.seatType === "Couple"
        ? " ring-2 ring-rose-300/70"
        : " ring-1 ring-slate-200/80";

    if (isSold)
      return `bg-slate-200/80 border-slate-300 text-slate-500 cursor-not-allowed ${typeRing}`;
    if (isMine)
      return `bg-emerald-600/90 border-emerald-600 text-white shadow ${typeRing}`;
    if (isHeld)
      return `bg-amber-100/80 border-amber-300 text-amber-700 cursor-not-allowed ${typeRing}`;
    if (isSel)
      return `bg-indigo-600/95 border-indigo-600 text-white shadow hover:shadow-md ${typeRing}`;
    // default glass
    return `bg-white/70 border-white/40 hover:bg-indigo-50/80 hover:border-indigo-300 hover:-translate-y-0.5 ${typeRing}`;
  };

  const renderCoupleBlock = (leftSeat) => {
    const rightSeat = getPairedSeat(leftSeat);
    // nếu là ghế bên phải thì bỏ (chỉ render 1 block từ ghế trái)
    if (rightSeat && getNum(leftSeat) > getNum(rightSeat)) return null;

    const ids = rightSeat
      ? [String(leftSeat._id), String(rightSeat._id)]
      : [String(leftSeat._id)];

    const isSold = ids.some((id) => soldSet.has(id));
    const isHeld = ids.some((id) => heldSet.has(id));
    const isMine = ids.some((id) => myHold.seatIds?.map(String).includes(id));
    const isSel = ids.some((id) => selectedSet.has(id));

    const base =
      "h-10 rounded-2xl border text-[11px] font-semibold grid place-items-center transition-all select-none shadow-sm active:scale-[0.98] w-[112px] md:w-36 backdrop-blur";
    let cls =
      base +
      " " +
      (isSold
        ? "bg-slate-200/80 border-slate-300 text-slate-500 cursor-not-allowed"
        : isMine
        ? "bg-emerald-600/90 border-emerald-600 text-white shadow"
        : isHeld
        ? "bg-amber-100/80 border-amber-300 text-amber-700 cursor-not-allowed"
        : isSel
        ? "bg-indigo-600/95 border-indigo-600 text-white shadow hover:shadow-md"
        : "bg-white/70 border-white/40 hover:bg-indigo-50/80 hover:border-indigo-300 hover:-translate-y-0.5") +
      " ring-2 ring-rose-300/70";

    const row = getRow(leftSeat);
    const label = rightSeat
      ? `${row}${getNum(leftSeat)}-${getNum(rightSeat)}`
      : `${row}${getNum(leftSeat)}`;

    return (
      <button
        key={leftSeat._id}
        className={cls}
        title={`Couple • ${label}`}
        onClick={() => toggleSeat(leftSeat)}
        disabled={isSold || isHeld || isMine}
      >
        {label}
      </button>
    );
  };

  /* --- Pay --- */
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

  return (
    <div className="w-full min-h-screen bg-[radial-gradient(80%_60%_at_50%_-20%,#dbeafe_0%,transparent_60%),radial-gradient(70%_50%_at_120%_20%,#fde68a_0%,transparent_40%)]">
      {/* Header */}
      <div className="container mx-auto px-4 pt-8 lg:max-w-6xl">
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-800">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 via-purple-700 to-rose-600">
                Chọn ghế
              </span>
            </h1>

            {/* Stepper + progress */}
            <div className="flex items-center gap-3 min-w-[220px]">
              <div className="flex items-center gap-2 text-[13px]">
                <span className="h-6 w-6 grid place-items-center rounded-full bg-indigo-600 text-white font-bold shadow">1</span>
                <span className="text-slate-700 font-medium">Ghế</span>
              </div>
              <div className="h-[2px] w-14 bg-gradient-to-r from-indigo-500 to-sky-400 rounded" />
              <div className={`flex items-center gap-2 text-[13px] ${myHold.seatIds?.length ? "opacity-100" : "opacity-50"}`}>
                <span className={`h-6 w-6 grid place-items-center rounded-full ${myHold.seatIds?.length ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-600"} font-bold shadow`}>2</span>
                <span className="text-slate-700 font-medium">Thanh toán</span>
              </div>
              <div className="h-[2px] w-14 bg-slate-200 rounded" />
              <div className="flex items-center gap-2 text-[13px] opacity-60">
                <span className="h-6 w-6 grid place-items-center rounded-full bg-slate-200 text-slate-600 font-bold">3</span>
                <span className="text-slate-700 font-medium">Xác nhận</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-10 lg:max-w-6xl grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* LEFT */}
        <div className="xl:pr-2">
          {/* màn hình cong */}
          <div className="relative mb-6">
            <svg viewBox="0 0 100 16" className="w-full h-12">
              <defs>
                <linearGradient id="screenStroke" x1="0" x2="1" y1="0" y2="0">
                  <stop offset="0%" stopColor="#e5e7eb" />
                  <stop offset="50%" stopColor="#9ca3af" />
                  <stop offset="100%" stopColor="#e5e7eb" />
                </linearGradient>
              </defs>
              <path d="M0,2 Q50,14 100,2" stroke="url(#screenStroke)" strokeWidth="1.6" fill="none" />
              <path d="M0,2 Q50,14 100,2 L100,16 L0,16 Z" fill="#fff" opacity=".7" />
            </svg>
            <div className="absolute -top-1 left-1/2 -translate-x-1/2 text-[11px] tracking-[0.25em] text-slate-500">
              MÀN HÌNH
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-2.5 mb-4 text-xs">
            {[
              { swatch: "bg-white/70 border border-white/40", label: "Trống" },
              { swatch: "bg-indigo-600", label: "Đang chọn" },
              { swatch: "bg-amber-200/90 border border-amber-300", label: "Người khác giữ" },
              { swatch: "bg-slate-300", label: "Đã bán" },
              { swatch: "bg-white ring-2 ring-amber-300/70", label: "VIP" },
              { swatch: "bg-white ring-2 ring-rose-300/70", label: "Couple" },
            ].map((x) => (
              <span key={x.label} className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-white/70 ring-1 ring-white/40 backdrop-blur text-slate-700">
                <span className={`w-4 h-4 rounded ${x.swatch}`} />
                {x.label}
              </span>
            ))}
          </div>

          {/* Seat grid */}
          <div
            className="rounded-3xl border border-white/40 shadow-xl p-5 md:p-6 bg-white/60 backdrop-blur-xl"
            style={{
              backgroundImage:
                "radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)",
              backgroundSize: "16px 16px",
            }}
          >
            {isLoading ? (
              <div className="text-slate-600">Đang tải sơ đồ ghế…</div>
            ) : isError ? (
              <div className="text-rose-600">Không tải được ghế. Vui lòng thử lại.</div>
            ) : rows.length === 0 ? (
              <div className="text-slate-600">Phòng chưa cấu hình ghế.</div>
            ) : (
              <div className="space-y-4">
                {rows.map(([rowKey, arr]) => (
                  <div key={rowKey} className="grid grid-cols-[56px_1fr_56px] items-center">
                    {/* label trái */}
                    <div className="text-center">
                      <span className="inline-flex items-center justify-center min-w-10 px-2 py-1 rounded-full bg-white/80 ring-1 ring-white/40 text-[11px] font-semibold text-slate-700 backdrop-blur">
                        {rowKey || (arr[0] && getRow(arr[0])) || "—"}
                      </span>
                    </div>

                    {/* seats giữa */}
                    <div className="min-w-0 flex flex-wrap justify-center gap-2.5 md:gap-3">
                      {arr.map((s) => {
                        if (s.seatType === "Couple") return renderCoupleBlock(s);

                        // VIP nền metallic nhẹ
                        const isVip = (rowKey || getRow(s)) === "VIP";
                        const cls = seatBtnClass(
                          `${styleForSeatClass(s)} ${
                            isVip
                              ? "bg-gradient-to-br from-amber-200/90 via-yellow-200/90 to-amber-100/90 text-slate-800 border-amber-200 hover:from-amber-300/90 hover:to-yellow-200/90"
                              : ""
                          }`
                        );

                        const label =
                          isVip ? `${getNum(s)}` : `${rowKey || getRow(s)}${getNum(s)}`;

                        const disabled =
                          soldSet.has(String(s._id)) ||
                          heldSet.has(String(s._id)) ||
                          myHold.seatIds?.map(String).includes(String(s._id));

                        return (
                          <button
                            key={s._id}
                            onClick={() => toggleSeat(s)}
                            className={cls}
                            disabled={disabled}
                            title={`${label} • ${seatTypeLabel(s.seatType)}`}
                            aria-label={label}
                          >
                            {label}
                          </button>
                        );
                      })}
                    </div>

                    {/* label phải */}
                    <div className="text-center">
                      <span className="inline-flex items-center justify-center min-w-10 px-2 py-1 rounded-full bg-white/80 ring-1 ring-white/40 text-[11px] font-semibold text-slate-700 backdrop-blur">
                        {rowKey || (arr[0] && getRow(arr[0])) || "—"}
                      </span>
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
            <div className="rounded-3xl border border-white/40 bg-white/70 backdrop-blur-xl shadow-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-white/40 bg-gradient-to-r from-indigo-50/80 to-sky-50/80">
                <div className="font-bold text-slate-800">Tóm tắt</div>
                <div className="mt-1 text-xs text-slate-600 flex items-center gap-3">
                  <span className="inline-flex items-center gap-1">
                    <ClockIcon className="w-3.5 h-3.5" /> Giữ ghế:
                  </span>
                  <span
                    className={`font-semibold ${
                      myHold.expiresAt
                        ? left > 0
                          ? "text-indigo-700"
                          : "text-rose-600"
                        : "text-slate-400"
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
                    <div className="text-sm text-slate-600">Chưa chọn ghế.</div>
                  ) : (
                    <div className="flex flex-wrap gap-1.5">
                      {selectedSeats
                        .filter((s) => {
                          if (s.seatType !== "Couple") return true;
                          const pair = getPairedSeat(s);
                          return !pair || getNum(s) < getNum(pair);
                        })
                        .map((s) => {
                          if (s.seatType === "Couple") {
                            const pair = getPairedSeat(s);
                            const label = pair
                              ? `${getRow(s)}${getNum(s)}-${getNum(pair)}`
                              : `${getRow(s)}${getNum(s)}`;
                            return (
                              <span
                                key={s._id}
                                className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-rose-50 text-rose-700 text-xs font-semibold ring-1 ring-rose-200"
                              >
                                {label} <span className="text-rose-500/70">(Couple)</span>
                              </span>
                            );
                          }
                          const label =
                            getRow(s) === "VIP" ? `${getNum(s)}` : `${getRow(s)}${getNum(s)}`;
                          return (
                            <span
                              key={s._id}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-semibold ring-1 ring-indigo-200"
                            >
                              {label}
                              <span className="text-[10px] text-indigo-500/70">
                                ({seatTypeLabel(s.seatType)})
                              </span>
                            </span>
                          );
                        })}
                    </div>
                  )}
                </div>

                {/* Tổng tiền */}
                <div className="flex items-center justify-between pt-2 border-t border-white/50">
                  <span className="text-sm text-slate-700">Tổng cộng</span>
                  <span className="text-xl font-extrabold text-slate-900">
                    {formatVND(totalPrice)}
                  </span>
                </div>
              </div>

              <div className="px-5 py-4 bg-white/60 border-t border-white/40 flex flex-col gap-2">
                <Button
                  disabled={selectedSeats.length === 0 || holdMutation.isPending}
                  onClick={() => holdMutation.mutate(selectedSeats.map((s) => s._id))}
                  className="w-full"
                >
                  Giữ ghế {selectedSeats.length > 0 ? `(${selectedSeats.length})` : ""}
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
                    disabled={!myHold.seatIds?.length || releaseMutation.isPending}
                    onClick={() => releaseMutation.mutate()}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Bỏ giữ
                  </Button>
                </div>

                <Button
                  className="w-full"
                  disabled={!myHold.seatIds?.length || left === 0 || confirmMutation.isPending}
                  onClick={handlePay}
                >
                  {confirmMutation.isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-transparent" />
                      Đang xử lý…
                    </span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Thanh toán & xuất vé
                    </>
                  )}
                </Button>

                <p className="text-[11px] text-slate-600 mt-1">
                  Sau khi giữ ghế, bạn có <b>3 phút</b> để thanh toán. Hết thời gian, ghế sẽ tự mở lại.
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
