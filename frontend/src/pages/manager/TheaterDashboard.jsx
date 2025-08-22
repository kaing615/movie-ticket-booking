import React, { useState, useMemo } from "react";
import {
  Card,
  DatePicker,
  Select,
  Space,
  Table,
  Tag,
  Input,
  Button,
  Badge,
  Tooltip,
  Skeleton,
  Statistic,
  Row,
  Col,
  Divider,
  message,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  ClockCircleOutlined,
  VideoCameraOutlined,
  FieldTimeOutlined,
  NumberOutlined,
  ReloadOutlined,
  CalendarOutlined,
  FilterOutlined,
} from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import dayjs from "dayjs";
import isBetween from "dayjs/plugin/isBetween";
import { theaterApi } from "../../api/modules/theater.api.js";
import { showApi } from "../../api/modules/show.api.js";
import { roomApi } from "../../api/modules/room.api.js";
import DeleteShowModal from "../../components/movie/DeleteShowModal.jsx";
import EditShowModal from "../../components/movie/EditShowModal.jsx";

// dayjs plugin
dayjs.extend(isBetween);

const { Search } = Input;

const TheaterDashboard = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all"); // all | live | upcoming | past
  const [searchText, setSearchText] = useState("");

  const { user } = useSelector((state) => state.auth);

  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    show: null,
  });
  const [editModal, setEditModal] = useState({
    isOpen: false,
    show: null,
  });

  // ===== Fetch
  const { data: theater, isLoading: isLoadingTheater } = useQuery({
    queryKey: ["theater", user?._id],
    queryFn: () => theaterApi.getTheaterByManagerId(user?._id),
    enabled: !!user?._id,
  });

  const { data: rooms, isLoading: isLoadingRooms } = useQuery({
    queryKey: ["rooms", theater?._id],
    queryFn: () => roomApi.getRoomsByTheater(theater?._id),
    enabled: !!theater?._id,
  });

  const {
    data: theaterShows,
    isLoading: isLoadingShows,
    isFetching: isFetchingShows,
  } = useQuery({
    queryKey: ["theaterShows", theater?._id],
    queryFn: () => showApi.getShowsByTheater(theater?._id),
    enabled: !!theater?._id,
  });

  // ===== Unique movies for filter
  const movies = useMemo(() => {
    if (!theaterShows) return [];
    const unique = new Map();
    theaterShows.forEach((show) => {
      if (show.movieId?._id && !unique.has(show.movieId._id)) {
        unique.set(show.movieId._id, show.movieId);
      }
    });
    return Array.from(unique.values());
  }, [theaterShows]);

  // ===== Stats
  const now = dayjs();
  const stats = useMemo(() => {
    const all = theaterShows || [];
    const today = all.filter((s) =>
      dayjs(s.startTime).isSame(now, "day")
    ).length;
    const live = all.filter((s) =>
      now.isBetween(dayjs(s.startTime), dayjs(s.endTime))
    ).length;
    return {
      total: all.length,
      today,
      live,
      rooms: rooms?.length || 0,
    };
  }, [theaterShows, rooms, now]);

  // ===== Filtered shows
  const filteredShows = useMemo(() => {
    if (!theaterShows) return [];

    // 1) sort by time asc
    const sorted = [...theaterShows].sort(
      (a, b) => new Date(a.startTime) - new Date(b.startTime)
    );

    // 2) filters
    const list = sorted.filter((show) => {
      if (!show?.movieId) return false;
      const start = dayjs(show.startTime);
      const end = dayjs(show.endTime);

      // date
      const dateOk = !selectedDate
        ? true
        : start.isSame(dayjs(selectedDate), "day");

      // room
      const roomOk = !selectedRoom
        ? true
        : (show.roomId?._id || show.roomId) === selectedRoom;

      // movie
      const movieOk = !selectedMovie
        ? true
        : show.movieId._id === selectedMovie;

      // status
      let statusOk = true;
      if (statusFilter === "live") {
        statusOk = now.isBetween(start, end);
      } else if (statusFilter === "upcoming") {
        statusOk = start.isAfter(now);
      } else if (statusFilter === "past") {
        statusOk = end.isBefore(now);
      }

      // search
      const keyword = searchText.trim().toLowerCase();
      const name = (show.movieId.movieName || "").toLowerCase();
      const searchOk = !keyword || name.includes(keyword);

      return dateOk && roomOk && movieOk && statusOk && searchOk;
    });

    return list;
  }, [
    theaterShows,
    selectedDate,
    selectedRoom,
    selectedMovie,
    statusFilter,
    searchText,
    now,
  ]);

  // ===== Handlers
  const handleEdit = (record) =>
    setEditModal({ isOpen: true, show: record });
  const handleDelete = (record) =>
    setDeleteModal({ isOpen: true, show: record });
  const handleCloseEditModal = () =>
    setEditModal({ isOpen: false, show: null });
  const handleCloseDeleteModal = () =>
    setDeleteModal({ isOpen: false, show: null });

  const resetFilters = () => {
    setSelectedDate(null);
    setSelectedRoom(null);
    setSelectedMovie(null);
    setStatusFilter("all");
    setSearchText("");
    message.success("Đã đặt lại bộ lọc");
  };

  // ===== Columns
  const columns = [
    {
      title: "Thời gian",
      key: "time",
      width: 180,
      render: (record) => {
        const start = dayjs(record.startTime);
        const end = dayjs(record.endTime);
        const isLive = now.isBetween(start, end);
        return (
          <Space direction="vertical" size={2}>
            <div className="flex items-center gap-2">
              {isLive && (
                <Badge status="processing" color="#52c41a" text="LIVE" />
              )}
              <span className="font-semibold text-green-600">
                {start.format("HH:mm")}
              </span>
              <span>–</span>
              <span className="font-semibold text-red-600">
                {end.format("HH:mm")}
              </span>
            </div>
            <span className="text-gray-500 text-xs">
              <CalendarOutlined className="mr-1" />
              {start.format("DD/MM/YYYY")}
            </span>
          </Space>
        );
      },
      sorter: (a, b) =>
        new Date(a.startTime) - new Date(b.startTime),
    },
    {
      title: "Phim",
      key: "movie",
      render: (record) => (
        <Space>
          <div
            style={{
              width: 40,
              height: 56,
              borderRadius: 6,
              background: "#f0f0f0",
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            {record.movieId?.poster ? (
              <img
                src={record.movieId.poster}
                alt={record.movieId.movieName}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            ) : (
              <div className="w-full h-full grid place-items-center">
                <VideoCameraOutlined style={{ color: "#999" }} />
              </div>
            )}
          </div>
          <Space direction="vertical" size={0}>
            <span className="font-semibold text-gray-800">
              {record.movieId?.movieName}
            </span>
            <Tag icon={<FieldTimeOutlined />} color="default">
              {record.movieId?.duration} phút
            </Tag>
          </Space>
        </Space>
      ),
    },
    {
      title: "Phòng",
      dataIndex: "roomId",
      key: "room",
      width: 120,
      render: (room) => (
        <Tag color="blue">
          <NumberOutlined /> {room?.roomNumber}
        </Tag>
      ),
      filters: (rooms || []).map((r) => ({
        text: `Phòng ${r.roomNumber}`,
        value: r._id,
      })),
      onFilter: (value, record) =>
        (record.roomId?._id || record.roomId) === value,
    },
    {
      title: "Trạng thái",
      key: "status",
      width: 130,
      render: (record) => {
        const start = dayjs(record.startTime);
        const end = dayjs(record.endTime);
        let color = "default";
        let text = "Đã lên lịch";
        if (now.isBetween(start, end)) {
          color = "success";
          text = "Đang chiếu";
        } else if (now.isAfter(end)) {
          color = "default";
          text = "Đã chiếu";
        } else if (now.isBefore(start)) {
          color = "processing";
          text = "Sắp chiếu";
        }
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: "Đang chiếu", value: "live" },
        { text: "Sắp chiếu", value: "upcoming" },
        { text: "Đã chiếu", value: "past" },
      ],
      onFilter: (value, record) => {
        const start = dayjs(record.startTime);
        const end = dayjs(record.endTime);
        if (value === "live") return now.isBetween(start, end);
        if (value === "upcoming") return start.isAfter(now);
        if (value === "past") return end.isBefore(now);
        return true;
      },
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 110,
      render: (record) => (
        <Space size="middle">
          <Tooltip title="Chỉnh sửa">
            <EditOutlined
              className="text-blue-500 text-lg cursor-pointer hover:text-blue-700"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa lịch chiếu">
            <DeleteOutlined
              className="text-red-500 text-lg cursor-pointer hover:text-red-700"
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  if (isLoadingTheater || isLoadingShows) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <Skeleton active paragraph={{ rows: 4 }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pb-8">
      {/* Header */}
      <div className="bg-white shadow-lg mb-8">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">
                Cinema Gate
              </h1>
              <p className="text-gray-500 mt-1">
                Lịch chiếu — <b>{theater?.theaterName}</b>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-6 mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="Tổng lịch chiếu"
                value={stats.total}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="Hôm nay"
                value={stats.today}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="Đang chiếu"
                value={stats.live}
                prefix={<VideoCameraOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={6}>
            <Card>
              <Statistic
                title="Số phòng"
                value={stats.rooms}
                prefix={<NumberOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-6 mb-8">
        <Card className="shadow-xl" bodyStyle={{ padding: 16 }}>
          <div className="flex flex-wrap items-center gap-3">
            <Space size="large" wrap>
              <Space direction="vertical" size={0}>
                <span className="text-xs text-gray-500">Ngày</span>
                <DatePicker
                  value={selectedDate}
                  onChange={setSelectedDate}
                  className="w-44"
                  format="DD/MM/YYYY"
                  allowClear
                />
              </Space>

              <Space direction="vertical" size={0}>
                <span className="text-xs text-gray-500">Phòng</span>
                <Select
                  placeholder="Chọn phòng"
                  className="w-44"
                  allowClear
                  onChange={setSelectedRoom}
                  value={selectedRoom}
                  loading={isLoadingRooms}
                >
                  {rooms?.map((room) => (
                    <Select.Option key={room._id} value={room._id}>
                      Phòng {room.roomNumber}
                    </Select.Option>
                  ))}
                </Select>
              </Space>

              <Space direction="vertical" size={0}>
                <span className="text-xs text-gray-500">Phim</span>
                <Select
                  placeholder="Chọn phim"
                  className="w-64"
                  allowClear
                  onChange={setSelectedMovie}
                  value={selectedMovie}
                >
                  {movies?.map((movie) => (
                    <Select.Option key={movie._id} value={movie._id}>
                      {movie.movieName}
                    </Select.Option>
                  ))}
                </Select>
              </Space>

              <Space direction="vertical" size={0}>
                <span className="text-xs text-gray-500">Trạng thái</span>
                <Select
                  className="w-40"
                  value={statusFilter}
                  onChange={setStatusFilter}
                  options={[
                    { label: "Tất cả", value: "all" },
                    { label: "Đang chiếu", value: "live" },
                    { label: "Sắp chiếu", value: "upcoming" },
                    { label: "Đã chiếu", value: "past" },
                  ]}
                />
              </Space>

              <Space direction="vertical" size={0}>
                <span className="text-xs text-gray-500">Tìm kiếm</span>
                <Search
                  placeholder="Tên phim…"
                  allowClear
                  className="w-64"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                />
              </Space>
            </Space>

            <div className="ml-auto">
              <Space>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={resetFilters}
                >
                  Đặt lại
                </Button>
              </Space>
            </div>
          </div>
        </Card>
      </div>

      {/* Table */}
      <div className="container mx-auto px-6">
        <Card className="shadow-xl" bodyStyle={{ padding: 0 }}>
          <div className="px-4 pt-4">
            <Space className="text-gray-500 text-sm">
              <FilterOutlined />{" "}
              {filteredShows.length} kết quả phù hợp
              {isFetchingShows && (
                <Tag color="processing" className="ml-2">
                  Đang cập nhật…
                </Tag>
              )}
            </Space>
          </div>

          <Divider style={{ margin: "12px 0" }} />

          <div className="px-4 pb-4">
            <Table
              columns={columns}
              dataSource={filteredShows}
              rowKey="_id"
              pagination={{ pageSize: 10, showSizeChanger: false }}
              loading={isLoadingShows}
              sticky
              locale={{
                emptyText: "Không có lịch chiếu nào",
              }}
            />
          </div>
        </Card>
      </div>

      {/* Modals */}
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
