import React from 'react';
import { Modal, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showApi } from '../../api/modules/show.api.js';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const DeleteShowModal = ({ isOpen, onClose, show }) => {
    const queryClient = useQueryClient();

    const deleteShowMutation = useMutation({
        mutationFn: async (showId) => {
            console.log('Deleting show:', showId);
            const result = await showApi.deleteMovieFromTheater(showId);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['theaterShows']);
            message.success('Xóa lịch chiếu thành công!');
            onClose();
        },
        onError: (error) => {
            console.error('Delete show error:', error);
            message.error('Có lỗi xảy ra khi xóa lịch chiếu!');
        }
    });

    const handleOk = async () => {
        if (!show?._id) {
            message.error('Không tìm thấy ID lịch chiếu!');
            return;
        }
        await deleteShowMutation.mutateAsync(show._id);
    };

    return (
        <Modal
            title={
                <div className="flex items-center gap-2 text-xl font-bold text-red-500">
                    <ExclamationCircleOutlined className="text-2xl" />
                    Xác nhận xóa lịch chiếu
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            okText="Xóa"
            cancelText="Hủy bỏ"
            okButtonProps={{ 
                danger: true,
                loading: deleteShowMutation.isLoading,
                className: "bg-red-500 hover:bg-red-600 text-white font-semibold px-6"
            }}
            cancelButtonProps={{
                className: "border-gray-300 hover:border-gray-400 font-semibold px-6"
            }}
            onOk={handleOk}
            className="select-none"
            maskClosable={false}
            centered
        >
            <div className="py-4 space-y-4">
                <p className="text-lg">
                    Bạn có chắc chắn muốn xóa lịch chiếu phim "
                    <span className="font-semibold text-orange-500">
                        {show?.movieId?.movieName}
                    </span>
                    "?
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-700 flex items-center gap-2">
                        <ExclamationCircleOutlined className="text-yellow-500" />
                        Lịch chiếu đã xóa không thể khôi phục.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteShowModal;