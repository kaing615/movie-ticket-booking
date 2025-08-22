import React from "react";
import {
  Tabs,
  Button,
  Table,
  Modal,
  Form,
  DatePicker,
  TimePicker,
  Select,
  message,
  Row,
  Col,
  Card,
  Typography,
  Tag,
  Badge,
  Space,
  Input,
  Empty,
  Skeleton,
  Tooltip,
  Statistic,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  ScheduleOutlined,
  VideoCameraOutlined,
  FieldTimeOutlined,
  AppstoreAddOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { theaterApi } from "../../api/modules/theater.api.js";
import { movieApi } from "../../api/modules/movie.api.js";
import { showApi } from "../../api/modules/show.api.js";
import { roomApi } from "../../api/modules/room.api.js";
import DeleteMovieModal from "../../components/movie/DeleteMovieModal.jsx";

const { Title, Text } = Typography;
const { Search } = Input;

const ManagerDashboard = () => {
  const [showAddMovieModal, setShowAddMovieModal] = React.useState(false);
  const [showScheduleModal, setShowScheduleModal] = React.useState(false);
  const [selectedMovie, setSelectedMovie] = React.useState(null);
  const [searchText, setSearchText] = React.useState("");
  const [activeTab, setActiveTab] = React.useState("showing");
  const queryClient = useQueryClient();
  const { user } = useSelector((state) => state.auth);

  const [deleteMovieModal, setDeleteMovieModal] = React.useState({
    isOpen: false,
    movieId: null,
    movieName: "",
  });

  // ======= Fetch data
  const { data: theater, isLoading: isLoadingTheater } = useQuery({
    queryKey: ["theater", user?._id],
    queryFn: () => theaterApi.getTheaterByManagerId(user?._id),
    enabled: !!user?._id,
  });

  const { data: theaterMovies, isLoading: isLoadingMovies } = useQuery({
    queryKey: ["theaterMovies", theater?._id],
    queryFn: () => movieApi.getMoviesOfTheater(theater?._id),
    enabled: !!theater?._id,
  });

  const { data: rooms, isLoading: isLoadingRooms } = useQuery({
    queryKey: ["rooms", theater?._id],
    queryFn: () => roomApi.getRoomsByTheater(theater?._id),
    enabled: !!theater?._id,
  });

  const { data: allMovies, isLoading: isLoadingAll } = useQuery({
    queryKey: ["allMovies"],
    queryFn: () => movieApi.getMovies(),
  });

  const { data: theaterShows, isLoading: isLoadingShows } = useQuery({
    queryKey: ["theaterShows", theater?._id],
    queryFn: () => showApi.getShowsByTheater(theater?._id),
    enabled: !!theater?._id,
  });

  // ======= Helpers
  const getAvailableMovies = React.useCallback(() => {
    const theaterMovieIds = new Set(
      theaterMovies?.map((m) =>
        (m.movieId ? m.movieId.toString() : m._id?.toString())
      )
    );
    return allMovies?.filter((movie) => {
      const id = movie.movieId ? movie.movieId.toString() : movie._id?.toString();
      return !theaterMovieIds?.has(id);
    });
  }, [allMovies, theaterMovies]);

  const filteredBySearch = (list) =>
    (list || []).filter((m) =>
      (m.movieName || m.title || "")
        .toLowerCase()
        .includes(searchText.trim().toLowerCase())
    );

  const showingMovies = filteredBySearch(
    theaterMovies?.filter((m) => m.status === "showing")
  );
  const comingMovies = filteredBySearch(
    theaterMovies?.filter((m) => m.status === "coming")
  );

  // ========= Schedule mutation
  const addScheduleMutation = useMutation({
    mutationFn: (values) => {
      const startDate = values.date?.toDate?.() || new Date(values.date);
      const startTime = dayjs(startDate)
        .hour(values.time.hour())
        .minute(values.time.minute())
        .second(0)
        .millisecond(0)
        .toDate();

      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + (selectedMovie?.duration || 0));

      const showData = {
        movieId: selectedMovie?._id || selectedMovie?.movieId,
        theaterId: theater._id,
        roomId: values.roomId,
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
      };
      return showApi.addShow(showData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["theaterShows"]);
      setShowScheduleModal(false);

      const isNewMovie = !theaterShows?.some(
        (show) => show.movieId?._id === selectedMovie?._id
      );

      message.success(
        isNewMovie ? "Thêm phim mới vào rạp thành công!" : "Thêm lịch chiếu mới thành công!"
      );
    },
    onError: (error) => {
      message.error(
        error?.response?.data?.message || "Có lỗi xảy ra khi thêm lịch chiếu!"
      );
    },
  });

  // ========= Validate & clash detection
  const validateScheduleTime = (_, value) => {
    if (!value) return Promise.reject("Vui lòng chọn thời gian!");
    const picked = dayjs(value);
    if (picked.isBefore(dayjs(), "minute")) {
      return Promise.reject("Không thể chọn thời gian trong quá khứ!");
    }
    return Promise.resolve();
  };

  const isOverlap = (aStart, aEnd, bStart, bEnd) =>
    // (aStart < bEnd) && (bStart < aEnd)
    dayjs(aStart).isBefore(dayjs(bEnd)) && dayjs(bStart).isBefore(dayjs(aEnd));

  // ========= UI: Actions
  const handleRemoveMovie = (movie) => {
    setDeleteMovieModal({
      isOpen: true,
      movieId: movie._id,
      movieName: movie.movieName,
    });
  };

  const ActionButton = ({ movie }) => {
    const hasExistingShows = theaterShows?.some(
      (show) => show.movieId?._id === movie._id
    );
    return (
      <Button
        icon={<ScheduleOutlined />}
        onClick={() => {
          setSelectedMovie(movie);
          setShowScheduleModal(true);
        }}
        type="primary"
      >
        {hasExistingShows ? "Thêm lịch chiếu" : "Thêm phim vào rạp"}
      </Button>
    );
  };

  // ========= Table columns
  const columns = [
    {
      title: "Phim",
      key: "movie",
      render: (_, record) => (
        <Space>
          <div
            style={{
              width: 44,
              height: 64,
              borderRadius: 6,
              background: "#f0f0f0",
              overflow: "hidden",
              boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
            }}
          >
            {/* poster */}
            {record.poster ? (
              <img
                src={record.poster}
                alt={record.movieName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <VideoCameraOutlined
                style={{ fontSize: 24, color: "#999", margin: 10 }}
              />
            )}
          </div>
          <Space direction="vertical" size={0}>
            <Text strong>{record.movieName}</Text>
            <Space size={6}>
              <Tag color={record.status === "showing" ? "green" : "orange"}>
                {record.status === "showing" ? "Đang chiếu" : "Sắp chiếu"}
              </Tag>
              <Tag icon={<FieldTimeOutlined />} color="default">
                {record.duration} phút
              </Tag>
            </Space>
          </Space>
        </Space>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 320,
      render: (_, record) => (
        <Space>
          <ActionButton movie={record} />
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleRemoveMovie(record)}
            danger
          >
            Xóa khỏi rạp
          </Button>
        </Space>
      ),
    },
  ];

  if (isLoadingTheater) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Skeleton active paragraph={{ rows: 3 }} />
      </div>
    );
  }

  // ========= Rooms busy helper for schedule modal
  const getBusyRoomIds = (dateVal, timeVal, movieDurationMin) => {
    if (!dateVal || !timeVal || !movieDurationMin) return new Set();
    const start = dayjs(dateVal)
      .hour(timeVal.hour())
      .minute(timeVal.minute())
      .second(0)
      .millisecond(0);
    const end = start.add(movieDurationMin, "minute");

    const busy = new Set();
    (theaterShows || []).forEach((show) => {
      const s = dayjs(show.startTime);
      const e = dayjs(show.endTime);
      if (isOverlap(start, end, s, e)) {
        busy.add(show.roomId?._id || show.roomId);
      }
    });
    return busy;
  };

  // ========= Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 pb-8">
      {/* Header */}
      <div className="bg-white shadow-lg mb-8">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Cinema Gate</h1>
              <p className="text-gray-500 mt-1">
                Quản lý rạp <b>{theater?.theaterName}</b>
              </p>
            </div>
            <Space>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setShowAddMovieModal(true)}
                className="bg-orange-500 hover:bg-orange-600 border-none h-11 px-5 flex items-center text-lg shadow-md"
              >
                Thêm phim mới
              </Button>
            </Space>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="container mx-auto px-6 mb-6">
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Số phòng"
                value={rooms?.length || 0}
                prefix={<AppstoreAddOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Phim trong rạp"
                value={theaterMovies?.length || 0}
                prefix={<VideoCameraOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <Statistic
                title="Tổng lịch chiếu"
                value={theaterShows?.length || 0}
                prefix={<ScheduleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-6 pt-5">
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: "showing",
                  label: (
                    <Badge count={showingMovies?.length || 0} offset={[8, -2]}>
                      <span className="px-3 py-2 text-base">Đang chiếu</span>
                    </Badge>
                  ),
                  children: null,
                },
                {
                  key: "coming",
                  label: (
                    <Badge count={comingMovies?.length || 0} offset={[8, -2]}>
                      <span className="px-3 py-2 text-base">Sắp chiếu</span>
                    </Badge>
                  ),
                  children: null,
                },
              ]}
            />
            <div className="px-6 pb-3">
              <Search
                placeholder="Tìm phim theo tên…"
                allowClear
                onChange={(e) => setSearchText(e.target.value)}
                style={{ width: 280 }}
              />
            </div>
          </div>

          <div className="px-6 pb-6">
            <Table
              columns={columns}
              dataSource={
                activeTab === "showing" ? showingMovies : comingMovies
              }
              rowKey={(r) => r._id || r.movieId}
              pagination={{ pageSize: 6, showSizeChanger: false }}
              loading={isLoadingMovies}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Không có phim phù hợp"
                  />
                ),
              }}
            />
          </div>
        </div>
      </div>

      {/* Add Movie Modal */}
      <Modal
        title={<div className="text-lg font-bold">Thêm phim mới vào rạp</div>}
        open={showAddMovieModal}
        onCancel={() => setShowAddMovieModal(false)}
        footer={null}
        width={1000}
        className="rounded-xl overflow-hidden"
      >
        <div className="p-4">
          {isLoadingAll ? (
            <Skeleton active />
          ) : getAvailableMovies()?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {getAvailableMovies()?.map((movie) => (
                <Card
                  key={movie._id}
                  hoverable
                  style={{ borderRadius: 14, overflow: "hidden" }}
                  cover={
                    <div className="relative">
                      <img
                        src={movie.poster}
                        alt={movie.movieName}
                        className="w-full h-[320px] object-cover"
                      />
                      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/85 to-transparent">
                        <div className="text-white font-semibold">
                          {movie.movieName}
                        </div>
                        <div className="text-orange-400 text-sm">
                          {movie.duration} phút
                        </div>
                      </div>
                    </div>
                  }
                  onClick={() => {
                    setSelectedMovie(movie);
                    setShowAddMovieModal(false);
                    setShowScheduleModal(true);
                  }}
                />
              ))}
            </div>
          ) : (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Không còn phim để thêm"
            />
          )}
        </div>
      </Modal>

      {/* Delete Movie Modal */}
      <DeleteMovieModal
        isOpen={deleteMovieModal.isOpen}
        onClose={() =>
          setDeleteMovieModal({
            isOpen: false,
            movieId: null,
            movieName: "",
          })
        }
        movieId={deleteMovieModal.movieId}
        movieName={deleteMovieModal.movieName}
        theaterShows={theaterShows}
      />

      {/* Schedule Modal */}
      <ScheduleModal
        open={showScheduleModal}
        onClose={() => setShowScheduleModal(false)}
        rooms={rooms}
        theaterShows={theaterShows}
        selectedMovie={selectedMovie}
        onSubmit={(vals) => addScheduleMutation.mutate(vals)}
        loadingSubmit={addScheduleMutation.isLoading}
        isLoadingRooms={isLoadingRooms || isLoadingShows}
        getBusyRoomIds={getBusyRoomIds}
      />
    </div>
  );
};

