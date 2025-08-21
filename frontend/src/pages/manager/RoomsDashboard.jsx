import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { seatApi } from "../../api/modules/seat.api";
import { roomApi } from "../../api/modules/room.api";
import { theaterApi } from "../../api/modules/theater.api";
import { Button, Modal, Input, Select, message, Form, Card, Popconfirm } from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";

const seatTypes = [
  { label: "VIP", value: "VIP" },
  { label: "Tiêu chuẩn", value: "Tiêu chuẩn" },
  { label: "Couple", value: "Couple" },
];

const RoomsDashboard = () => {
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

  useEffect(() => {
    const fetchTheater = async () => {
      if (!user?._id) return;
      try {
        const theater = await theaterApi.getTheaterByManagerId(user._id);
        if (theater?._id) setTheaterId(theater._id);
      } catch (error) {
        message.error("Không thể lấy thông tin rạp!");
      }
    };
    fetchTheater();
  }, [user]);

  useEffect(() => {
    if (!theaterId) return;
    const fetchRooms = async () => {
      try {
        const data = await roomApi.getRoomsByTheater(theaterId);
        setRooms(data || []);
      } catch (error) {
        message.error("Không thể tải danh sách phòng!");
      }
    };
    fetchRooms();
  }, [theaterId]);

  useEffect(() => {
    if (!selectedRoom) return;
    const fetchSeats = async () => {
      try {
        const data = await seatApi.getSeatsByRoom(selectedRoom._id);
        setSeats(data.seats || []);
      } catch (error) {
        message.error("Không thể tải danh sách ghế!");
      }
    };
    fetchSeats();
  }, [selectedRoom]);

  const handleAddRoom = async (values) => {
    try {
      const data = await roomApi.createRoom({ ...values, theaterId });
      setRooms([...rooms, data.room]);
      setShowRoomModal(false);
      roomForm.resetFields();
      message.success("Tạo phòng thành công!");
    } catch (error) {
      message.error("Không thể tạo phòng!");
    }
  };

  const handleAddSeat = async (values) => {
    const seatType = values.seatType;
    let rowKey = (values.row || "").toUpperCase();
    
    // Nếu là ghế VIP thì kiểm tra riêng hàng VIP
    if (seatType === "VIP") {
      const vipSeats = seats.filter((s) => s.seatType === "VIP");
      if (vipSeats.length >= 10) {
        message.error("Hàng VIP đã đủ 10 ghế, không thể thêm nữa!");
        return;
      }
    }

    try {
      if (seatType === "Couple") {
        // Với ghế Couple, values.seatNumber sẽ có format "1,2" cho 2 ghế kế nhau
        const [firstSeat, secondSeat] = values.seatNumber.split(',');
        
        // Tạo ghế thứ nhất
        const firstSeatData = { 
          ...values, 
          seatNumber: firstSeat, 
          roomId: selectedRoom._id
        };
        
        // Tạo ghế thứ hai
        const secondSeatData = { 
          ...values, 
          seatNumber: secondSeat, 
          roomId: selectedRoom._id
        };
        
        const [firstResult, secondResult] = await Promise.all([
          seatApi.createSeat(firstSeatData),
          seatApi.createSeat(secondSeatData)
        ]);
        
        // Thêm cả 2 ghế vào state
        setSeats([...seats, firstResult.seat, secondResult.seat]);
      } else {
        // Xử lý ghế thường và VIP như cũ
        const seatData = { ...values, roomId: selectedRoom._id };
        const data = await seatApi.createSeat(seatData);
        setSeats([...seats, data.seat]);
      }
      
      setShowSeatModal(false);
      seatForm.resetFields();
      message.success("Tạo ghế mới thành công!");
    } catch (error) {
      message.error("Không thể tạo ghế mới!");
    }
  };

  const handleUpdateSeat = async (values) => {
    try {
      // Kiểm tra xem có thể cập nhật sang vị trí mới không
      const targetRow = values.row;
      const targetType = values.seatType;
      const targetNumber = values.seatNumber;

      // Kiểm tra xem ghế đã tồn tại trong hàng mới chưa
      const existingSeat = seats.find(s => {
        if (s._id === editingSeat._id) return false;
        
        if (targetType === "Couple") {
          const [first, second] = targetNumber.split(',').map(Number);
          return s.row === targetRow && 
            (parseInt(s.seatNumber) === first || 
             parseInt(s.seatNumber) === second ||
             (s.seatType === "Couple" && Math.abs(parseInt(s.seatNumber) - first) <= 1) ||
             (s.seatType === "Couple" && Math.abs(parseInt(s.seatNumber) - second) <= 1));
        }
        
        return s.row === targetRow && s.seatNumber === targetNumber;
      });

      if (existingSeat) {
        message.error("Số ghế này đã tồn tại trong hàng đã chọn!");
        return;
      }

      // Nếu đang cập nhật ghế couple
      if (targetType === "Couple") {
        const [firstSeat, secondSeat] = targetNumber.split(',');
        
        // Kiểm tra xem có phải đang chuyển từ ghế thường sang couple không
        if (editingSeat.seatType !== "Couple") {
          // Tạo ghế mới cho phần tử thứ hai của cặp ghế
          const newSeatData = {
            seatType: targetType,
            row: targetRow,
            seatNumber: secondSeat,
            roomId: editingSeat.roomId
          };
          
          // Cập nhật ghế hiện tại và tạo ghế mới
          const [updateResult, createResult] = await Promise.all([
            seatApi.updateSeat(editingSeat._id, {
              ...values,
              seatNumber: firstSeat
            }),
            seatApi.createSeat(newSeatData)
          ]);

          setSeats(prevSeats => [
            ...prevSeats.filter(s => s._id !== editingSeat._id),
            updateResult.seat,
            createResult.seat
          ]);
        } else {
          // Nếu đã là ghế couple, tìm và cập nhật cả cặp
          const pairedSeat = seats.find(s => 
            s.seatType === "Couple" && 
            s.row === editingSeat.row && 
            s._id !== editingSeat._id
          );

          if (pairedSeat) {
            const [updateMain, updatePaired] = await Promise.all([
              seatApi.updateSeat(editingSeat._id, {
                ...values,
                seatNumber: firstSeat
              }),
              seatApi.updateSeat(pairedSeat._id, {
                ...values,
                seatNumber: secondSeat
              })
            ]);

            setSeats(prevSeats => prevSeats.map(seat => {
              if (seat._id === editingSeat._id) return updateMain.seat;
              if (seat._id === pairedSeat._id) return updatePaired.seat;
              return seat;
            }));
          }
        }
      } else {
        // Xử lý chuyển đổi loại ghế
        if (editingSeat.seatType === "Couple") {
          // Tìm và xóa ghế couple đi kèm
          const pairedSeat = seats.find(s => 
            s.seatType === "Couple" && 
            s.row === editingSeat.row && 
            s._id !== editingSeat._id
          );

          if (pairedSeat) {
            await seatApi.deleteSeat(pairedSeat._id);
          }
        }

        // Xử lý số ghế khi chuyển sang VIP
        let newSeatNumber = targetNumber;
        if (targetType === "VIP") {
          // Khi chuyển sang VIP, lấy số ghế VIP tiếp theo
          const vipSeats = seats.filter(s => s.seatType === "VIP");
          const usedVipNumbers = vipSeats.map(s => parseInt(s.seatNumber));
          for (let i = 1; i <= 10; i++) {
            if (!usedVipNumbers.includes(i)) {
              newSeatNumber = i.toString();
              break;
            }
          }
        }

        // Xử lý số ghế theo loại ghế mới
        let finalSeatNumber;
        if (targetType === "VIP") {
          // Đối với ghế VIP, số ghế sẽ là số từ 1-10
          finalSeatNumber = newSeatNumber;
        } else {
          // Đối với ghế thường hoặc couple, số ghế sẽ giữ nguyên thứ tự nhưng đổi hàng
          const currentNumber = editingSeat.seatNumber;
          finalSeatNumber = currentNumber;
        }

        // Cập nhật ghế hiện tại
        const updateResult = await seatApi.updateSeat(editingSeat._id, {
          seatType: targetType,
          row: targetType === "VIP" ? "VIP" : targetRow,
          seatNumber: finalSeatNumber,
          roomId: editingSeat.roomId
        });
        
        setSeats(prevSeats => prevSeats
          .filter(s => s._id !== (editingSeat.seatType === "Couple" ? 
            seats.find(ps => 
              ps.seatType === "Couple" && 
              ps.row === editingSeat.row && 
              ps._id !== editingSeat._id
            )?._id : null))
          .map(s => s._id === editingSeat._id ? updateResult.seat : s)
        );
      }

      message.success("Cập nhật ghế thành công!");
      setShowSeatModal(false);
      setEditingSeat(null);
      seatForm.resetFields();
    } catch (error) {
      console.error("Error updating seat:", error);
      message.error("Không thể cập nhật ghế!");
    }
  };

  const handleDeleteSeat = async (seatId) => {
    try {
      // Tìm ghế cần xóa
      const seatToDelete = seats.find(s => s._id === seatId);
      if (!seatToDelete) return;

      // Nếu là ghế couple, tìm và xóa cả cặp
      if (seatToDelete.seatType === "Couple") {
        const pairedSeat = seats.find(s => 
          s.seatType === "Couple" && 
          s.row === seatToDelete.row && 
          s._id !== seatId &&
          Math.abs(parseInt(s.seatNumber) - parseInt(seatToDelete.seatNumber)) === 1
        );

        if (pairedSeat) {
          // Xóa cả hai ghế
          await Promise.all([
            seatApi.deleteSeat(seatId),
            seatApi.deleteSeat(pairedSeat._id)
          ]);
          setSeats(seats.filter((seat) => 
            seat._id !== seatId && seat._id !== pairedSeat._id
          ));
        }
      } else {
        // Xóa ghế đơn bình thường
        await seatApi.deleteSeat(seatId);
        setSeats(seats.filter((seat) => seat._id !== seatId));
      }
      message.success("Xóa ghế thành công!");
    } catch (error) {
      console.error("Error deleting seat:", error);
      message.error("Không thể xóa ghế!");
    }
  };

  const handleSelectRoom = (room) => {
    setSelectedRoom(room);
    setSeats([]); // Reset seats khi chuyển phòng
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
          seatNumber: currentSeat.seatNumber
        };

        // Nếu là ghế Couple, tìm ghế đi kèm
        if (currentSeat.seatType === "Couple") {
          const pairedSeat = seats.find(s => 
            s.seatType === "Couple" && 
            s.row === currentSeat.row && 
            s._id !== currentSeat._id &&
            Math.abs(parseInt(s.seatNumber) - parseInt(currentSeat.seatNumber)) === 1
          );

          if (pairedSeat) {
            // Sắp xếp số ghế theo thứ tự tăng dần
            const [first, second] = [currentSeat, pairedSeat].sort((a, b) => 
              parseInt(a.seatNumber) - parseInt(b.seatNumber)
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

  // Helper: nhóm ghế theo hàng, gom VIP thành một hàng riêng sau hàng A
  const buildRows = (seats = []) => {
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
    // Sắp xếp: hàng A, rồi các hàng khác, cuối cùng là VIP
    const sorted = Array.from(rows.entries()).sort((a, b) => {
      if (a[0] === "A") return -1;
      if (b[0] === "A") return 1;
      return a[0].localeCompare(b[0]);
    });
    if (vipSeats.length > 0) {
      vipSeats.sort((a, b) => {
        const na = parseInt(a.seatNumber.replace(/\D/g, "") || "0", 10);
        const nb = parseInt(b.seatNumber.replace(/\D/g, "") || "0", 10);
        return na - nb;
      });
      sorted.push(["VIP", vipSeats]);
    }
    return sorted;
  };

  return (
    <div className="room-dashboard">
      {/* Header */}
      <div className="bg-white shadow-lg mb-8">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Cinema Gate</h1>
              <p className="text-gray-500 mt-1">
                Quản lý phòng chiếu
              </p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: 24 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setShowRoomModal(true)}
        >
          Thêm phòng
        </Button>
      </div>

      <div
        className="rooms-list"
        style={{ display: "flex", gap: 16, flexWrap: "wrap", marginBottom: 32 }}
      >
        {rooms.map((room) => (
          <Card
            key={room._id}
            title={`Phòng ${room.roomNumber}`}
            bordered={selectedRoom?._id === room._id}
            style={{
              width: 200,
              cursor: "pointer",
              background: selectedRoom?._id === room._id ? "#ffe0b2" : "#fff",
            }}
            onClick={() => handleSelectRoom(room)}
          >
            <div>
              Số ghế: {selectedRoom?._id === room._id ? seats.length : (room.seatCount || "-")}
            </div>
          </Card>
        ))}
      </div>

      {selectedRoom && (
        <div>
          <h3
            style={{
              marginBottom: 24,
              textAlign: "center",
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: "#ffffff",
            }}
          >
            Sơ đồ chỗ ngồi phòng {selectedRoom.roomNumber}
          </h3>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => openSeatModal()}
            style={{ marginBottom: 16 }}
          >
            Thêm ghế
          </Button>
          <div
            style={{
              background: "linear-gradient(135deg, #232526 0%, #414345 100%)",
              borderRadius: 24,
              padding: 36,
              boxShadow: "0 8px 40px rgba(0,0,0,0.7)",
              maxWidth: 900,
              margin: "0 auto",
              overflowX: "auto",
              minHeight: 340,
              border: "2px solid #444",
            }}
          >
            {/* Màn hình rạp */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div
                style={{
                  background: "linear-gradient(90deg,#f5f5f5,#e0e0e0,#f5f5f5)",
                  borderRadius: 14,
                  padding: "12px 0",
                  fontWeight: "bold",
                  color: "#222",
                  boxShadow: "0 4px 18px rgba(0,0,0,0.2)",
                  width: "70%",
                  margin: "0 auto",
                  fontSize: 20,
                  letterSpacing: 3,
                }}
              >
                MÀN HÌNH
              </div>
            </div>
            {seats.length > 0 ? (
              <div style={{ marginBottom: "24px" }}>
                {buildRows(seats).map(([rowKey, arr]) => (
                  <div
                    key={rowKey}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "40px 1fr 40px",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    {/* label bên trái */}
                    <div
                      style={{
                        textAlign: "center",
                        fontWeight: 600,
                        color: "#eee",
                        fontSize: 14,
                      }}
                    >
                      {rowKey}
                    </div>
                    {/* dãy ghế ở giữa */}
                    <div
                      style={{
                        minWidth: 0,
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "center",
                        gap: "10px",
                      }}
                    >
                      {arr.map((seat) => {
                        // Đối với ghế couple, chỉ hiển thị một lần cho cặp ghế
                        if (seat.seatType === "Couple") {
                          const pairedSeat = seats.find(s => 
                            s.seatType === "Couple" && 
                            s.row === seat.row && 
                            s._id !== seat._id &&
                            Math.abs(parseInt(s.seatNumber) - parseInt(seat.seatNumber)) === 1
                          );
                          
                          // Nếu đây là ghế thứ hai trong cặp, bỏ qua không hiển thị
                          if (pairedSeat && parseInt(seat.seatNumber) > parseInt(pairedSeat.seatNumber)) {
                            return null;
                          }

                          // Lấy số ghế cho cặp ghế couple
                          const [first, second] = pairedSeat 
                            ? [seat, pairedSeat].sort((a, b) => parseInt(a.seatNumber) - parseInt(b.seatNumber))
                            : [seat];
                          const seatLabel = pairedSeat 
                            ? `${seat.row}${first.seatNumber}-${second.seatNumber}` 
                            : `${seat.row}${seat.seatNumber}`;

                          return (
                            <div
                              key={seat._id}
                              style={{
                                width: 88,
                                height: 44,
                                borderRadius: 12,
                                border: "2px solid #e0e0e0",
                                fontSize: 13,
                                fontWeight: 600,
                                display: "grid",
                                placeItems: "center",
                                boxShadow: "0 2px 8px #2222",
                                background: "linear-gradient(135deg, #ffb6c1 70%, #ff69b4 100%)",
                                color: seat.isDisabled ? "#bbb" : "#222",
                                cursor: seat.isDisabled ? "not-allowed" : "pointer",
                                transition: "transform 0.2s, box-shadow 0.2s",
                              }}
                              onClick={() =>
                                !seat.isDisabled && openSeatModal(seat)
                              }
                              title={`${seatLabel} • Couple`}
                            >
                              {seatLabel}
                            </div>
                          );
                        }

                        // Hiển thị ghế thường và VIP như cũ
                        return (
                          <div
                            key={seat._id}
                            style={{
                              width: 44,
                              height: 44,
                              borderRadius: 12,
                              border: "2px solid #e0e0e0",
                              fontSize: 13,
                              fontWeight: 600,
                              display: "grid",
                              placeItems: "center",
                              boxShadow: "0 2px 8px #2222",
                              background:
                                seat.seatType === "VIP"
                                  ? "linear-gradient(135deg, #ffe066 70%, #ffd700 100%)"
                                  : "linear-gradient(135deg, #fff 70%, #e0e0e0 100%)",
                              color: seat.isDisabled ? "#bbb" : "#222",
                              cursor: seat.isDisabled ? "not-allowed" : "pointer",
                              transition: "transform 0.2s, box-shadow 0.2s",
                            }}
                            onClick={() =>
                              !seat.isDisabled && openSeatModal(seat)
                            }
                            title={`${seat.row}${seat.seatNumber} • ${seat.seatType}`}
                          >
                            {seat.seatType === "VIP" ? seat.seatNumber : `${seat.row}${seat.seatNumber}`}
                          </div>
                        );
                      })}
                    </div>
                    {/* label bên phải */}
                    <div
                      style={{
                        textAlign: "center",
                        fontWeight: 600,
                        color: "#eee",
                        fontSize: 14,
                      }}
                    >
                      {rowKey}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: "#fff", textAlign: "center", marginTop: 32 }}>
                Chưa có ghế trong phòng này.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Modal thêm phòng */}
      <Modal
        title="Thêm phòng chiếu"
        open={showRoomModal}
        onCancel={() => setShowRoomModal(false)}
        footer={null}
      >
        <Form form={roomForm} layout="vertical" onFinish={handleAddRoom}>
          <Form.Item
            name="roomNumber"
            label="Số phòng"
            rules={[{ required: true, message: "Nhập số phòng!" }]}
          >
            <Input />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Tạo phòng
          </Button>
        </Form>
      </Modal>

      {/* Modal thêm/sửa ghế */}
      <Modal
        title={editingSeat ? "Chỉnh sửa ghế" : "Thêm ghế"}
        open={showSeatModal}
        onCancel={() => {
          setShowSeatModal(false);
          setEditingSeat(null);
          seatForm.resetFields();
        }}
        footer={null}
      >
        <Form
          form={seatForm}
          layout="vertical"
          onFinish={editingSeat ? handleUpdateSeat : handleAddSeat}
        >
          <Form.Item
            name="seatType"
            label="Loại ghế"
            rules={[{ required: true, message: "Chọn loại ghế!" }]}
          >
            <Select 
              options={seatTypes}
              onChange={(value) => {
                if (value === 'VIP') {
                  seatForm.setFieldValue('row', 'VIP');
                  // Tìm số ghế VIP tiếp theo có sẵn
                  const vipSeats = seats.filter(s => s.seatType === "VIP");
                  const usedVipNumbers = vipSeats.map(s => parseInt(s.seatNumber));
                  for (let i = 1; i <= 10; i++) {
                    if (!usedVipNumbers.includes(i)) {
                      seatForm.setFieldValue('seatNumber', i.toString());
                      break;
                    }
                  }
                } else {
                  seatForm.setFieldsValue({
                    row: undefined,
                    seatNumber: undefined
                  });
                }
              }}
            />
          </Form.Item>
          
          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.seatType !== currentValues.seatType}
          >
            {({ getFieldValue }) => {
              const seatType = getFieldValue('seatType');
              return seatType && seatType !== 'VIP' ? (
                <Form.Item
                  name="row"
                  label="Hàng"
                  rules={[{ required: true, message: "Chọn hàng!" }]}
                >
                  <Select
                    options={[
                      { label: 'A', value: 'A' },
                      { label: 'B', value: 'B' },
                      { label: 'C', value: 'C' },
                      { label: 'D', value: 'D' },
                      { label: 'E', value: 'E' },
                      { label: 'F', value: 'F' },
                      { label: 'G', value: 'G' },
                      { label: 'H', value: 'H' },
                      { label: 'I', value: 'I' },
                    ]}
                    onChange={() => {
                      seatForm.setFieldValue('seatNumber', undefined);
                    }}
                  />
                </Form.Item>
              ) : null;
            }}
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => 
              prevValues.seatType !== currentValues.seatType ||
              prevValues.row !== currentValues.row
            }
          >
            {({ getFieldValue }) => {
              const seatType = getFieldValue('seatType');
              const row = getFieldValue('row');
              return seatType && row ? (
                <Form.Item
                  name="seatNumber"
                  label="Số ghế"
                  rules={[
                    { required: true, message: "Chọn số ghế!" },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        const seatType = getFieldValue('seatType');
                        if (seatType === 'Couple') {
                          if (!value || !value.includes(',')) {
                            return Promise.reject('Vui lòng chọn cặp ghế!');
                          }
                          const [first, second] = value.split(',');
                          if (!first || !second || isNaN(first) || isNaN(second)) {
                            return Promise.reject('Giá trị ghế không hợp lệ!');
                          }
                          if (parseInt(first) >= parseInt(second)) {
                            return Promise.reject('Cặp ghế phải kế tiếp nhau!');
                          }
                        } else {
                          if (!value || !/^[1-9]$|^10$/.test(value)) {
                            return Promise.reject('Số ghế phải từ 1-10!');
                          }
                        }
                        return Promise.resolve();
                      }
                    })
                  ]}
                >
                  <Select
                    options={(() => {
                      // Lấy các số ghế đã sử dụng trong hàng này
                      const currentRow = getFieldValue('row');
                      const currentType = getFieldValue('seatType');
                      
                      // Lấy tất cả số ghế đã sử dụng trong hàng (kể cả couple)
                      const usedNumbers = seats
                        .filter(seat => 
                          seat.row === currentRow && 
                          (!editingSeat || seat._id !== editingSeat._id) // Bỏ qua ghế đang edit
                        )
                        .map(seat => seat.seatNumber);
                        
                      // Thêm các số ghế couple vào danh sách đã sử dụng
                      const coupleSeats = seats.filter(seat => 
                        seat.row === currentRow && 
                        seat.seatType === 'Couple' &&
                        (!editingSeat || seat._id !== editingSeat._id)
                      );
                      
                      // Tạo set các số ghế đã sử dụng
                      const usedNumbersSet = new Set(usedNumbers);

                      // Tạo mảng các số ghế còn trống
                      const availableSeats = [];
                      for (let i = 1; i <= 10; i++) {
                        const seatNum = String(i);
                        const currentRow = getFieldValue('row');
                        const displayNum = currentRow === 'VIP' ? seatNum : `${currentRow}${seatNum}`;
                        
                        // Kiểm tra xem số ghế có nằm trong ghế couple không
                        const isPartOfCouple = coupleSeats.some(coupleSeat => {
                          const pairedSeat = seats.find(s => 
                            s.seatType === 'Couple' && 
                            s.row === coupleSeat.row && 
                            s._id !== coupleSeat._id &&
                            Math.abs(parseInt(s.seatNumber) - parseInt(coupleSeat.seatNumber)) === 1
                          );
                          if (pairedSeat) {
                            const min = Math.min(parseInt(coupleSeat.seatNumber), parseInt(pairedSeat.seatNumber));
                            const max = Math.max(parseInt(coupleSeat.seatNumber), parseInt(pairedSeat.seatNumber));
                            return parseInt(seatNum) >= min && parseInt(seatNum) <= max;
                          }
                          return false;
                        });

                        if (!usedNumbersSet.has(seatNum) && !isPartOfCouple) {
                          if (currentType === 'Couple') {
                            // Kiểm tra xem ghế kế tiếp có trống không
                            const nextSeatNum = String(i + 1);
                            if (i < 10 && !usedNumbersSet.has(nextSeatNum) && !isPartOfCouple) {
                              availableSeats.push({
                                label: `${displayNum} - ${currentRow === 'VIP' ? nextSeatNum : `${currentRow}${nextSeatNum}`} (Couple)`,
                                value: `${seatNum},${nextSeatNum}`, // Lưu cả 2 số ghế
                                disabled: false
                              });
                            }
                          } else {
                            availableSeats.push({
                              label: displayNum,
                              value: seatNum
                            });
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
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px', marginTop: '24px' }}>
            <Button type="primary" htmlType="submit">
              {editingSeat ? "Cập nhật" : "Thêm"}
            </Button>
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
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomsDashboard;
