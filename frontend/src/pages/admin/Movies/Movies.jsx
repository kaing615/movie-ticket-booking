import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    Select,
    DatePicker,
    Space,
    Popconfirm,
    message,
    Spin,
    Alert,
    Tag,
    Upload,
} from 'antd';
import {
    EditOutlined,
    DeleteOutlined,
    PlusOutlined,
    UploadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { movieApi } from '../../../api/modules/movie.api'; // Adjust the import path as needed

const { Option } = Select;
const { TextArea } = Input;



// MovieAdminPanel component
function MovieAdminPanel() {
    const queryClient = useQueryClient();
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingMovie, setEditingMovie] = useState(null);
    const [form] = Form.useForm();

    // Fetch movies using useQuery
    const { data: movies, isLoading, isError, error } = useQuery({
        queryKey: ['movies'],
        queryFn: movieApi.getMovies,
    });

    // Mutation for creating a movie
    const createMovieMutation = useMutation({
        mutationFn: movieApi.createMovie,
        onSuccess: () => {
            queryClient.invalidateQueries(['movies']); // Invalidate cache to refetch movies
            message.success('Movie created successfully!');
            setIsModalVisible(false);
            form.resetFields();
        },
        onError: (err) => {
            message.error(`Failed to create movie: ${err.message}`);
            console.error("Create movie error:", err);
        },
    });

    // Mutation for updating a movie
    const updateMovieMutation = useMutation({
        mutationFn: ({ id, data }) => movieApi.updateMovie(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['movies']); // Invalidate cache to refetch movies
            message.success('Movie updated successfully!');
            setIsModalVisible(false);
            form.resetFields();
            setEditingMovie(null);
        },
        onError: (err) => {
            message.error(`Failed to update movie: ${err.message}`);
            console.error("Update movie error:", err);
        },
    });

    // Mutation for deleting a movie
    const deleteMovieMutation = useMutation({
        mutationFn: movieApi.deleteMovie,
        onSuccess: () => {
            queryClient.invalidateQueries(['movies']); // Invalidate cache to refetch movies
            message.success('Movie deleted successfully!');
        },
        onError: (err) => {
            message.error(`Failed to delete movie: ${err.message}`);
            console.error("Delete movie error:", err);
        },
    });

    // Handle opening the create/edit modal
    const showModal = (movie = null) => {
        setEditingMovie(movie);
        if (movie) {
            form.setFieldsValue({
                ...movie,
                releaseDate: movie.releaseDate ? dayjs(movie.releaseDate) : null,
                allowedShowStart: movie.allowedShowStart ? dayjs(movie.allowedShowStart) : null,
                // For genres, ensure it's an array of strings
                genres: Array.isArray(movie.genres) ? movie.genres : (movie.genres ? [movie.genres] : []),
            });
        } else {
            form.resetFields();
        }
        setIsModalVisible(true);
    };

    // Handle modal submission
    const handleOk = async () => {
        try {
            const values = await form.validateFields();
            const movieData = {
                ...values,
                releaseDate: values.releaseDate ? values.releaseDate.toISOString() : null,
                allowedShowStart: values.allowedShowStart ? values.allowedShowStart.toISOString() : null,
            };

            if (editingMovie) {
                updateMovieMutation.mutate({ id: editingMovie.movieId, data: movieData });
            } else {
                createMovieMutation.mutate(movieData);
            }
        } catch (info) {
            console.log('Validate Failed:', info);
        }
    };

    // Handle modal cancellation
    const handleCancel = () => {
        setIsModalVisible(false);
        setEditingMovie(null);
        form.resetFields();
    };

    // Table columns definition
    const columns = [
        {
            title: 'Movie Name',
            dataIndex: 'movieName',
            key: 'movieName',
            sorter: (a, b) => a.movieName.localeCompare(b.movieName),
            className: 'font-semibold',
        },
        {
            title: 'Genres',
            dataIndex: 'genres',
            key: 'genres',
            render: (genres) => (
                <Space wrap>
                    {genres?.map((genre) => (
                        <Tag color="blue" key={genre}>{genre}</Tag>
                    ))}
                </Space>
            ),
        },
        {
            title: 'Duration (min)',
            dataIndex: 'duration',
            key: 'duration',
            sorter: (a, b) => a.duration - b.duration,
        },
        {
            title: 'Release Date',
            dataIndex: 'releaseDate',
            key: 'releaseDate',
            render: (date) => dayjs(date).format('YYYY-MM-DD'),
            sorter: (a, b) => new Date(a.releaseDate) - new Date(b.releaseDate),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                let color = '';
                if (status === 'coming') color = 'gold';
                else if (status === 'showing') color = 'green';
                else if (status === 'ended') color = 'red';
                return <Tag color={color}>{status.toUpperCase()}</Tag>;
            },
            filters: [
                { text: 'Coming', value: 'coming' },
                { text: 'Showing', value: 'showing' },
                { text: 'Ended', value: 'ended' },
            ],
            onFilter: (value, record) => record.status.indexOf(value) === 0,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        icon={<EditOutlined />}
                        onClick={() => showModal(record)}
                        className="bg-blue-500 text-white hover:bg-blue-600 rounded-md"
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure to delete this movie?"
                        onConfirm={() => deleteMovieMutation.mutate(record.movieId)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            icon={<DeleteOutlined />}
                            danger
                            className="rounded-md"
                        >
                            Delete
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Spin size="large" tip="Loading Movies..." />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Alert
                    message="Error"
                    description={`Failed to load movies: ${error.message}`}
                    type="error"
                    showIcon
                    className="w-full max-w-md rounded-lg shadow-lg"
                />
            </div>
        );
    }

    return (
        <div className="container mx-auto pt-6 pl-4">
            <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">Movie Admin Panel</h1>

            <div className="mb-6 flex justify-end">
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => showModal()}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md shadow-md"
                >
                    Add New Movie
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={movies}
                rowKey="movieId"
                pagination={{ pageSize: 10 }}
                className="rounded-lg overflow-hidden shadow-md"
                bordered
            />

            <Modal
                title={editingMovie ? 'Edit Movie' : 'Add New Movie'}
                open={isModalVisible}
                onOk={handleOk}
                onCancel={handleCancel}
                confirmLoading={createMovieMutation.isLoading || updateMovieMutation.isLoading}
                width={800}
                okText={editingMovie ? 'Update' : 'Create'}
                cancelText="Cancel"
                className="rounded-lg"
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="movie_form"
                    initialValues={{
                        genres: [],
                        movieRating: 'P',
                        status: 'coming',
                    }}
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Form.Item
                            name="movieName"
                            label="Movie Name"
                            rules={[{ required: true, message: 'Please enter movie name!' }]}
                        >
                            <Input placeholder="Enter movie name" className="rounded-md" />
                        </Form.Item>
                        <Form.Item
                            name="director"
                            label="Director"
                            rules={[{ required: true, message: 'Please enter director name!' }]}
                        >
                            <Input placeholder="Enter director name" className="rounded-md" />
                        </Form.Item>
                        <Form.Item
                            name="duration"
                            label="Duration (minutes)"
                            rules={[{ required: true, message: 'Please enter duration!' }]}
                        >
                            <Input type="number" placeholder="Enter duration" className="rounded-md" />
                        </Form.Item>
                        <Form.Item
                            name="country"
                            label="Country"
                            rules={[{ required: true, message: 'Please enter country!' }]}
                        >
                            <Input placeholder="Enter country" className="rounded-md" />
                        </Form.Item>
                        <Form.Item
                            name="releaseDate"
                            label="Release Date"
                            rules={[{ required: true, message: 'Please select release date!' }]}
                        >
                            <DatePicker format="YYYY-MM-DD" className="w-full rounded-md" />
                        </Form.Item>
                        <Form.Item
                            name="allowedShowStart"
                            label="Allowed Show Start Date"
                            rules={[{ required: true, message: 'Please select allowed show start date!' }]}
                        >
                            <DatePicker format="YYYY-MM-DD" className="w-full rounded-md" />
                        </Form.Item>
                        <Form.Item
                            name="genres"
                            label="Genres"
                            rules={[{ required: true, message: 'Please select genres!' }]}
                        >
                            <Select
                                mode="tags"
                                placeholder="Select or type genres"
                                className="rounded-md"
                            >
                                {/* You can pre-populate common genres here or let users type */}
                                <Option value="Action">Action</Option>
                                <Option value="Comedy">Comedy</Option>
                                <Option value="Drama">Drama</Option>
                                <Option value="Sci-Fi">Sci-Fi</Option>
                                <Option value="Thriller">Thriller</Option>
                                <Option value="Horror">Horror</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="movieRating"
                            label="Movie Rating"
                            rules={[{ required: true, message: 'Please select movie rating!' }]}
                        >
                            <Select placeholder="Select rating" className="rounded-md">
                                <Option value="P">P (Phổ biến)</Option>
                                <Option value="K">K (Khuyến khích)</Option>
                                <Option value="T13">T13 (Trên 13 tuổi)</Option>
                                <Option value="T16">T16 (Trên 16 tuổi)</Option>
                                <Option value="T18">T18 (Trên 18 tuổi)</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="status"
                            label="Status"
                            rules={[{ required: true, message: 'Please select status!' }]}
                        >
                            <Select placeholder="Select status" className="rounded-md">
                                <Option value="coming">Coming</Option>
                                <Option value="showing">Showing</Option>
                                <Option value="ended">Ended</Option>
                            </Select>
                        </Form.Item>
                        <Form.Item
                            name="poster"
                            label="Poster URL"
                            rules={[{ required: true, message: 'Please enter poster URL!' }]}
                        >
                            <Input placeholder="Enter poster URL" className="rounded-md" />
                        </Form.Item>
                        <Form.Item
                            name="banner"
                            label="Banner URL"
                            rules={[{ required: true, message: 'Please enter banner URL!' }]}
                        >
                            <Input placeholder="Enter banner URL" className="rounded-md" />
                        </Form.Item>
                        <Form.Item
                            name="trailer"
                            label="Trailer URL"
                            rules={[{ required: true, message: 'Please enter trailer URL!' }]}
                        >
                            <Input placeholder="Enter trailer URL" className="rounded-md" />
                        </Form.Item>
                    </div>
                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[{ required: true, message: 'Please enter description!' }]}
                    >
                        <TextArea rows={4} placeholder="Enter movie description" className="rounded-md" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default MovieAdminPanel;