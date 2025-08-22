import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { seatApi } from "../../api/modules/seat.api";
import { roomApi } from "../../api/modules/room.api";
import { theaterApi } from "../../api/modules/theater.api";
import {
  Button,
  Modal,
  Input,
  Select,
  message,
  Form,
  Card,
  Popconfirm,
  Typography,
  Row,
  Col,
  Space,
  Tag,
  Tooltip,
  Empty,
  Spin,
  Statistic,
  Divider,
  Badge,
  Skeleton,
  Segmented,
  theme,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  ClusterOutlined,
  AppstoreOutlined,
  LayoutOutlined,
} from "@ant-design/icons";

const { Title, Text } = Typography;

const seatTypes = [
  { label: "VIP", value: "VIP" },
  { label: "Tiêu chuẩn", value: "Tiêu chuẩn" },
  { label: "Couple", value: "Couple" },
];

/**
 * RoomsDashboard (Polished)
 * - Visual: softer shadows, glass cards, consistent spacing, token-based colors, subtle animations
 * - UX: segmented layout density, richer stats, improved empty/loading states, cleaner seat rendering
 */
const RoomsDashboard = () => {
  const { token } = theme.useToken();

  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [seats, setSeats] = useState([]);

  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm] = Form.useForm();

  const [showSeatModal, setShowSeatModal] = useState(false);
  const [seatForm] = Form.useForm();
  const [editingSeat, setEditingSeat] = useState(null);

  const user = useSelector((state) => state.auth.user);
  const [theaterId, setTheaterId] = useState(null);

  // UI states
  const [loadingTheater, setLoadingTheater] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingSeats, setLoadingSeats] = useState(false);
  const [submittingRoom, setSubmittingRoom] = useState(false);
  const [submittingSeat, setSubmittingSeat] = useState(false);
  const [density, setDensity] = useState("Comfort");

  // ===== Fetch theater of manager =====
  useEffect(() => {
    const fetchTheater = async () => {
      if (!user?._id) return;
      setLoadingTheater(true);
      try {
        const theater = await theaterApi.getTheaterByManagerId(user._id);
        if (theater?._id) setTheaterId(theater._id);
      } catch (error) {
        message.error("Không thể lấy thông tin rạp!");
      } finally {
        setLoadingTheater(false);
      }
    };
    fetchTheater();
  }, [user]);

  // ===== Fetch rooms by theater =====
  useEffect(() => {
    if (!theaterId) return;
    const fetchRooms = async () => {
      setLoadingRooms(true);
      try {
        const data = await roomApi.getRoomsByTheater(theaterId);
        setRooms(data || []);
        if (!selectedRoom && data?.length) setSelectedRoom(data[0]);
      } catch (error) {
        message.error("Không thể tải danh sách phòng!");
      } finally {
        setLoadingRooms(false);
      }
    };
    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theaterId]);

  // ===== Fetch seats of room =====
  useEffect(() => {
    if (!selectedRoom) return;
    const fetchSeats = async () => {
      setLoadingSeats(true);
      try {
        const data = await seatApi.getSeatsByRoom(selectedRoom._id);
        setSeats(data.seats || []);
      } catch (error) {
        message.error("Không thể tải danh sách ghế!");
      } finally {
        setLoadingSeats(false);
      }
    };
    fetchSeats();
  }, [selectedRoom]);

  const handleAddRoom = async (values) => {
    try {
      setSubmittingRoom(true);
      const data = await roomApi.createRoom({ ...values, theaterId });
      setRooms((prev) => [...prev, data.room]);
      setShowRoomModal(false);
      roomForm.resetFields();
      message.success("Tạo phòng thành công!");
    } catch (error) {
      message.error("Không thể tạo phòng!");
    } finally {
      setSubmittingRoom(false);
    }
  };

  const handleAddSeat = async (values) => {
    setSubmittingSeat(true);
    try {
      const seatType = values.seatType;

      if (seatType === "VIP") {
        // Limit 10 VIP seats
        const vipSeats = seats.filter((s) => s.seatType === "VIP");
        if (vipSeats.length >= 10) {
          message.error("Hàng VIP đã đủ 10 ghế, không thể thêm nữa!");
          setSubmittingSeat(false);
          return;
        }
      }

      if (seatType === "Couple") {
        const [firstSeat, secondSeat] = values.seatNumber.split(",");
        const [firstResult, secondResult] = await Promise.all([
          seatApi.createSeat({
            ...values,
            seatNumber: firstSeat,
            roomId: selectedRoom._id,
          }),
          seatApi.createSeat({
            ...values,
            seatNumber: secondSeat,
            roomId: selectedRoom._id,
          }),
        ]);
        setSeats((prev) => [...prev, firstResult.seat, secondResult.seat]);
      } else {
        const data = await seatApi.createSeat({
          ...values,
          roomId: selectedRoom._id,
        });
        setSeats((prev) => [...prev, data.seat]);
      }

      setShowSeatModal(false);
      seatForm.resetFields();
      message.success("Tạo ghế mới thành công!");
    } catch (error) {
      message.error("Không thể tạo ghế mới!");
    } finally {
      setSubmittingSeat(false);
    }
  };

  const handleUpdateSeat = async (values) => {
    setSubmittingSeat(true);
    try {
      const targetRow = values.row;
      const targetType = values.seatType;
      const targetNumber = values.seatNumber;

      // Duplicate seat guard
      const existingSeat = seats.find((s) => {
        if (s._id === editingSeat._id) return false;

        if (targetType === "Couple") {
          const [first, second] = targetNumber.split(",").map(Number);
          const n = parseInt(s.seatNumber);
          return (
            s.row === targetRow &&
            (n === first ||
              n === second ||
              (s.seatType === "Couple" && Math.abs(n - first) <= 1) ||
              (s.seatType === "Couple" && Math.abs(n - second) <= 1))
          );
        }
        return s.row === targetRow && s.seatNumber === targetNumber;
      });

      if (existingSeat) {
        message.error("Số ghế này đã tồn tại trong hàng đã chọn!");
        setSubmittingSeat(false);
        return;
      }

      if (targetType === "Couple") {
        const [firstSeat, secondSeat] = targetNumber.split(",");

        if (editingSeat.seatType !== "Couple") {
          const newSeatData = {
            seatType: targetType,
            row: targetRow,
            seatNumber: secondSeat,
            roomId: editingSeat.roomId,
          };

          const [updateResult, createResult] = await Promise.all([
            seatApi.updateSeat(editingSeat._id, {
              ...values,
              seatNumber: firstSeat,
            }),
            seatApi.createSeat(newSeatData),
          ]);

          setSeats((prevSeats) => [
            ...prevSeats.filter((s) => s._id !== editingSeat._id),
            updateResult.seat,
            createResult.seat,
          ]);
        } else {
          // find the paired seat (adjacent number in same row)
          const pairedSeat = seats.find(
            (s) =>
              s.seatType === "Couple" &&
              s.row === editingSeat.row &&
              s._id !== editingSeat._id &&
              Math.abs(parseInt(s.seatNumber) - parseInt(editingSeat.seatNumber)) === 1
          );

          if (pairedSeat) {
            const [updateMain, updatePaired] = await Promise.all([
              seatApi.updateSeat(editingSeat._id, {
                ...values,
                seatNumber: firstSeat,
              }),
              seatApi.updateSeat(pairedSeat._id, {
                ...values,
                seatNumber: secondSeat,
              }),
            ]);

            setSeats((prev) =>
              prev.map((seat) => {
                if (seat._id === editingSeat._id) return updateMain.seat;
                if (seat._id === pairedSeat._id) return updatePaired.seat;
                return seat;
              })
            );
          }
        }
      } else {
        // If converting from Couple to other type → remove its pair
        if (editingSeat.seatType === "Couple") {
          const pairedSeat = seats.find(
            (s) =>
              s.seatType === "Couple" &&
              s.row === editingSeat.row &&
              s._id !== editingSeat._id &&
              Math.abs(parseInt(s.seatNumber) - parseInt(editingSeat.seatNumber)) === 1
          );
          if (pairedSeat) {
            await seatApi.deleteSeat(pairedSeat._id);
          }
        }

        // Assign seat number when converting to VIP
        let newSeatNumber = targetNumber;
        if (targetType === "VIP") {
          const vipSeats = seats.filter((s) => s.seatType === "VIP");
          const usedVipNumbers = vipSeats.map((s) => parseInt(s.seatNumber));
          for (let i = 1; i <= 10; i++) {
            if (!usedVipNumbers.includes(i)) {
              newSeatNumber = i.toString();
              break;
            }
          }
        }

        const finalSeatNumber = targetType === "VIP" ? newSeatNumber : targetNumber;

        const updateResult = await seatApi.updateSeat(editingSeat._id, {
          seatType: targetType,
          row: targetType === "VIP" ? "VIP" : targetRow,
          seatNumber: finalSeatNumber,
          roomId: editingSeat.roomId,
        });

        setSeats((prev) => prev.map((s) => (s._id === editingSeat._id ? updateResult.seat : s)));
      }

      message.success("Cập nhật ghế thành công!");
      setShowSeatModal(false);
      setEditingSeat(null);
      seatForm.resetFields();
    } catch (error) {
      console.error("Error updating seat:", error);
      message.error("Không thể cập nhật ghế!");
    } finally {
      setSubmittingSeat(false);
    }
  };

  const handleDeleteSeat = async (seatId) => {
    try {
      const seatToDelete = seats.find((s) => s._id === seatId);
      if (!seatToDelete) return;

      if (seatToDelete.seatType === "Couple") {
        const pairedSeat = seats.find(
          (s) =>
            s.seatType === "Couple" &&
            s.row === seatToDelete.row &&
            s._id !== seatId &&
            Math.abs(parseInt(s.seatNumber) - parseInt(seatToDelete.seatNumber)) === 1
        );

        if (pairedSeat) {
          await Promise.all([seatApi.deleteSeat(seatId), seatApi.deleteSeat(pairedSeat._id)]);
          setSeats((prev) => prev.filter((seat) => seat._id !== seatId && seat._id !== pairedSeat._id));
        }
      } else {
        await seatApi.deleteSeat(seatId);
        setSeats((prev) => prev.filter((seat) => seat._id !== seatId));
      }
      message.success("Xóa ghế thành công!");
    } catch (error) {
      console.error("Error deleting seat:", error);
      message.error("Không thể xóa ghế!");
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setSeats([]);
  };

  const openSeatModal = (seat = null) => {
    setShowSeatModal(true);
    setEditingSeat(seat);
    setTimeout(() => {
      if (seat) {
        const currentSeat = seat;
        let initialValues = {
          seatType: currentSeat.seatType,
          row: currentSeat.row,
          seatNumber: currentSeat.seatNumber,
        };

        if (currentSeat.seatType === "Couple") {
          const pairedSeat = seats.find(
            (s) =>
              s.seatType === "Couple" &&
              s.row === currentSeat.row &&
              s._id !== currentSeat._id &&
              Math.abs(parseInt(s.seatNumber) - parseInt(currentSeat.seatNumber)) === 1
          );

          if (pairedSeat) {
            const [first, second] = [currentSeat, pairedSeat].sort(
              (a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber)
            );
            initialValues.seatNumber = `${first.seatNumber},${second.seatNumber}`;
          }
        }
        seatForm.setFieldsValue(initialValues);
      } else {
        seatForm.resetFields();
      }
    }, 0);
  };

  // ====== Helpers ======
  const rowsData = useMemo(() => buildRows(seats), [seats]);

  function buildRows(seats = []) {
    const vipSeats = seats.filter((s) => s.seatType === "VIP");
    const otherSeats = seats.filter((s) => s.seatType !== "VIP");
    const rows = new Map();
    otherSeats.forEach((s) => {
      const key = (s.row || "").toUpperCase();
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
    const sorted = Array.from(rows.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    if (vipSeats.length > 0) {
      vipSeats.sort((a, b) => {
        const na = parseInt(a.seatNumber.replace(/\D/g, "") || "0", 10);
        const nb = parseInt(b.seatNumber.replace(/\D/g, "") || "0", 10);
        return na - nb;
      });
      sorted.push(["VIP", vipSeats]);
    }
    return sorted;
  }

  const counts = useMemo(() => {
    const vip = seats.filter((s) => s.seatType === "VIP").length;
    const couple = Math.floor(
      seats.filter((s) => s.seatType === "Couple").length / 2
    );
    const standard = seats.filter((s) => s.seatType === "Tiêu chuẩn").length;
    return { vip, couple, standard, total: seats.length };
  }, [seats]);

  // Animated seat wrapper (tiny hover effect)
  const SeatBox = useCallback(
    ({ children, disabled, onClick, style }) => (
      <div
        style={{
          ...style,
          position: "relative",
          transition: "transform 120ms ease, box-shadow 120ms ease, opacity 160ms ease",
          opacity: disabled ? 0.6 : 1,
          cursor: disabled ? "not-allowed" : "pointer",
        }}
        onClick={disabled ? undefined : onClick}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = disabled ? "none" : "translateY(-1px)";
          e.currentTarget.style.boxShadow = disabled
            ? "none"
            : "0 6px 18px rgba(0,0,0,0.25)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "none";
          e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.35)";
        }}
      >
        {children}
      </div>
    ),
    []
  );

  const SeatLegend = () => (
    <Space wrap size="small">
      <Tag color="gold">VIP</Tag>
      <Tag>Tiêu chuẩn</Tag>
      <Tag color="magenta">Couple</Tag>
      <Tag color="default">Trống</Tag>
      <Tag color="default" style={{ opacity: 0.5 }}>
        Khóa
      </Tag>
    </Space>
  );

  const ScreenBar = () => (
    <div style={{ textAlign: "center", marginBottom: 28 }}>
      <div
        style={{
          background: "linear-gradient(90deg,#fdfdfd,#eaeaea,#fdfdfd)",
          borderRadius: 14,
          padding: "12px 0",
          fontWeight: 700,
          color: token.colorText,
          boxShadow: "0 4px 18px rgba(0,0,0,0.15)",
          width: "70%",
          margin: "0 auto",
          fontSize: 18,
          letterSpacing: 3,
        }}
      >
        MÀN HÌNH
      </div>
    </div>
  );

  const headerGradient = `linear-gradient(135deg, ${token.colorBgElevated} 0%, ${token.colorFillSecondary} 100%)`;

  return (
    <div className="room-dashboard" style={{ padding: 16 }}>
      {/* ===== Header ===== */}
      <Card
        style={{
          background: headerGradient,
          borderRadius: 16,
          marginBottom: 16,
          overflow: "hidden",
          backdropFilter: "blur(6px)",
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
        bodyStyle={{ padding: 20 }}
      >
        <Row align="middle" justify="space-between" gutter={[16, 16]}>
          <Col>
            <Space direction="vertical" size={4}>
              <Space>
                <ClusterOutlined style={{ color: token.colorPrimary, fontSize: 24 }} />
                <Title level={3} style={{ margin: 0 }}>
                  Cinema Gate
                </Title>
              </Space>
              <Text type="secondary">Quản lý phòng chiếu</Text>
            </Space>
          </Col>
          <Col>
            <Space>
              <Segmented
                options={[
                  { label: "Rộng rãi", value: "Comfort", icon: <LayoutOutlined /> },
                  { label: "Gọn", value: "Compact", icon: <AppstoreOutlined /> },
                ]}
                value={density}
                onChange={setDensity}
              />
              <Button type="primary" icon={<PlusOutlined />} onClick={() => setShowRoomModal(true)}>
                Thêm phòng
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* ===== Stats + rooms ===== */}
      <Row gutter={[16, 16]} style={{ marginBottom: 8 }}>
        <Col xs={24} md={12} lg={6}>
          <Card hoverable>
            <Statistic title="Tổng số phòng" value={rooms.length} valueStyle={{ fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card hoverable>
            <Statistic title="Tổng ghế" value={counts.total} valueStyle={{ fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card hoverable>
            <Statistic title="VIP" value={counts.vip} valueStyle={{ fontWeight: 700 }} />
          </Card>
        </Col>
        <Col xs={24} md={12} lg={6}>
          <Card hoverable>
            <Statistic title="Couple (cặp)" value={counts.couple} valueStyle={{ fontWeight: 700 }} />
          </Card>
        </Col>
      </Row>

      <Card title="Danh sách phòng" style={{ marginBottom: 24 }} bodyStyle={{ paddingBottom: 8 }}>
        {loadingTheater || loadingRooms ? (
          <div style={{ padding: 24 }}>
            <Skeleton active paragraph={{ rows: 2 }} />
          </div>
        ) : rooms.length === 0 ? (
          <Empty description="Chưa có phòng - hãy tạo phòng đầu tiên!" image={Empty.PRESENTED_IMAGE_SIMPLE} />
        ) : (
          <Row gutter={[16, 16]}>
            {rooms.map((room) => {
              const isActive = selectedRoom?._id === room._id;
              const cardInner = (
                <Card
                  key={room._id}
                  hoverable
                  onClick={() => handleSelectRoom(room)}
                  style={{
                    borderRadius: 12,
                    border: isActive ? `1px solid ${token.colorPrimary}` : undefined,
                    boxShadow: isActive ? `0 0 0 2px ${token.colorPrimaryBg}` : undefined,
                  }}
                >
                  <Space direction="vertical" size={6} style={{ width: "100%" }}>
                    <Space align="center">
                      <Title level={5} style={{ margin: 0 }}>
                        Phòng {room.roomNumber}
                      </Title>
                      <Tag color={isActive ? "blue" : "default"}>
                        <AppstoreOutlined /> {isActive ? counts.total : room.seatCount ?? "-"}
                      </Tag>
                    </Space>
                    <Text type="secondary">Nhấn để chọn và xem sơ đồ ghế</Text>
                  </Space>
                </Card>
              );
              return (
                <Col key={room._id} xs={12} sm={8} md={6} lg={4}>
                  {isActive ? (
                    <Badge.Ribbon text="Đang chọn" color="blue">
                      {cardInner}
                    </Badge.Ribbon>
                  ) : (
                    cardInner
                  )}
                </Col>
              );
            })}
          </Row>
        )}
      </Card>

      {/* ===== Seat map ===== */}
      {selectedRoom ? (
        <Card
          style={{
            borderRadius: 16,
            background: `linear-gradient(135deg, ${token.colorBgElevated} 0%, ${token.colorFillQuaternary} 70%, ${token.colorBgLayout} 100%)`,
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
          headStyle={{ borderBottom: "none" }}
          bodyStyle={{ padding: 24 }}
          title={
            <Space size={12} align="center">
              <Title level={4} style={{ margin: 0 }}>
                Sơ đồ chỗ ngồi • Phòng {selectedRoom.roomNumber}
              </Title>
              <SeatLegend />
            </Space>
          }
          extra={
            <Button type="primary" icon={<PlusOutlined />} onClick={() => openSeatModal()}>
              Thêm ghế
            </Button>
          }
        >
          <div
            style={{
              borderRadius: 16,
              padding: density === "Compact" ? 16 : 24,
              boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
              maxWidth: 980,
              margin: "0 auto",
              overflowX: "auto",
              minHeight: 360,
              border: `1px dashed ${token.colorBorder}`,
              backgroundImage:
                "radial-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px)",
              backgroundSize: "16px 16px, 16px 16px",
              backgroundPosition: "0 0, 8px 8px",
            }}
          >
            <ScreenBar />

            {loadingSeats ? (
              <div style={{ padding: 48 }}>
                <Skeleton active paragraph={{ rows: 6 }} />
              </div>
            ) : seats.length > 0 ? (
              <div style={{ marginBottom: 8 }}>
                {rowsData.map(([rowKey, arr]) => (
                  <div
                    key={rowKey}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40px 1fr 40px",
                      alignItems: "center",
                      marginBottom: density === "Compact" ? 8 : 12,
                    }}
                  >
                    {/* Left row label */}
                    <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14 }}>{rowKey}</div>

                    {/* Seats */}
                    <div
                      style={{
                        minWidth: 0,
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: density === "Compact" ? 8 : 10,
                      }}
                    >
                      {arr.map((seat) => {
                        // Couple: render once for the pair (the left-most seat)
                        if (seat.seatType === "Couple") {
                          const pairedSeat = seats.find(
                            (s) =>
                              s.seatType === "Couple" &&
                              s.row === seat.row &&
                              s._id !== seat._id &&
                              Math.abs(parseInt(s.seatNumber) - parseInt(seat.seatNumber)) === 1
                          );

                          if (pairedSeat && parseInt(seat.seatNumber) > parseInt(pairedSeat.seatNumber)) {
                            return null; // skip right seat of the pair
                          }

                          const [first, second] = pairedSeat
                            ? [seat, pairedSeat].sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber))
                            : [seat];
                          const seatLabel = pairedSeat
                            ? `${seat.row}${first.seatNumber}-${second.seatNumber}`
                            : `${seat.row}${seat.seatNumber}`;

                          const coupleStyle = {
                            width: density === "Compact" ? 88 : 94,
                            height: density === "Compact" ? 42 : 46,
                            borderRadius: 12,
                            border: `1px solid ${token.colorBorderSecondary}`,
                            fontSize: 13,
                            fontWeight: 700,
                            display: "grid",
                            placeItems: "center",
                            boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
                            background:
                              "linear-gradient(135deg, rgba(255,182,193,0.95) 60%, rgba(255,105,180,0.95) 100%)",
                            color: seat.isDisabled ? token.colorTextQuaternary : token.colorText,
                          };

                          return (
                            <Tooltip
                              key={seat._id}
                              title={
                                <Space size={8}>
                                  <Tag color="magenta">Couple</Tag>
                                  <Text strong>{seatLabel}</Text>
                                </Space>
                              }
                            >
                              <SeatBox style={coupleStyle} disabled={seat.isDisabled} onClick={() => openSeatModal(seat)}>
                                {seatLabel}
                              </SeatBox>
                            </Tooltip>
                          );
                        }

                        // Standard & VIP
                        const isVip = seat.seatType === "VIP";
                        const seatStyle = {
                          width: density === "Compact" ? 42 : 46,
                          height: density === "Compact" ? 42 : 46,
                          borderRadius: 12,
                          border: `1px solid ${token.colorBorderSecondary}`,
                          fontSize: 13,
                          fontWeight: 700,
                          display: "grid",
                          placeItems: "center",
                          boxShadow: "0 2px 10px rgba(0,0,0,0.35)",
                          background: isVip
                            ? "linear-gradient(135deg, #ffe066 65%, #ffd700 100%)"
                            : `linear-gradient(135deg, ${token.colorBgContainer} 70%, ${token.colorFillSecondary} 100%)`,
                          color: seat.isDisabled ? token.colorTextQuaternary : token.colorText,
                        };

                        return (
                          <Tooltip
                            key={seat._id}
                            title={
                              <Space size={8}>
                                {isVip ? <Tag color="gold">VIP</Tag> : <Tag>Tiêu chuẩn</Tag>}
                                <Text strong>
                                  {isVip ? seat.seatNumber : `${seat.row}${seat.seatNumber}`}
                                </Text>
                              </Space>
                            }
                          >
                            <SeatBox
                              style={seatStyle}
                              disabled={seat.isDisabled}
                              onClick={() => openSeatModal(seat)}
                            >
                              {isVip ? seat.seatNumber : `${seat.row}${seat.seatNumber}`}
                            </SeatBox>
                          </Tooltip>
                        );
                      })}
                    </div>

                    {/* Right row label */}
                    <div style={{ textAlign: "center", fontWeight: 700, fontSize: 14 }}>{rowKey}</div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có ghế trong phòng này" />
            )}
          </div>
        </Card>
      ) : (
        <Card>
          <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Hãy chọn một phòng để xem sơ đồ ghế" />
        </Card>
      )}

      {/* ===== Modal: Thêm phòng ===== */}
      <Modal
        title="Thêm phòng chiếu"
        open={showRoomModal}
        onCancel={() => setShowRoomModal(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={roomForm} layout="vertical" onFinish={handleAddRoom}>
          <Form.Item name="roomNumber" label="Số phòng" rules={[{ required: true, message: "Nhập số phòng!" }]}>
            <Input placeholder="VD: 1, 2, 3..." />
          </Form.Item>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={() => setShowRoomModal(false)}>Hủy</Button>
            <Button type="primary" htmlType="submit" loading={submittingRoom}>
              Tạo phòng
            </Button>
          </Space>
        </Form>
      </Modal>

      {/* ===== Modal: Thêm / Sửa ghế ===== */}
      <Modal
        title={
          <Space>
            {editingSeat ? <EditOutlined /> : <PlusOutlined />}
            <span>{editingSeat ? "Chỉnh sửa ghế" : "Thêm ghế"}</span>
          </Space>
        }
        open={showSeatModal}
        onCancel={() => {
          setShowSeatModal(false);
          setEditingSeat(null);
          seatForm.resetFields();
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={seatForm} layout="vertical" onFinish={editingSeat ? handleUpdateSeat : handleAddSeat}>
          <Form.Item name="seatType" label="Loại ghế" rules={[{ required: true, message: "Chọn loại ghế!" }]}>
            <Select
              options={seatTypes}
              onChange={(value) => {
                if (value === "VIP") {
                  seatForm.setFieldValue("row", "VIP");
                  const vipSeats = seats.filter((s) => s.seatType === "VIP");
                  const usedVipNumbers = vipSeats.map((s) => parseInt(s.seatNumber));
                  for (let i = 1; i <= 10; i++) {
                    if (!usedVipNumbers.includes(i)) {
                      seatForm.setFieldValue("seatNumber", i.toString());
                      break;
                    }
                  }
                } else {
                  seatForm.setFieldsValue({ row: undefined, seatNumber: undefined });
                }
              }}
            />
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.seatType !== cur.seatType}>
            {({ getFieldValue }) => {
              const seatType = getFieldValue("seatType");
              return seatType && seatType !== "VIP" ? (
                <Form.Item name="row" label="Hàng" rules={[{ required: true, message: "Chọn hàng!" }]}>
                  <Select
                    options={[
                      { label: "A", value: "A" },
                      { label: "B", value: "B" },
                      { label: "C", value: "C" },
                      { label: "D", value: "D" },
                      { label: "E", value: "E" },
                      { label: "F", value: "F" },
                      { label: "G", value: "G" },
                      { label: "H", value: "H" },
                      { label: "I", value: "I" },
                    ]}
                    onChange={() => {
                      seatForm.setFieldValue("seatNumber", undefined);
                    }}
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>

          <Form.Item noStyle shouldUpdate={(prev, cur) => prev.seatType !== cur.seatType || prev.row !== cur.row}>
            {({ getFieldValue }) => {
              const seatType = getFieldValue("seatType");
              const row = getFieldValue("row");
              return seatType && (row || seatType === "VIP") ? (
                <Form.Item
                  name="seatNumber"
                  label="Số ghế"
                  rules={[
                    { required: true, message: "Chọn số ghế!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const st = getFieldValue("seatType");
                        if (st === "Couple") {
                          if (!value || !value.includes(",")) return Promise.reject("Vui lòng chọn cặp ghế!");
                          const [first, second] = value.split(",");
                          if (!first || !second || isNaN(first) || isNaN(second))
                            return Promise.reject("Giá trị ghế không hợp lệ!");
                          if (parseInt(first) + 1 !== parseInt(second))
                            return Promise.reject("Cặp ghế phải là 2 số liên tiếp!");
                        } else if (st !== "VIP") {
                          if (!/^[1-9]$|^10$/.test(value)) return Promise.reject("Số ghế phải từ 1-10!");
                        }
                        return Promise.resolve();
                      },
                    }),
                  ]}
                >
                  <Select
                    options={(() => {
                      const currentRow = getFieldValue("row") || "VIP";
                      const currentType = getFieldValue("seatType");

                      const usedNumbers = seats
                        .filter((seat) => seat.row === currentRow && (!editingSeat || seat._id !== editingSeat._id))
                        .map((seat) => seat.seatNumber);

                      const coupleSeats = seats.filter(
                        (seat) => seat.row === currentRow && seat.seatType === "Couple" && (!editingSeat || seat._id !== editingSeat._id)
                      );

                      const usedNumbersSet = new Set(usedNumbers);
                      const availableSeats = [];

                      for (let i = 1; i <= 10; i++) {
                        const seatNum = String(i);
                        const displayNum = currentRow === "VIP" ? seatNum : `${currentRow}${seatNum}`;

                        const isPartOfCouple = coupleSeats.some((cSeat) => {
                          const paired = seats.find(
                            (s) =>
                              s.seatType === "Couple" &&
                              s.row === cSeat.row &&
                              s._id !== cSeat._id &&
                              Math.abs(parseInt(s.seatNumber) - parseInt(cSeat.seatNumber)) === 1
                          );
                          if (paired) {
                            const min = Math.min(parseInt(cSeat.seatNumber), parseInt(paired.seatNumber));
                            const max = Math.max(parseInt(cSeat.seatNumber), parseInt(paired.seatNumber));
                            const n = parseInt(seatNum);
                            return n >= min && n <= max;
                          }
                          return false;
                        });

                        if (!usedNumbersSet.has(seatNum) && !isPartOfCouple) {
                          if (currentType === "Couple") {
                            const nextSeatNum = String(i + 1);
                            if (i < 10 && !usedNumbersSet.has(nextSeatNum) && !isPartOfCouple) {
                              availableSeats.push({
                                label: `${displayNum} - ${currentRow === "VIP" ? nextSeatNum : `${currentRow}${nextSeatNum}`} (Couple)`,
                                value: `${seatNum},${nextSeatNum}`,
                              });
                            }
                          } else {
                            availableSeats.push({ label: displayNum, value: seatNum });
                          }
                        }
                      }
                      return availableSeats;
                    })()}
                    placeholder="Chọn số ghế còn trống"
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>

          <Divider style={{ margin: "8px 0 16px" }} />

          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginTop: 4 }}>
            <Button
              onClick={() => {
                setShowSeatModal(false);
                setEditingSeat(null);
                seatForm.resetFields();
              }}
            >
              Hủy
            </Button>
            <Space>
              {editingSeat && (
                <Popconfirm
                  title="Xóa ghế"
                  description="Bạn có chắc chắn muốn xóa ghế này?"
                  onConfirm={() => {
                    handleDeleteSeat(editingSeat._id);
                    setShowSeatModal(false);
                  }}
                  okText="Xóa"
                  cancelText="Hủy"
                  okButtonProps={{ danger: true }}
                >
                  <Button danger>Xóa</Button>
                </Popconfirm>
              )}
              <Button type="primary" htmlType="submit" loading={submittingSeat}>
                {editingSeat ? "Cập nhật" : "Thêm"}
              </Button>
            </Space>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomsDashboard;
