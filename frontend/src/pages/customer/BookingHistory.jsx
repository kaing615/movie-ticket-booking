// src/pages/customer/BookingHistory.jsx
import React from "react";
import { Table, Tag, Collapse } from "antd";
import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "../../api/modules/booking.api.js";
import ETicket from "./ETicket";

const { Panel } = Collapse;

const getRow = (s) => String(s?.row || "").toUpperCase();
const getNum = (s) => {
  const n = parseInt(String(s?.seatNumber ?? "").replace(/\D/g, "") || "0", 10);
  return Number.isFinite(n) ? n : 0;
};

// Gộp cặp Couple để tính tổng và bảng tóm tắt
function groupTickets(tickets = []) {
  const rows = [];
  const used = new Set();

  for (const t of tickets) {
    if (!t?.seatId || used.has(String(t._id))) continue;

    const seat = t.seatId;
    const type = seat.seatType;
    const row = getRow(seat);
    const num = getNum(seat);

    if (type === "Couple") {
      const pair = tickets.find(
        (u) =>
          String(u._id) !== String(t._id) &&
          u?.seatId?.seatType === "Couple" &&
          getRow(u.seatId) === row &&
          Math.abs(getNum(u.seatId) - num) === 1 &&
          !used.has(String(u._id))
      );

      const n2 = pair ? getNum(pair.seatId) : null;
      const a = Math.min(num, n2 ?? num);
      const b = Math.max(num, n2 ?? num);
      const label =
        row && row !== "VIP"
          ? `${row}${a}${n2 ? `-${b}` : ""}`
          : `${a}${n2 ? `-${b}` : ""}`;

      rows.push({
        key: String(t._id),
        seatLabel: label,
        seatType: "Couple",
        price: t.price ?? 180000,
        status: t.status,
      });

      used.add(String(t._id));
      if (pair) used.add(String(pair._id));
    } else {
      const label = row === "VIP" ? `${num}` : `${row}${num}`;
      rows.push({
        key: String(t._id),
        seatLabel: label,
        seatType: type,
        price: t.price,
        status: t.status,
      });
      used.add(String(t._id));
    }
  }

  return rows;
}

const BookingHistory = () => {
  const { data: bookings = [], isLoading } = useQuery({
    queryKey: ["bookings"],
    queryFn: () => bookingApi.getMyBookings(),
  });

  const bookingColumns = [
    {
      title: "Mã đặt vé",
      dataIndex: "_id",
      key: "_id",
      width: 80,
      render: (id) => <span className="font-mono">{String(id).slice(-6)}</span>,
    },
    {
      title: "Phim",
      dataIndex: "movieInfo",
      key: "movieName",
      render: (movieInfo) => <span>{movieInfo?.name}</span>,
    },
    {
      title: "Rạp/Phòng",
      dataIndex: "theaterInfo",
      key: "theater",
      render: (theaterInfo) => (
        <div>
          <div>{theaterInfo?.theaterName}</div>
          <div className="text-gray-500 text-sm">
            {theaterInfo?.roomNumber ?? "Đã hủy"}
          </div>
        </div>
      ),
    },
    {
      title: "Thời gian chiếu",
      dataIndex: "showInfo",
      key: "showTime",
      render: (showInfo) => {
        if (!showInfo?.startTime || !showInfo?.endTime)
          return <span className="text-gray-400">Đã hủy</span>;
        return (
          <div>
            <div>{new Date(showInfo.startTime).toLocaleString("vi-VN")}</div>
            <div className="text-gray-500 text-sm">
              → {new Date(showInfo.endTime).toLocaleTimeString("vi-VN")}
            </div>
          </div>
        );
      },
    },
    {
      title: "Ngày đặt",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 100,
      render: (date) => new Date(date).toLocaleDateString("vi-VN"),
    },
    {
      title: "Tổng tiền",
      key: "totalPrice",
      width: 120,
      render: (_, booking) => {
        const grouped = groupTickets(booking.tickets);
        const sum = grouped.reduce((s, x) => s + (x.price || 0), 0);
        return `${sum.toLocaleString()}đ`;
      },
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => {
        const color =
          {
            pending: "gold",
            paid: "green",
            cancelled: "red",
            expired: "gray",
            refund: "blue",
            refunded: "purple",
          }[status] || "default";
        const text =
          {
            pending: "Chờ thanh toán",
            paid: "Đã thanh toán",
            cancelled: "Đã hủy",
            expired: "Hết hạn",
            refund: "Chờ hoàn tiền",
            refunded: "Đã hoàn tiền",
          }[status] || status;
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  const ticketColumns = [
    {
      title: "Ghế",
      dataIndex: "seatLabel",
      key: "seatLabel",
      render: (label) => <div>Số ghế: {label}</div>,
    },
    {
      title: "Loại ghế",
      dataIndex: "seatType",
      key: "seatType",
      render: (type) => {
        const color =
          { VIP: "gold", "Tiêu chuẩn": "blue", Couple: "pink" }[type] ||
          "default";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Giá vé",
      dataIndex: "price",
      key: "price",
      render: (price) => `${(price || 0).toLocaleString()}đ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const color =
          {
            active: "green",
            used: "blue",
            cancelled: "red",
            refunded: "purple",
          }[status] || "default";
        const text =
          {
            active: "Đặt thành công",
            used: "Đã sử dụng",
            cancelled: "Đã hủy",
            refunded: "Đã hoàn tiền",
          }[status] || status;
        return <Tag color={color}>{text}</Tag>;
      },
    },
  ];

  return (
    <div>
      <h3 className="text-3xl font-bold text-blue-700 text-center mb-8">
        Lịch sử đặt vé
      </h3>
      <Table
        dataSource={bookings}
        columns={bookingColumns}
        loading={isLoading}
        rowKey="_id"
        expandable={{
          expandedRowRender: (booking) => {
            const grouped = groupTickets(booking.tickets);

            // Chuẩn hoá ticket để hiện seatLabel đúng trên E-Ticket (VD: B1, VIP -> 1)
            const ticketsWithLabel = (booking.tickets || []).map((t) => {
              const row = getRow(t.seatId);
              const num = getNum(t.seatId);
              const seatLabel =
                row && row !== "VIP" ? `${row}${num}` : `${num}`;
              return {
                ...t,
                seatLabel,
                seatType: t.seatId?.seatType || t.seatType,
              };
            });

            return (
              <Collapse ghost>
                <Panel header="Chi tiết vé" key="1">
                  {/* E-Tickets */}
                  <div className="overflow-x-auto">
                    <div className="flex gap-4 md:gap-5 min-w-full md:min-w-[0]">
                      {ticketsWithLabel.map((t) => (
                        <ETicket key={t._id} ticket={t} booking={booking} />
                      ))}
                    </div>
                  </div>

                  {/* Bảng tóm tắt (gộp Couple thành 1 dòng) */}
                  <Table
                    className="overflow-x-auto"
                    scroll={{ x: true }}
                    dataSource={grouped}
                    columns={ticketColumns}
                    pagination={false}
                    rowKey="key"
                    title={() => "Tóm tắt vé (gộp Couple)"}
                  />
                </Panel>
              </Collapse>
            );
          },
        }}
      />
    </div>
  );
};

export default BookingHistory;
