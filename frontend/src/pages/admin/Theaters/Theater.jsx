import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message, Spin } from 'antd';
import 'antd/dist/reset.css'; // Import Ant Design styles
import { QueryClient, QueryClientProvider, useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Assuming these paths are correct relative to your App.js
import { theaterApi } from '../../../api/modules/theater.api';
import { theaterSystemApi } from '../../../api/modules/theaterSystem.api';

const { Option } = Select;
const { TextArea } = Input;

// Create a client
const queryClient = new QueryClient();

// This is the main App component that contains all the logic and UI
const TheaterAdminPanel = () => {
    const queryClientHook = useQueryClient(); // Use queryClientHook to invalidate queries

    // --- Fetching Data with useQuery ---
    // Fetch all theaters
    const { data: theaters, isLoading: isLoadingTheaters, isError: isErrorTheaters } = useQuery({
        queryKey: ['theaters'],
        queryFn: () => theaterApi.getTheater(), // No systemId for all theaters
        select: (data) => data.filter(t => !t.isDeleted), // Filter out soft-deleted theaters on the frontend
    });

    // Fetch all theater systems
    const { data: theaterSystems, isLoading: isLoadingSystems, isError: isErrorSystems } = useQuery({
        queryKey: ['theaterSystems'],
        queryFn: theaterSystemApi.getAllTheaterSystems,
    });

    // --- State for Modals and Forms ---
    const [newTheaterForm] = Form.useForm();
    const [newSystemForm] = Form.useForm();
    const [showTheaterModal, setShowTheaterModal] = useState(false);
    const [showSystemModal, setShowSystemModal] = useState(false);
    const [currentTheater, setCurrentTheater] = useState(null);
    const [currentSystem, setCurrentSystem] = useState(null);
    const [theaterModalForm] = Form.useForm();
    const [systemModalForm] = Form.useForm();

    // --- Helper Functions ---
    const getSystemName = (systemId) => {
        const system = theaterSystems?.find(sys => sys._id === systemId); // Use _id from MongoDB
        return system ? system.name : 'Unassigned';
    };

    // This helper assumes that the backend's getTheater endpoint populates managerId with user details
    // including email. If not, you might need a separate query for user details.
    const getManagerEmail = (manager) => {
        return manager?.email || 'Unassigned';
    };

    // --- Mutations for Theaters ---
    const createTheaterMutation = useMutation({
        mutationFn: theaterApi.createTheater,
        onSuccess: () => {
            queryClientHook.invalidateQueries(['theaters']);
            newTheaterForm.resetFields();
            message.success('Theater created successfully!');
        },
        onError: (error) => {
            message.error(`Failed to create theater: ${error.response?.data?.message || error.message}`);
        },
    });

    const updateTheaterMutation = useMutation({
        mutationFn: ({ theaterId, data }) => theaterApi.updateTheater(theaterId, data),
        onSuccess: () => {
            queryClientHook.invalidateQueries(['theaters']);
            setShowTheaterModal(false);
            message.success('Theater updated successfully!');
        },
        onError: (error) => {
            message.error(`Failed to update theater: ${error.response?.data?.message || error.message}`);
        },
    });

    const deleteTheaterMutation = useMutation({
        mutationFn: theaterApi.deleteTheater,
        onSuccess: () => {
            queryClientHook.invalidateQueries(['theaters']);
            message.success('Theater deleted successfully!');
        },
        onError: (error) => {
            message.error(`Failed to delete theater: ${error.response?.data?.message || error.message}`);
        },
    });

    // --- Mutations for Theater Systems ---
    const createSystemMutation = useMutation({
        mutationFn: theaterSystemApi.createTheaterSystem,
        onSuccess: () => {
            queryClientHook.invalidateQueries(['theaterSystems']);
            newSystemForm.resetFields();
            message.success('Theater System created successfully!');
        },
        onError: (error) => {
            message.error(`Failed to create theater system: ${error.response?.data?.message || error.message}`);
        },
    });

    const updateSystemMutation = useMutation({
        mutationFn: ({ systemId, data }) => theaterSystemApi.updateTheaterSystem(systemId, data),
        onSuccess: () => {
            queryClientHook.invalidateQueries(['theaterSystems']);
            setShowSystemModal(false);
            message.success('Theater System updated successfully!');
        },
        onError: (error) => {
            message.error(`Failed to update theater system: ${error.response?.data?.message || error.message}`);
        },
    });

    const deleteSystemMutation = useMutation({
        mutationFn: theaterSystemApi.deleteTheaterSystem,
        onSuccess: () => {
            queryClientHook.invalidateQueries(['theaterSystems']);
            queryClientHook.invalidateQueries(['theaters']); // Theaters might be unassigned
            message.success('Theater System deleted successfully!');
        },
        onError: (error) => {
            message.error(`Failed to delete theater system: ${error.response?.data?.message || error.message}`);
        },
    });

    // --- Handlers for Forms and Modals ---
    const handleCreateTheater = (values) => {
        const selectedSystemCode = values.theaterSystemId ? theaterSystems.find(s => s._id === values.theaterSystemId)?.code : null;
        createTheaterMutation.mutate({
            theaterName: values.theaterName,
            location: values.location,
            managerEmail: values.managerEmail || null, // Send null if empty
            theaterSystemCode: selectedSystemCode, // Send code to backend
        });
    };

    const handleUpdateTheater = (values) => {
        console.log('handleUpdateTheater called with values:', values);
        updateTheaterMutation.mutate({
            theaterId: currentTheater._id, // Use _id from MongoDB
            data: values,
        });
    };

    const handleCreateSystem = (values) => {
        createSystemMutation.mutate(values);
    };

    const handleUpdateSystem = (values) => {
        updateSystemMutation.mutate({
            systemId: currentSystem._id, // Use _id from MongoDB
            data: values,
        });
    };

    // --- Table Columns Definition ---
    const theaterColumns = [
        {
            title: 'Theater Name',
            dataIndex: 'theaterName',
            key: 'theaterName',
        },
        {
            title: 'Location',
            dataIndex: 'location',
            key: 'location',
        },
        {
            title: 'Assigned System',
            key: 'theaterSystemId',
            render: (_, record) => getSystemName(record.theaterSystemId?._id || record.theaterSystemId), // Handle populated or just ID
        },
        {
            title: 'Manager Email',
            key: 'managerId',
            render: (_, record) => getManagerEmail(record.managerId), // Assumes managerId is populated with email
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="flex space-x-2">
                    <Button
                        type="link"
                        onClick={() => {
                            setCurrentTheater(record);
                            theaterModalForm.setFieldsValue({
                                theaterName: record.theaterName,
                                location: record.location,
                                theaterSystemId: record.theaterSystemId?._id || record.theaterSystemId, // Set ID for select
                                managerEmail: getManagerEmail(record.managerId) === 'Unassigned' ? '' : getManagerEmail(record.managerId),
                            });
                            setShowTheaterModal(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure to delete this theater?"
                        onConfirm={() => deleteTheaterMutation.mutate(record._id)} // Use _id for deletion
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    const systemColumns = [
        {
            title: 'Logo',
            dataIndex: 'logo',
            key: 'logo',
            render: (text) => <img src={text} alt="Logo" className="h-10 w-10 object-contain rounded-lg" />,
        },
        {
            title: 'System Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Code',
            dataIndex: 'code',
            key: 'code',
        },
        {
            title: 'Description',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_, record) => (
                <div className="flex space-x-2">
                    <Button
                        type="link"
                        onClick={() => {
                            setCurrentSystem(record);
                            systemModalForm.setFieldsValue(record);
                            setShowSystemModal(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure to delete this theater system? All associated theaters will be unassigned."
                        onConfirm={() => deleteSystemMutation.mutate(record._id)} // Use _id for deletion
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button type="link" danger>
                            Delete
                        </Button>
                    </Popconfirm>
                </div>
            ),
        },
    ];

    if (isLoadingTheaters || isLoadingSystems) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Spin size="large" tip="Loading data..." />
            </div>
        );
    }

    if (isErrorTheaters || isErrorSystems) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-600 font-bold text-xl">
                Error loading data. Please check your backend server and API paths.
            </div>
        );
    }

    // --- Main Render Function ---
    return (
        <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
            {/* Header */}
            <div className="w-full max-w-6xl text-center my-8">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">
                    Theater Management Dashboard
                </h1>
                <p className="text-lg text-gray-600 mt-2">
                    Administrator page for managing theaters and theater systems with full CRUD.
                </p>
            </div>

            <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Create Theater Section */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Theater</h2>
                    <Form form={newTheaterForm} layout="vertical" onFinish={handleCreateTheater}>
                        <Form.Item
                            label="Theater Name"
                            name="theaterName"
                            rules={[{ required: true, message: 'Please input the theater name!' }]}
                        >
                            <Input placeholder="Theater Name" />
                        </Form.Item>
                        <Form.Item
                            label="Location"
                            name="location"
                            rules={[{ required: true, message: 'Please input the location!' }]}
                        >
                            <Input placeholder="Location" />
                        </Form.Item>
                        <Form.Item
                            label="Manager Email (optional)"
                            name="managerEmail"
                            rules={[{ type: 'email', message: 'Please enter a valid email!' }]}
                        >
                            <Input placeholder="manager@example.com" />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="w-full" loading={createTheaterMutation.isLoading}>
                                Create Theater
                            </Button>
                        </Form.Item>
                    </Form>
                </div>

                {/* Create Theater System Section */}
                <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Theater System</h2>
                    <Form form={newSystemForm} layout="vertical" onFinish={handleCreateSystem}>
                        <Form.Item
                            label="System Name"
                            name="name"
                            rules={[{ required: true, message: 'Please input the system name!' }]}
                        >
                            <Input placeholder="System Name" />
                        </Form.Item>
                        <Form.Item
                            label="System Code"
                            name="code"
                            rules={[{ required: true, message: 'Please input the system code!' }]}
                        >
                            <Input placeholder="System Code (e.g., AMC)" />
                        </Form.Item>
                        <Form.Item label="Logo URL (optional)" name="logo">
                            <Input placeholder="https://example.com/logo.png" />
                        </Form.Item>
                        <Form.Item label="Description (optional)" name="description">
                            <TextArea rows={3} placeholder="No description available." />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" className="w-full bg-green-600 hover:bg-green-700" loading={createSystemMutation.isLoading}>
                                Create System
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
            </div>

            {/* Theaters Table Section */}
            <div className="w-full max-w-6xl mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Theaters</h2>
                <Table
                    columns={theaterColumns}
                    dataSource={theaters}
                    rowKey="_id" // Use _id from MongoDB
                    pagination={{ pageSize: 5 }}
                    className="w-full"
                    loading={isLoadingTheaters || deleteTheaterMutation.isLoading}
                />
            </div>

            {/* Theater Systems Table Section */}
            <div className="w-full max-w-6xl mt-8 mb-12 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Theater Systems</h2>
                <Table
                    columns={systemColumns}
                    dataSource={theaterSystems}
                    rowKey="_id" // Use _id from MongoDB
                    pagination={{ pageSize: 5 }}
                    className="w-full"
                    loading={isLoadingSystems || deleteSystemMutation.isLoading}
                />
            </div>

            {/* Theater Edit Modal */}
            <Modal
                title={`Edit Theater: ${currentTheater?.theaterName}`}
                open={showTheaterModal}
                onCancel={() => setShowTheaterModal(false)}
                footer={null}
                confirmLoading={updateTheaterMutation.isLoading}
            >
                <Form form={theaterModalForm} layout="vertical" onFinish={handleUpdateTheater} initialValues={currentTheater}>
                    <Form.Item
                        label="Theater Name"
                        name="theaterName"
                        rules={[{ required: true, message: 'Please input the theater name!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Location"
                        name="location"
                        rules={[{ required: true, message: 'Please input the location!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Assigned System" name="theaterSystemId">
                        <Select placeholder="Select a system">
                            <Option value={null}>Unassigned</Option>
                            {theaterSystems?.map(system => (
                                <Option key={system._id} value={system._id}>{system.name}</Option> // Use _id for Antd Select value
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Manager Email"
                        name="managerEmail"
                        rules={[{ type: 'email', message: 'Please enter a valid email!' }]}
                    >
                        <Input placeholder="manager@example.com (leave empty for unassigned)" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full" loading={updateTheaterMutation.isLoading}>
                            Save Changes
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            {/* System Edit Modal */}
            <Modal
                title={`Edit System: ${currentSystem?.name}`}
                open={showSystemModal}
                onCancel={() => setShowSystemModal(false)}
                footer={null}
                confirmLoading={updateSystemMutation.isLoading}
            >
                <Form form={systemModalForm} layout="vertical" onFinish={handleUpdateSystem} initialValues={currentSystem}>
                    <Form.Item
                        label="System Name"
                        name="name"
                        rules={[{ required: true, message: 'Please input the system name!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="System Code"
                        name="code"
                        rules={[{ required: true, message: 'Please input the system code!' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item label="Logo URL" name="logo">
                        <Input placeholder="https://example.com/logo.png" />
                    </Form.Item>
                    <Form.Item label="Description" name="description">
                        <TextArea rows={3} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full" loading={updateSystemMutation.isLoading}>
                            Save Changes
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TheaterAdminPanel;