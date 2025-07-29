import React from 'react';
import { Modal, message } from 'antd';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showApi } from '../../api/modules/show.api.js';
import { ExclamationCircleOutlined } from '@ant-design/icons';

const DeleteMovieModal = ({ isOpen, onClose, movieId, movieName, theaterShows }) => {
    const queryClient = useQueryClient();

    console.log('DeleteMovieModal rendered with:', { 
        movieId, 
        movieName, 
        showsCount: theaterShows?.length 
    });

    const removeMovieMutation = useMutation({
        mutationFn: async (id) => {
            console.log('mutationFn called with id:', id);
            
            if (!id) {
                console.error('No movie ID provided to mutationFn');
                throw new Error('No movie ID provided');
            }

            const relevantShows = theaterShows?.filter(show => 
                show.movieId._id === id || show.movieId === id
            );
            
            console.log('Found shows to delete:', relevantShows);

            if (!relevantShows?.length) {
                console.log('No shows to delete, returning early');
                return true;
            }

            console.log('Starting to delete shows...');
            const deletePromises = relevantShows.map(show => {
                console.log('Deleting show:', show._id);
                return showApi.deleteMovieFromTheater(show._id);
            });

            const results = await Promise.all(deletePromises);
            console.log('Delete results:', results);
            return true;
        },
        onMutate: (variables) => {
            console.log('onMutate called with:', variables);
        },
        onSuccess: (data, variables) => {
            console.log('Mutation succeeded:', { data, variables });
            queryClient.invalidateQueries(["theaterShows"]);
            queryClient.invalidateQueries(["theaterMovies"]);
            message.success("Xóa phim khỏi rạp thành công!");
            onClose();
        },
        onError: (error, variables) => {
            console.error('Mutation failed:', { error, variables });
            message.error("Có lỗi xảy ra khi xóa phim khỏi rạp!");
        }
    });

    const handleOk = React.useCallback(async () => {
        console.log('handleOk called, movieId:', movieId);
        
        if (!movieId) {
            console.error('No movieId available in handleOk');
            message.error("Không tìm thấy ID phim!");
            return;
        }

        try {
            console.log('Attempting to mutate with movieId:', movieId);
            await removeMovieMutation.mutateAsync(movieId);
        } catch (error) {
            console.error('Mutation error in handleOk:', error);
            message.error("Có lỗi xảy ra khi xóa phim!");
        }
    }, [movieId, removeMovieMutation]);

    return (
        <Modal
            title={
                <div className="flex items-center gap-2 text-xl font-bold text-red-500">
                    <ExclamationCircleOutlined className="text-2xl" />
                    Xác nhận xóa phim
                </div>
            }
            open={isOpen}
            onCancel={onClose}
            okText="Xóa phim"
            cancelText="Hủy bỏ"
            okButtonProps={{ 
                danger: true,
                loading: removeMovieMutation.isLoading,
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
                    Bạn có chắc chắn muốn xóa phim "
                    <span className="font-semibold text-orange-500">{movieName}</span>
                    " khỏi rạp?
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p className="text-yellow-700 flex items-center gap-2">
                        <ExclamationCircleOutlined className="text-yellow-500" />
                        Lưu ý: Tất cả lịch chiếu của phim sẽ bị xóa vĩnh viễn và không thể khôi phục.
                    </p>
                </div>
            </div>
        </Modal>
    );
};

export default DeleteMovieModal;