// src/components/customer/ETicket.jsx
import React from "react";
import { QRCodeCanvas } from "qrcode.react"; // npm i qrcode.react
import { CheckCircle2 } from "lucide-react";

const fmtTime = (d) =>
  new Date(d).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
const fmtDate = (d) =>
  new Date(d).toLocaleDateString("vi-VN", { weekday: "short", day: "2-digit", month: "2-digit" });
const formatVND = (n = 0) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(n);

const statusColor = (s) =>
  s === "active"
    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
    : s === "used"
    ? "bg-gray-100 text-gray-600 border-gray-200"
    : s === "cancelled"
    ? "bg-rose-50 text-rose-700 border-rose-200"
    : "bg-amber-50 text-amber-700 border-amber-200";

export default function ETicket({ ticket, booking }) {
  // booking được lấy từ /booking/me (đã format sẵn)
  const movie = booking?.movieInfo;
  const show = booking?.showInfo;
  const theater = booking?.theaterInfo;

  const seatLabel = ticket?.seatId?.seatNumber || ticket?.seatLabel;
  const seatType = ticket?.seatId?.seatType || ticket?.seatType;
  const code = ticket?.code || ticket?._id;
  const price = ticket?.price;

  return (
    <div className="relative bg-white border rounded-2xl shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <span className="w-1 h-5 bg-blue-700 rounded" />
          <div className="font-semibold text-gray-800">E–Ticket</div>
        </div>
        <div
          className={
            "text-xs font-semibold px-2.5 py-1 rounded-full border " +
            statusColor(ticket?.status)
          }
          title={`Trạng thái: ${ticket?.status}`}
        >
          {ticket?.status?.toUpperCase()}
        </div>
      </div>

      <div className="grid grid-cols-[140px_1fr_128px] gap-0">
        {/* Poster */}
        <div className="bg-gray-100">
          <img
            src={movie?.poster}
            alt={movie?.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Info */}
        <div className="p-4 grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <div className="text-lg font-bold text-gray-900 line-clamp-2">
              {movie?.name}
            </div>
            <div className="text-xs text-gray-500">
              {fmtDate(show?.startTime)} • {fmtTime(show?.startTime)}
            </div>
          </div>

          <div className="space-y-1 text-sm">
            <div className="text-gray-500">Rạp</div>
            <div className="font-semibold text-gray-800">{theater?.theaterName}</div>
            {theater?.roomNumber && (
              <div className="text-gray-600 text-xs">Phòng {theater.roomNumber}</div>
            )}
          </div>

          <div className="space-y-1 text-sm">
            <div className="text-gray-500">Ghế</div>
            <div className="font-semibold text-gray-800">{seatLabel}</div>
            <div className="text-gray-600 text-xs">{seatType}</div>
          </div>

          <div className="space-y-1 text-sm">
            <div className="text-gray-500">Giá</div>
            <div className="font-semibold text-gray-800">{formatVND(price)}</div>
          </div>

          <div className="space-y-1 text-sm">
            <div className="text-gray-500">Mã vé</div>
            <div className="font-mono font-semibold text-gray-800 break-all">
              {code}
            </div>
          </div>
        </div>

        {/* QR */}
        <div className="p-3 flex flex-col items-center justify-center bg-white">
          <div className="rounded-xl border shadow-sm p-2 bg-white">
            <QRCodeCanvas value={code} size={96} includeMargin />
          </div>
          <div className="mt-2 text-[11px] text-gray-500 text-center leading-4">
            Quét mã tại quầy để vào rạp
          </div>
        </div>
      </div>

      {/* Đường đục lỗ kiểu vé giấy */}
      <div className="absolute top-1/2 -translate-y-1/2 left-[140px] right-[128px] h-0 border-t border-dashed border-gray-300" />
      <div className="absolute top-1/2 -translate-y-1/2 -left-2 w-4 h-4 bg-white rounded-full shadow-inner border" />
      <div className="absolute top-1/2 -translate-y-1/2 -right-2 w-4 h-4 bg-white rounded-full shadow-inner border" />

      {/* Footer */}
      {ticket?.status === "active" && (
        <div className="px-4 py-2 border-t bg-white text-xs text-emerald-700 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Vé hợp lệ. Vui lòng đến đúng giờ.
        </div>
      )}
    </div>
  );
}
