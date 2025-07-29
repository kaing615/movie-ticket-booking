import React from "react";
import { Tabs, Button, Table, Modal, Form, DatePicker, TimePicker, Select, message } from "antd";
import { PlusOutlined, DeleteOutlined, ScheduleOutlined } from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import {theaterApi} from "../../api/modules/theater.api.js";
import {movieApi} from "../../api/modules/movie.api.js";
import {showApi} from "../../api/modules/show.api.js";
import { roomApi } from "../../api/modules/room.api.js";
import DeleteMovieModal from "../../components/movie/DeleteMovieModal.jsx";

const ManagerDashboard = () => {
    const [showAddMovieModal, setShowAddMovieModal] = React.useState(false);
    const [showScheduleModal, setShowScheduleModal] = React.useState(false);
    const [selectedMovie, setSelectedMovie] = React.useState(null);
    const queryClient = useQueryClient();
    const { user } = useSelector((state) => state.auth);
    const [deleteMovieModal, setDeleteMovieModal] = React.useState({
        isOpen: false,
        movieId: null,
        movieName: ''
    });

    // Fetch data
    const { data: theater, isLoading: isLoadingTheater } = useQuery({
        queryKey: ["theater", user?._id],
        queryFn: () => theaterApi.getTheaterByManagerId(user?._id),
        enabled: !!user?._id
    });

    //console.log("Theater data:", theater);
    const { data: theaterMovies } = useQuery({
        queryKey: ["theaterMovies", theater?._id],
        queryFn: () => movieApi.getMoviesOfTheater(theater?._id),
        enabled: !!theater?._id
    });

   console.log("Theater movies:", theaterMovies);
    const { data: rooms } = useQuery({
        queryKey: ["rooms", theater?._id],
        queryFn: () => roomApi.getRoomsByTheater(theater?._id),
        enabled: !!theater?._id
    });

    const { data: allMovies } = useQuery({
        queryKey: ["allMovies"],
        queryFn: () => movieApi.getMovies()
    });

    //console.log("All movies:", allMovies);
    // Add query for theater shows
    const { data: theaterShows } = useQuery({
        queryKey: ["theaterShows", theater?._id],
        queryFn: () => showApi.getShowsByTheater(theater?._id),
        enabled: !!theater?._id
    });

    const getAvailableMovies = () => {
    // Tạo Set chứa ID của các phim trong theater
    const theaterMovieIds = new Set(
        theaterMovies?.map(movie => movie.movieId ? movie.movieId.toString() : movie._id.toString())
    );
    // Lọc những phim không có trong theater
    const availableMovies = allMovies?.filter(movie => {
        const movieId = movie.movieId ? movie.movieId.toString() : movie._id.toString();
        const isAvailable = !theaterMovieIds?.has(movieId);       
        return isAvailable;
    });

    // console.log("Final available movies:", availableMovies?.map(m => m.movieName));
    return availableMovies;
    }
    // console.log("Available movies:", getAvailableMovies());
    
    console.log("Theater ID: ", theater?._id);

    const addScheduleMutation = useMutation({
        mutationFn: (values) => {
            const startTime = new Date(values.date);
            startTime.setHours(values.time.hour(), values.time.minute());
            
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + selectedMovie.duration);

            // Log selectedMovie to debug
            console.log("Selected movie:", selectedMovie);

            const showData = {
                // Use the correct movieId reference
                movieId: selectedMovie?._id || selectedMovie?.movieId,
                theaterId: theater._id,
                roomId: values.roomId,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
            };

            console.log("Creating new show:", showData);
            return showApi.addShow(showData);
        },
        onSuccess: (data) => {
            console.log("Show created:", data);
            queryClient.invalidateQueries(["theaterShows"]);
            setShowScheduleModal(false);
            
            const isNewMovie = !theaterShows?.some(
                show => show.movieId._id === selectedMovie._id
            );
            
            message.success(
                isNewMovie 
                    ? "Thêm phim mới vào rạp thành công!" 
                    : "Thêm lịch chiếu mới thành công!"
            );
        },
        onError: (error) => {
            console.error("Add show error:", error);
            message.error(error.response?.data?.message || "Có lỗi xảy ra khi thêm lịch chiếu!");
        }
    });

    const validateScheduleTime = (_, value) => {
        if (!value) return Promise.reject("Vui lòng chọn thời gian!");
        
        const selectedTime = new Date(value);
        if (selectedTime < new Date()) {
            return Promise.reject("Không thể chọn thời gian trong quá khứ!");
        }
        
        return Promise.resolve();
    };

    const handleRemoveMovie = (movie) => {
        console.log("Removing movie:", movie);
        setDeleteMovieModal({
            isOpen: true,
            movieId: movie._id,
            movieName: movie.movieName
        });
    };

    const handleAddSchedule = (values) => {
        addScheduleMutation.mutate(values);
    };

    const ActionButton = ({ movie }) => {
        // Log movie data when button is clicked
        const handleClick = () => {
            console.log("Movie selected for schedule:", movie);
            setSelectedMovie(movie);
            setShowScheduleModal(true);
        };

        const hasExistingShows = theaterShows?.some(
            show => show.movieId._id === movie._id
        );

        return (
            <Button
                icon={<ScheduleOutlined />}
                onClick={handleClick}
                className="flex items-center bg-orange-500 text-white hover:bg-orange-600 border-none shadow-md"
                loading={addScheduleMutation.isLoading}
            >
                {hasExistingShows ? "Thêm lịch chiếu" : "Thêm phim vào rạp"}
            </Button>
        );
    };

    const columns = [
        {
            title: "Tên phim",
            dataIndex: "movieName",
            key: "title",
            className: "font-semibold text-gray-800",
        },
        {
            title: "Thời lượng",
            dataIndex: "duration",
            key: "duration",
            render: (duration) => (
                <span className="text-orange-500">{duration} phút</span>
            ),
        },

        {
            title: "Thao tác",
            key: "action",
            render: (_, record) => (
                console.log("Rendering action for movie:", record),
                <div className="flex space-x-3">
                    <ActionButton movie={record} />
                    <Button
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveMovie(record)}
                    className="flex items-center bg-red-500 text-white hover:bg-red-600 border-none shadow-md"
                >
                        Xóa khỏi rạp
                    </Button>
                </div>
            ),
        }
    ];

    if (isLoadingTheater) {
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
                            <p className="text-gray-500 mt-1">Quản lý rạp {theater?.theaterName}</p>
                        </div>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setShowAddMovieModal(true)}
                            className="bg-orange-500 hover:bg-orange-600 border-none h-12 px-6 flex items-center text-lg shadow-lg"
                        >
                            Thêm phim mới
                        </Button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-6">
                <div className="bg-white rounded-xl shadow-xl overflow-hidden">
                    <Tabs
                        className="px-6 pt-4"
                        items={[
                            {
                                key: "1",
                                label: (
                                    <span className="px-4 py-2 text-lg">Phim đang chiếu</span>
                                ),
                                children: (
                                    <Table
                                        columns={columns}
                                        dataSource={theaterMovies?.filter(m => m.status === "showing")}
                                        rowKey="_id"
                                        className="mt-4"
                                        pagination={{ 
                                            pageSize: 5,
                                            className: "pb-4" 
                                        }}
                                        loading={isLoadingTheater}
                                    />
                                ),
                            },
                            {
                                key: "2",
                                label: (
                                    <span className="px-4 py-2 text-lg">Phim sắp chiếu</span>
                                ),
                                children: (
                                    <Table
                                        columns={columns}
                                        dataSource={theaterMovies?.filter(m => m.status === "coming")}
                                        rowKey="_id"
                                        className="mt-4"
                                        pagination={{ 
                                            pageSize: 5,
                                            className: "pb-4"
                                        }}
                                        loading={isLoadingTheater}
                                    />
                                ),
                            },
                        ]}
                    />
                </div>
            </div>

            {/* Add Movie Modal */}
            <Modal
                title={
                    <div className="text-lg font-bold">
                        Thêm phim mới vào rạp
                    </div>
                }
                open={showAddMovieModal}
                onCancel={() => setShowAddMovieModal(false)}
                footer={null}
                width={900}
                className="rounded-xl overflow-hidden"
            >
                <div className="grid grid-cols-2 gap-6 p-6">
                    {getAvailableMovies()?.map(movie => (
                        <div
                            key={movie._id}
                            className="group relative overflow-hidden rounded-xl border border-gray-200 hover:border-orange-500 cursor-pointer transition-all duration-300 hover:shadow-2xl"
                            onClick={() => {
                                setSelectedMovie(movie);
                                setShowAddMovieModal(false);
                                setShowScheduleModal(true);
                            }}
                        >
                            <img
                                src={movie.poster}
                                alt={movie.title}
                                className="w-full h-[400px] object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                                <h3 className="text-xl font-bold text-white">{movie.movieName}</h3>
                                <p className="text-orange-400">{movie.duration} phút</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Modal>

            {/* Delete Movie Modal */}
            <DeleteMovieModal 
                isOpen={deleteMovieModal.isOpen}
                onClose={() => setDeleteMovieModal({
                    isOpen: false,
                    movieId: null,
                    movieName: ''
                })}
                movieId={deleteMovieModal.movieId}
                movieName={deleteMovieModal.movieName}
                theaterShows={theaterShows}
            />

            {/* Schedule Modal */}
            <Modal
                title={
                    <div className="text-lg font-bold">
                        {theaterShows?.some(show => show.movieId._id === selectedMovie?._id)
                            ? `Thêm lịch chiếu - ${selectedMovie?.movieName}`
                            : `Thêm phim mới - ${selectedMovie?.movieName}`
                        }
                    </div>
                }
                open={showScheduleModal}
                onCancel={() => setShowScheduleModal(false)}
                footer={null}
                className="rounded-xl overflow-hidden"
            >
                <Form
                    onFinish={handleAddSchedule}
                    layout="vertical"
                    className="p-6"
                >
                    <Form.Item
                        name="date"
                        label="Ngày chiếu"
                        rules={[
                            { required: true, message: "Vui lòng chọn ngày chiếu!" },
                            { validator: validateScheduleTime }
                        ]}
                    >
                        <DatePicker 
                            className="w-full h-10 rounded-lg" 
                            placeholder="Chọn ngày chiếu"
                            disabledDate={current => current && current < Date.now()}
                        />
                    </Form.Item>
                    <Form.Item
                        name="time"
                        label="Giờ chiếu"
                        rules={[{ required: true, message: "Vui lòng chọn giờ chiếu!" }]}
                    >
                        <TimePicker 
                            className="w-full h-10 rounded-lg" 
                            format="HH:mm"
                            placeholder="Chọn giờ chiếu" 
                            minuteStep={5}
                        />
                    </Form.Item>
                    <Form.Item
                        name="roomId"
                        label="Phòng chiếu"
                        rules={[{ required: true, message: "Vui lòng chọn phòng chiếu!" }]}
                    >
                        <Select 
                            className="w-full rounded-lg" 
                            placeholder="Chọn phòng chiếu"
                        >
                            {rooms?.map(room => (
                                <Select.Option key={room._id} value={room._id}>
                                    {`Phòng ${room.roomNumber}`}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg rounded-lg border-none shadow-md"
                            loading={addScheduleMutation.isLoading}
                        >
                            {theaterShows?.some(show => show.movieId._id === selectedMovie?._id)
                                ? "Thêm lịch chiếu"
                                : "Thêm phim vào rạp"
                            }
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ManagerDashboard;