export default ManagerDashboard;

/* ===================== Sub-components ===================== */

const ScheduleModal = ({
  open,
  onClose,
  rooms,
  theaterShows,
  selectedMovie,
  onSubmit,
  loadingSubmit,
  isLoadingRooms,
  getBusyRoomIds,
}) => {
  const [form] = Form.useForm();
  const watchDate = Form.useWatch("date", form);
  const watchTime = Form.useWatch("time", form);

  const busyRooms = React.useMemo(
    () =>
      getBusyRoomIds(
        watchDate,
        watchTime,
        selectedMovie?.duration || 0
      ),
    [watchDate, watchTime, selectedMovie, getBusyRoomIds]
  );

  return (
    <Modal
      title={
        <div className="text-lg font-bold">
          {theaterShows?.some(
            (s) => s.movieId?._id === selectedMovie?._id
          )
            ? `Thêm lịch chiếu - ${selectedMovie?.movieName || ""}`
            : `Thêm phim mới - ${selectedMovie?.movieName || ""}`}
        </div>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      className="rounded-xl overflow-hidden"
      destroyOnClose
    >
      <div className="p-4">
        {/* Movie info */}
        {selectedMovie && (
          <Card size="small" style={{ marginBottom: 16, borderRadius: 10 }}>
            <Row gutter={12} align="middle">
              <Col flex="64px">
                <div
                  style={{
                    width: 56,
                    height: 80,
                    borderRadius: 6,
                    overflow: "hidden",
                    background: "#f0f0f0",
                  }}
                >
                  {selectedMovie.poster && (
                    <img
                      src={selectedMovie.poster}
                      alt={selectedMovie.movieName}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )}
                </div>
              </Col>
              <Col flex="auto">
                <Space direction="vertical" size={2}>
                  <Text strong>{selectedMovie.movieName}</Text>
                  <Tag icon={<FieldTimeOutlined />} color="processing">
                    {selectedMovie.duration} phút
                  </Tag>
                </Space>
              </Col>
            </Row>
          </Card>
        )}

        <Form
          form={form}
          onFinish={onSubmit}
          layout="vertical"
          initialValues={{
            date: dayjs().add(1, "hour"),
          }}
        >
          <Form.Item
            name="date"
            label="Ngày chiếu"
            rules={[
              { required: true, message: "Vui lòng chọn ngày chiếu!" },
              {
                validator: (_, v) =>
                  v && dayjs(v).isBefore(dayjs().startOf("day"))
                    ? Promise.reject("Không thể chọn ngày trong quá khứ!")
                    : Promise.resolve(),
              },
            ]}
          >
            <DatePicker
              className="w-full h-10 rounded-lg"
              placeholder="Chọn ngày chiếu"
              disabledDate={(current) =>
                current && current < dayjs().startOf("day")
              }
            />
          </Form.Item>

          <Form.Item
            name="time"
            label="Giờ chiếu"
            rules={[
              { required: true, message: "Vui lòng chọn giờ chiếu!" },
            ]}
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
            label={
              <Space>
                <span>Phòng chiếu</span>
                {busyRooms.size > 0 && (
                  <Tooltip title="Một số phòng đang bận tại thời điểm đã chọn">
                    <Tag color="error">Có phòng bận</Tag>
                  </Tooltip>
                )}
              </Space>
            }
            rules={[{ required: true, message: "Vui lòng chọn phòng chiếu!" }]}
          >
            <Select
              className="w-full rounded-lg"
              placeholder={
                isLoadingRooms ? "Đang tải phòng..." : "Chọn phòng chiếu"
              }
              loading={isLoadingRooms}
              options={(rooms || []).map((room) => ({
                label: (
                  <Space>
                    {`Phòng ${room.roomNumber}`}
                    {busyRooms.has(room._id) && (
                      <Tag color="red">Bận</Tag>
                    )}
                  </Space>
                ),
                value: room._id,
                disabled: busyRooms.has(room._id),
              }))}
            />
          </Form.Item>

          <Button
            type="primary"
            htmlType="submit"
            className="w-full h-10 bg-orange-500 hover:bg-orange-600 text-white font-semibold text-lg rounded-lg border-none shadow-md"
            loading={loadingSubmit}
            disabled={!watchDate || !watchTime}
          >
            {theaterShows?.some(
              (s) => s.movieId?._id === selectedMovie?._id
            )
              ? "Thêm lịch chiếu"
              : "Thêm phim vào rạp"}
          </Button>
        </Form>
      </div>
    </Modal>
  );
};
