import React from 'react';
import { Modal, Form, DatePicker, TimePicker, Select, message } from 'antd';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { showApi } from '../../api/modules/show.api.js';
import { roomApi } from '../../api/modules/room.api.js';
import { theaterApi } from '../../api/modules/theater.api.js';
import { useSelector } from "react-redux";
import dayjs from 'dayjs';

const EditShowModal = ({ isOpen, onClose, show }) => {
    const [form] = Form.useForm();
    const queryClient = useQueryClient();
    const { user } = useSelector((state) => state.auth);
     const { data, isLoading } = useQuery({
        queryKey: ["theater-rooms", user?._id],
        queryFn: async () => {
            const theater = await theaterApi.getTheaterByManagerId(user?._id);
            if (theater?._id) {
                const rooms = await roomApi.getRoomsByTheater(theater._id);
                return { theater, rooms };
            }
            return { theater: null, rooms: [] };
        },
        enabled: !!user?._id
    });

    const { theater, rooms } = data || {};
    
    // Initialize form with show data
    React.useEffect(() => {
        console.log('Show data:', {
            show,
            theaterId: show?.theaterId?._id,
            theaterName: show?.theaterId?.theaterName,
            roomId: show?.roomId?._id,
            startTime: show?.startTime
        });

        if (show) {
            const startTime = dayjs(show.startTime);
            form.setFieldsValue({
                roomId: show.roomId?._id,
                date: startTime,
                time: startTime,
            });
        }
    }, [show, form]);

    const editShowMutation = useMutation({
        mutationFn: async (values) => {
            const startTime = new Date(values.date);
            startTime.setHours(values.time.hour(), values.time.minute());
            
            const endTime = new Date(startTime);
            const duration = show.movieId.duration || 120;
            endTime.setMinutes(endTime.getMinutes() + duration);

            const updateData = {
                roomId: values.roomId,
                roomNumber: values.roomId.roomNumber,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString()
            };

            console.log('Updating show with data:', updateData);
            return showApi.updateShow(show._id, updateData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['theaterShows']);
            message.success('Cập nhật lịch chiếu thành công!');
            onClose();
            form.resetFields();
        },
        onError: (error) => {
            console.error('Update show error:', error);
            message.error('Có lỗi xảy ra khi cập nhật lịch chiếu!');
        }
    });

    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            await editShowMutation.mutateAsync(values);
        } catch (error) {
            console.error('Form validation failed:', error);
        }
    };

    return (
        <Modal
            title={
                <div className="text-xl font-bold text-blue-600">
                    Cập nhật lịch chiếu - {show?.movieId?.movieName}
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            onOk={handleOk}
            okText="Cập nhật"
            cancelText="Hủy bỏ"
            okButtonProps={{
                className: "bg-blue-500 hover:bg-blue-600 text-white border-none",
                loading: editShowMutation.isLoading
            }}
            cancelButtonProps={{
                className: "border-gray-300 hover:border-gray-400"
            }}
            centered
            maskClosable={false}
            className="select-none"
            width={500}
        >
            <Form
                form={form}
                layout="vertical"
                className="mt-4"
            >
                <div className="space-y-4">
                    <Form.Item
                        name="roomId"
                        label="Phòng chiếu"
                        rules={[{ required: true, message: 'Vui lòng chọn phòng!' }]}
                    >
                        <Select 
                            placeholder="Chọn phòng" 
                            className="w-full"
                            loading={isLoading}
                        >
                            {rooms?.map(room => (
                                <Select.Option key={room._id} value={room._id}>
                                    Phòng {room.roomNumber}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="date"
                        label="Ngày chiếu"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày chiếu!' }]}
                    >
                        <DatePicker 
                            className="w-full" 
                            format="DD/MM/YYYY"
                            disabledDate={current => current && current < dayjs().startOf('day')}
                        />
                    </Form.Item>

                    <Form.Item
                        name="time"
                        label="Giờ chiếu"
                        rules={[{ required: true, message: 'Vui lòng chọn giờ chiếu!' }]}
                    >
                        <TimePicker 
                            className="w-full" 
                            format="HH:mm"
                            minuteStep={5}
                        />
                    </Form.Item>

                    <div className="mt-4 p-4 bg-gray-50 rounded-lg space-y-2">
                        <p className="text-gray-600">
                            Rạp: <span className="font-semibold text-blue-600">
                                {show?.theaterId?.theaterName}
                            </span>
                        </p>
                        <p className="text-gray-600">
                            Phim: <span className="font-semibold text-blue-600">
                                {show?.movieId?.movieName}
                            </span>
                        </p>
                        <p className="text-gray-600">
                            Thời lượng: <span className="font-semibold text-blue-600">
                                {show?.movieId?.duration} phút
                            </span>
                        </p>
                    </div>
                </div>
            </Form>
        </Modal>
    );
};

export default EditShowModal;