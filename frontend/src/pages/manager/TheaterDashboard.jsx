import React, { useState, useMemo } from "react";
import { Card, DatePicker, Select, Space, Table, Tag, Modal } from "antd";
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { theaterApi } from "../../api/modules/theater.api.js";
import { showApi } from "../../api/modules/show.api.js";
import { roomApi } from "../../api/modules/room.api.js";
import DeleteShowModal from "../../components/movie/DeleteShowModal.jsx";
import EditShowModal from "../../components/movie/EditShowModal.jsx";

// Add isBetween plugin to dayjs
dayjs.extend(isBetween);

const TheaterDashboard = () => {
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [selectedMovie, setSelectedMovie] = useState(null);
    const { user } = useSelector((state) => state.auth);
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        show: null
    });

    const [editModal, setEditModal] = useState({
        isOpen: false,
        show: null
    });

    const queryClient = useQueryClient();
    // Fetch data
    const { data: theater, isLoading: isLoadingTheater } = useQuery({
        queryKey: ["theater", user?._id],
        queryFn: () => theaterApi.getTheaterByManagerId(user?._id),
        enabled: !!user?._id
    });

    const { data: rooms } = useQuery({
        queryKey: ["rooms", theater?._id],
        queryFn: () => roomApi.getRoomsByTheater(theater?._id),
        enabled: !!theater?._id
    });

    const { data: theaterShows, isLoading: isLoadingShows } = useQuery({
        queryKey: ["theaterShows", theater?._id],
        queryFn: () => showApi.getShowsByTheater(theater?._id),
        enabled: !!theater?._id
    });

    // Get unique movies from shows
    const movies = useMemo(() => {
        if (!theaterShows) return [];
        const uniqueMovies = new Set();
        theaterShows.forEach(show => {
            if (show.movieId) {
                uniqueMovies.add(JSON.stringify(show.movieId));
            }
        });
        return Array.from(uniqueMovies).map(movie => JSON.parse(movie));
    }, [theaterShows]);

    // Filter shows based on selected filters
    const filteredShows = useMemo(() => {
        if (!theaterShows) return [];

        // Sort shows by date first
        const sortedShows = [...theaterShows].sort((a, b) => 
            new Date(a.startTime) - new Date(b.startTime)
        );

        // Apply filters if any are selected
        return sortedShows.filter(show => {
            if (!show || !show.movieId) return false;

            const showDate = dayjs(show.startTime);
            
            // Date matching
            const dateMatches = !selectedDate ? true : 
                showDate.format('YYYY-MM-DD') === dayjs(selectedDate).format('YYYY-MM-DD');
            
            // Room and movie matching
            const roomMatches = !selectedRoom ? true : show.roomId._id === selectedRoom;
            const movieMatches = !selectedMovie ? true : show.movieId._id === selectedMovie;

            return dateMatches && roomMatches && movieMatches;
        });
    }, [theaterShows, selectedDate, selectedRoom, selectedMovie]);

    // Add mutations for update and delete
    const { mutate: deleteShow } = useMutation({
        mutationFn: (showId) => showApi.deleteShow(showId),
        onSuccess: () => {
            queryClient.invalidateQueries(['theaterShows']);
            message.success('Xóa lịch chiếu thành công');
        },
        onError: (error) => {
            message.error('Có lỗi xảy ra khi xóa lịch chiếu');
            console.error('Delete error:', error);
        }
    });

    const handleEdit = (record) => {
        setEditModal({
            isOpen: true,
            show: record
        });
    };

    const handleCloseEditModal = () => {
        setEditModal({
            isOpen: false,
            show: null
        });
    };

    const handleDelete = (record) => {
        setDeleteModal({
            isOpen: true,
            show: record
        });
    };


    const handleCloseDeleteModal = () => {
        setDeleteModal({
            isOpen: false,
            show: null
        });
    };

    const columns = [
        {
            title: "Thời gian",
            key: "time",
            render: (record) => (
                <Space direction="vertical" size={2}>
                    <div>
                        <span className="font-semibold text-green-600">
                            {dayjs(record.startTime).format("HH:mm")}
                        </span>
                        {" - "}
                        <span className="font-semibold text-red-600">
                            {dayjs(record.endTime).format("HH:mm")}
                        </span>
                    </div>
                    <span className="text-gray-500 text-sm">
                        {dayjs(record.startTime).format("DD/MM/YYYY")}
                    </span>
                </Space>
            ),
        },
        {
            title: "Phim",
            key: "movie",
            render: (record) => (
                <span className="font-semibold text-gray-800">
                    {record.movieId?.movieName}
                </span>
            ),
        },
        {
            title: "Phòng",
            dataIndex: "roomId",
            key: "room",
            render: (record) => {
                return <Tag color="blue"> {record.roomNumber}</Tag>;
            },
        },
        {
            title: "Trạng thái",
            key: "status",
            render: (record) => {
                let color = "default";
                let text = "Đã lên lịch";

                const now = dayjs();
                const startTime = dayjs(record.startTime);
                const endTime = dayjs(record.endTime);

                if (now.isBetween(startTime, endTime)) {
                    color = "green";
                    text = "Đang chiếu";
                } else if (now.isAfter(endTime)) {
                    color = "gray";
                    text = "Đã chiếu";
                }

                return <Tag color={color}>{text}</Tag>;
            },
        },
        {
            title: "Thao tác",
            key: "actions",
            render: (record) => (
                <Space size="middle">
                    <EditOutlined
                        className="text-blue-500 text-xl cursor-pointer hover:text-blue-700"
                        onClick={() => handleEdit(record)}
                    />
                    <DeleteOutlined
                        className="text-red-500 text-xl cursor-pointer hover:text-red-700"
                        onClick={() => handleDelete(record)}
                    />
                </Space>
            ),
        }
    ];

    if (isLoadingTheater || isLoadingShows) {
        return <div className="min-h-screen flex items-center justify-center">
            <div className="text-xl text-white">Đang tải...</div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pb-8">
            {/* Header */}
            <div className="bg-white shadow-lg mb-8">
                <div className="container mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-800">Cinema Gate</h1>
                            <p className="text-gray-500 mt-1">Lịch chiếu - {theater?.theaterName}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="container mx-auto px-6 mb-8">
                <Card className="shadow-xl">
                    <Space size="large">
                        <DatePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                            className="w-40"
                            format="DD/MM/YYYY"
                            allowClear
                        />
                        <Select
                            placeholder="Chọn phòng"
                            className="w-40"
                            allowClear
                            onChange={setSelectedRoom}
                            value={selectedRoom}
                        >
                            {rooms?.map(room => (
                                <Select.Option key={room._id} value={room._id}>
                                    Phòng {room.roomNumber}
                                </Select.Option>
                            ))}
                        </Select>
                        <Select
                            placeholder="Chọn phim"
                            className="w-64"
                            allowClear
                            onChange={setSelectedMovie}
                            value={selectedMovie}
                        >
                            {movies?.map(movie => (
                                <Select.Option key={movie._id} value={movie._id}>
                                    {movie.movieName}
                                </Select.Option>
                            ))}
                        </Select>
                    </Space>
                </Card>
            </div>

            {/* Showtimes Table */}
            <div className="container mx-auto px-6">
                <Card className="shadow-xl">
                    <Table
                        columns={columns}
                        dataSource={filteredShows}
                        rowKey="_id"
                        pagination={false}
                        locale={{
                            emptyText: "Không có lịch chiếu nào"
                        }}
                        loading={isLoadingShows}
                    />
                </Card>
            </div>
            <EditShowModal 
                isOpen={editModal.isOpen}
                onClose={handleCloseEditModal}
                show={editModal.show}
            />
            
            <DeleteShowModal 
                isOpen={deleteModal.isOpen}
                onClose={handleCloseDeleteModal}
                show={deleteModal.show}
            />

        </div>
    );
};

export default TheaterDashboard;