import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message } from 'antd';
import 'antd/dist/reset.css'; // Import Ant Design styles

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { theaterApi } from '../../../api/modules/theater.api';
import { theaterSystemApi } from '../../../api/modules/theaterSystem.api';

const { Option } = Select;
const { TextArea } = Input;

// This is the main App component that contains all the logic and UI
const TheaterManager = () => {

    const queryClient = useQueryClient();

    const [users, setUsers] = useState([
        {
            id: 'user-1',
            email: 'manager1@example.com',
            userName: 'Alice Smith',
            password: 'hashedpassword1',
            role: 'theater-manager',
            isDeleted: false,
            isVerified: true,
            verifyKey: null,
            verifyKeyExpires: null,
            resetToken: null,
            resetTokenExpires: null,
        },
        {
            id: 'user-2',
            email: 'manager2@example.com',
            userName: 'Bob Johnson',
            password: 'hashedpassword2',
            role: 'theater-manager',
            isDeleted: false,
            isVerified: true,
            verifyKey: null,
            verifyKeyExpires: null,
            resetToken: null,
            resetTokenExpires: null,
        },
        {
            id: 'user-3',
            email: 'admin@example.com',
            userName: 'Charlie Brown',
            password: 'hashedpassword3',
            role: 'admin',
            isDeleted: false,
            isVerified: true,
            verifyKey: null,
            verifyKeyExpires: null,
            resetToken: null,
            resetTokenExpires: null,
        },
        {
            id: 'user-4',
            email: 'customer@example.com',
            userName: 'Diana Prince',
            password: 'hashedpassword4',
            role: 'customer',
            isDeleted: false,
            isVerified: true,
            verifyKey: null,
            verifyKeyExpires: null,
            resetToken: null,
            resetTokenExpires: null,
        },
        {
            id: 'user-5',
            email: 'unverified@example.com',
            userName: 'Eve Adams',
            password: 'hashedpassword5',
            role: 'theater-manager',
            isDeleted: false,
            isVerified: false,
            verifyKey: 'somekey',
            verifyKeyExpires: new Date(Date.now() + 3600000),
            resetToken: null,
            resetTokenExpires: null,
        },
    ]);

    const [theaters, setTheaters] = useState([
        { id: '1', theaterName: 'Galaxy Cinema 1', location: '123 Main St', theaterSystemId: 'sys-1', managerId: 'user-1', isDeleted: false },
        { id: '2', theaterName: 'Star Theater 2', location: '456 Elm St', theaterSystemId: null, managerId: null, isDeleted: false },
        { id: '3', theaterName: 'Grand Plex', location: '789 Oak Ave', theaterSystemId: 'sys-2', managerId: 'user-2', isDeleted: false },
        { id: '4', theaterName: 'Metro Cinema', location: '101 Pine St', theaterSystemId: 'sys-1', managerId: 'user-5', isDeleted: false },
    ]);

    const [theaterSystems, setTheaterSystems] = useState([
        { id: 'sys-1', name: 'AMC Theatres', code: 'AMC', logo: 'https://placehold.co/50x50/cccccc/333333?text=AMC', description: 'Major theater chain.' },
        { id: 'sys-2', name: 'Regal Cinemas', code: 'REG', logo: 'https://placehold.co/50x50/cccccc/333333?text=REG', description: 'Another large theater chain.' },
    ]);

    // --- State for Create form inputs ---
    const [newTheaterForm] = Form.useForm();
    const [newSystemForm] = Form.useForm();

    // --- State for Edit/Details modals ---
    const [showTheaterModal, setShowTheaterModal] = useState(false);
    const [showSystemModal, setShowSystemModal] = useState(false);
    const [currentTheater, setCurrentTheater] = useState(null);
    const [currentSystem, setCurrentSystem] = useState(null);
    const [theaterModalForm] = Form.useForm();
    const [systemModalForm] = Form.useForm();


    // --- Helper Functions ---
    const getSystemName = (systemId) => {
        const system = theaterSystems.find(sys => sys.id === systemId);
        return system ? system.name : 'Unassigned';
    };

    const getManagerEmail = (managerId) => {
        const manager = users.find(user => user.id === managerId);
        return manager ? manager.email : 'Unassigned';
    };

    const getManagerIdByEmail = (email) => {
        const manager = users.find(user => user.email === email && user.role === 'theater-manager' && !user.isDeleted);
        return manager ? manager.id : null;
    };

    const getFilteredTheaters = () => theaters.filter(t => !t.isDeleted);

    // --- CRUD Functions for Theaters ---
    const handleCreateTheater = (values) => {
        const managerId = values.managerEmail ? getManagerIdByEmail(values.managerEmail) : null;
        const newTheater = {
            id: `t-${Date.now()}`,
            theaterName: values.theaterName,
            location: values.location,
            theaterSystemId: null,
            managerId: managerId,
            isDeleted: false,
        };
        setTheaters([...theaters, newTheater]);
        newTheaterForm.resetFields();
        message.success('Theater created successfully!');
    };

    const handleUpdateTheater = (values) => {
        const managerId = values.managerEmail ? getManagerIdByEmail(values.managerEmail) : null;
        const updatedTheater = {
            ...currentTheater,
            theaterName: values.theaterName,
            location: values.location,
            theaterSystemId: values.theaterSystemId || null,
            managerId: managerId,
        };
        setTheaters(theaters.map(t => (t.id === updatedTheater.id ? updatedTheater : t)));
        setShowTheaterModal(false);
        message.success('Theater updated successfully!');
    };

    const handleDeleteTheater = (theaterId) => {
        setTheaters(theaters.map(t => (t.id === theaterId ? { ...t, isDeleted: true } : t)));
        message.success('Theater deleted successfully!');
    };

    // --- CRUD Functions for Theater Systems ---
    const handleCreateSystem = (values) => {
        const newSystem = {
            id: `sys-${Date.now()}`,
            name: values.name,
            code: values.code,
            logo: values.logo || 'https://example.com/default-logo.png',
            description: values.description || 'No description available.',
        };
        setTheaterSystems([...theaterSystems, newSystem]);
        newSystemForm.resetFields();
        message.success('Theater System created successfully!');
    };

    const handleUpdateSystem = (values) => {
        const updatedSystem = {
            ...currentSystem,
            name: values.name,
            code: values.code,
            logo: values.logo,
            description: values.description,
        };
        setTheaterSystems(theaterSystems.map(s => (s.id === updatedSystem.id ? updatedSystem : s)));
        setShowSystemModal(false);
        message.success('Theater System updated successfully!');
    };

    const handleDeleteSystem = (systemId) => {
        setTheaters(theaters.map(t => (t.theaterSystemId === systemId ? { ...t, theaterSystemId: null } : t)));
        setTheaterSystems(theaterSystems.filter(s => s.id !== systemId));
        message.success('Theater System deleted successfully!');
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
            render: (_, record) => getSystemName(record.theaterSystemId),
        },
        {
            title: 'Manager Email',
            key: 'managerId',
            render: (_, record) => getManagerEmail(record.managerId),
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
                                theaterSystemId: record.theaterSystemId,
                                managerEmail: getManagerEmail(record.managerId) === 'Unassigned' ? '' : getManagerEmail(record.managerId),
                            });
                            setShowTheaterModal(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Popconfirm
                        title="Are you sure to delete this theater?"
                        onConfirm={() => handleDeleteTheater(record.id)}
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
                        onConfirm={() => handleDeleteSystem(record.id)}
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
                            <Button type="primary" htmlType="submit" className="w-full">
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
                            <Button type="primary" htmlType="submit" className="w-full bg-green-600 hover:bg-green-700">
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
                    dataSource={getFilteredTheaters()}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    className="w-full"
                />
            </div>

            {/* Theater Systems Table Section */}
            <div className="w-full max-w-6xl mt-8 mb-12 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Theater Systems</h2>
                <Table
                    columns={systemColumns}
                    dataSource={theaterSystems}
                    rowKey="id"
                    pagination={{ pageSize: 5 }}
                    className="w-full"
                />
            </div>

            {/* Theater Edit Modal */}
            <Modal
                title={`Edit Theater: ${currentTheater?.theaterName}`}
                open={showTheaterModal}
                onCancel={() => setShowTheaterModal(false)}
                footer={null}
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
                            {theaterSystems.map(system => (
                                <Option key={system.id} value={system.id}>{system.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>
                    <Form.Item
                        label="Manager Email"
                        name="managerEmail"
                        rules={[{ type: 'email', message: 'Please enter a valid email!' }]}
                        help={
                            theaterModalForm.getFieldValue('managerEmail') &&
                            getManagerIdByEmail(theaterModalForm.getFieldValue('managerEmail')) === null &&
                            "Manager email not found or not a valid 'theater-manager' role. Will be unassigned."
                        }
                        validateStatus={
                            theaterModalForm.getFieldValue('managerEmail') &&
                                getManagerIdByEmail(theaterModalForm.getFieldValue('managerEmail')) === null
                                ? 'warning'
                                : ''
                        }
                    >
                        <Input placeholder="manager@example.com (leave empty for unassigned)" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" className="w-full">
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
                        <Button type="primary" htmlType="submit" className="w-full">
                            Save Changes
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default TheaterManager;
