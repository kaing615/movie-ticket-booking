import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Input, Modal, message, Tooltip, Table, Tag, Collapse } from "antd";
import { EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { userApi } from "../../api/modules/user.api.js";
import { bookingApi } from "../../api/modules/booking.api.js";
import { logout, updateUser } from "../../redux/features/auth.slice.js";
const BookingHistory = () => {
    const { Panel } = Collapse;
    
    const { data: bookings, isLoading } = useQuery({
        queryKey: ['bookings'],
        queryFn: () => bookingApi.getMyBookings(),
    });

    console.log('Fetched bookings:', bookings);
    const bookingColumns = [
        {
            title: 'Mã đặt vé',
            dataIndex: '_id',
            key: '_id',
            width: 80,
            render: (id) => <span className="font-mono">{id.slice(-6)}</span>
        },
        {
            title: 'Phim',
            dataIndex: 'movieInfo',
            key: 'movieName',
            render: (movieInfo) => (
                <div className="flex items-center gap-2">
                    <span>{movieInfo.name}</span>
                </div>
            )
        },
        {
            title: 'Rạp/Phòng',
            dataIndex: 'theaterInfo',
            key: 'theater',
            render: (theaterInfo) => (
                <div>
                    <div>{theaterInfo.theaterName}</div>
                    <div className="text-gray-500 text-sm">{theaterInfo?.roomNumber ?? "Đã hủy"}</div>
                </div>
            )
        },
        {
            title: 'Thời gian chiếu',
            dataIndex: 'showInfo',
            key: 'showTime',
            render: (showInfo) => {
                if (!showInfo?.startTime || !showInfo?.endTime) {
                return <span className="text-gray-400">Đã hủy</span>;
                }
                return (
                <div>
                    <div>{new Date(showInfo.startTime).toLocaleString('vi-VN')}</div>
                    <div className="text-gray-500 text-sm">
                    → {new Date(showInfo.endTime).toLocaleTimeString('vi-VN')}
                    </div>
                </div>
                );
            }
        },
        {
            title: 'Ngày đặt',
            dataIndex: 'createdAt',
            key: 'createdAt',
            width: 100,
            render: (date) => new Date(date).toLocaleDateString('vi-VN')
        },
        {
            title: 'Tổng tiền',
            dataIndex: 'totalPrice',
            key: 'totalPrice',
            width: 120,
            render: (price) => `${price.toLocaleString()}đ`
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status) => {
                const color = {
                    pending: 'gold',
                    paid: 'green',
                    cancelled: 'red',
                    expired: 'gray',
                    refund: 'blue',
                    refunded: 'purple'
                }[status];
                const text = {
                    pending: 'Chờ thanh toán',
                    paid: 'Đã thanh toán',
                    cancelled: 'Đã hủy',
                    expired: 'Hết hạn',
                    refund: 'Chờ hoàn tiền',    
                    refunded: 'Đã hoàn tiền'
                }[status];
                return <Tag color={color}>{text}</Tag>;
            }
        },
    ];

    const ticketColumns = [
        {
            title: 'Ghế',
            dataIndex: 'seatId',
            key: 'seat',
            render: (seat) => (
                <div>
                    <div>Số ghế: {seat.seatNumber}</div>
                </div>
            )
        },
        {
            title: 'Loại ghế',
            dataIndex: ['seatId', 'seatType'],
            key: 'seatType',
            render: (_, record) => {
                const type = record.seatId.seatType;
                const color = {
                    'VIP': 'gold',
                    'Tiêu chuẩn': 'blue',
                    'Couple': 'pink'
                }[type];
                return <Tag color={color}>{type}</Tag>;
            }
        },
        {
            title: 'Giá vé',
            dataIndex: 'price',
            key: 'price',
            render: (price) => `${price.toLocaleString()}đ`
        },
        {
            title: 'Trạng thái',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const color = {
                    active: 'green',
                    used: 'blue',
                    cancelled: 'red',
                    refunded: 'purple'
                }[status];
                const text = {
                    active: 'Đặt thành công',
                    used: 'Đã sử dụng',
                    cancelled: 'Đã hủy',
                    refunded: 'Đã hoàn tiền'
                }[status];
                return <Tag color={color}>{text}</Tag>;
            }
        }
    ];

    return (
        <div >
            <h3 className="text-3xl font-bold text-blue-700 text-center mb-8">Lịch sử đặt vé</h3>
            <Table
                dataSource={bookings}
                columns={bookingColumns}
                loading={isLoading}
                expandable={{
                    expandedRowRender: (booking) => (
                        <Collapse ghost>
                            <Panel header="Chi tiết vé" key="1">
                                <Table
                                    className="overflow-x-auto"
                                    scroll={{ x: true }}
                                    dataSource={booking.tickets}
                                    columns={ticketColumns}
                                    pagination={false}
                                />
                            </Panel>
                        </Collapse>
                    ),
                }}
                rowKey="_id"
            />
        </div>
    );
};

export default BookingHistory;