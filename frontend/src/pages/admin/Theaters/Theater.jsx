import React, { useMemo, useState } from 'react';
import 'antd/dist/reset.css';
import { Table, Button, Modal, Form, Input, Select, Popconfirm, message, Spin } from 'antd';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import { theaterApi } from '../../../api/modules/theater.api';
import { theaterSystemApi } from '../../../api/modules/theaterSystem.api';
import { adminManagementApi } from '../../../api/modules/admin/adminManagement.api';

const { Option } = Select;
const { TextArea } = Input;

const Theater = () => {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  // ===== Queries
  const { data: theaters, isLoading: isLoadingTheaters, isError: isErrorTheaters } = useQuery({
    queryKey: ['theaters'],
    queryFn: () => theaterApi.getTheater(),
    select: (data) => data.filter((t) => !t.isDeleted),
  });

  const { data: theaterSystems, isLoading: isLoadingSystems, isError: isErrorSystems } = useQuery({
    queryKey: ['theaterSystems'],
    queryFn: theaterSystemApi.getAllTheaterSystems,
  });

  const { data: managers, isLoading: isLoadingManagers, isError: isErrorManagers } = useQuery({
    queryKey: ['managers'],
    queryFn: adminManagementApi.getManagers,
  });

  // ===== Forms & state
  const [newTheaterForm] = Form.useForm();
  const [theaterModalForm] = Form.useForm();
  const [systemModalForm] = Form.useForm();
  const [newSystemForm] = Form.useForm();

  const [showTheaterModal, setShowTheaterModal] = useState(false);
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [currentTheater, setCurrentTheater] = useState(null);
  const [currentSystem, setCurrentSystem] = useState(null);

  // ===== Helpers (manager list)
  const managersByEmail = useMemo(() => {
    const map = new Map();
    (managers || []).forEach((u) => {
      if (!u?.email) return;
      map.set(String(u.email).trim().toLowerCase(), u);
    });
    return map;
  }, [managers]);

  const isExistingManagerEmail = (email) => {
    if (!email) return false;
    const norm = String(email).trim().toLowerCase();
    const u = managersByEmail.get(norm);
    return !!(u && u.role === 'theater-manager' && !u.isDeleted);
  };

  const getSystemName = (systemId) => {
    const sys = theaterSystems?.find((s) => s._id === systemId);
    return sys ? sys.name : 'Unassigned';
  };

  const getManagerEmail = (managerId) => {
    const u = managers?.find((m) => m._id === managerId);
    return u ? u.email : 'Unassigned';
    // (trường hợp record đã populate managerId thành object có email thì ở dưới Table đã xử lý)
  };

  // ===== Mutations
  const createTheaterMutation = useMutation({
    mutationFn: theaterApi.createTheater,
    onSuccess: () => {
      queryClient.invalidateQueries(['theaters']);
      queryClient.invalidateQueries(['managers']); // cập nhật lại danh sách manager
      newTheaterForm.resetFields();
      messageApi.success('Theater created successfully!');
    },
    onError: (e) => messageApi.error(e?.response?.data?.message || e.message || 'Create theater failed'),
  });

  const updateTheaterMutation = useMutation({
    mutationFn: ({ theaterId, data }) => theaterApi.updateTheater(theaterId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['theaters']);
      queryClient.invalidateQueries(['managers']);
      setShowTheaterModal(false);
      messageApi.success('Theater updated successfully!');
    },
    onError: (e) => messageApi.error(e?.response?.data?.message || e.message || 'Update theater failed'),
  });

  const deleteTheaterMutation = useMutation({
    mutationFn: theaterApi.deleteTheater,
    onSuccess: () => {
      queryClient.invalidateQueries(['theaters']);
      messageApi.success('Theater deleted successfully!');
    },
    onError: (e) => messageApi.error(e?.response?.data?.message || e.message || 'Delete theater failed'),
  });

  const createSystemMutation = useMutation({
    mutationFn: theaterSystemApi.createTheaterSystem,
    onSuccess: () => {
      queryClient.invalidateQueries(['theaterSystems']);
      newSystemForm.resetFields();
      messageApi.success('Theater System created successfully!');
    },
    onError: (e) => messageApi.error(e?.response?.data?.message || e.message || 'Create system failed'),
  });

  const updateSystemMutation = useMutation({
    mutationFn: ({ systemId, data }) => theaterSystemApi.updateTheaterSystem(systemId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['theaterSystems']);
      setShowSystemModal(false);
      messageApi.success('Theater System updated successfully!');
    },
    onError: (e) => messageApi.error(e?.response?.data?.message || e.message || 'Update system failed'),
  });

  const deleteSystemMutation = useMutation({
    mutationFn: theaterSystemApi.deleteTheaterSystem,
    onSuccess: () => {
      queryClient.invalidateQueries(['theaterSystems']);
      queryClient.invalidateQueries(['theaters']);
      messageApi.success('Theater System deleted successfully!');
    },
    onError: (e) => messageApi.error(e?.response?.data?.message || e.message || 'Delete system failed'),
  });

  // ===== Submit handlers
  const handleCreateTheater = (values) => {
    const selectedSystemCode = values.theaterSystemId
      ? theaterSystems.find((s) => s._id === values.theaterSystemId)?.code
      : null;

    const payload = {
      theaterName: values.theaterName,
      location: values.location,
      theaterSystemCode: selectedSystemCode,
    };

    if (values.managerEmail) {
      const exists = isExistingManagerEmail(values.managerEmail);
      payload.managerEmail = values.managerEmail;
      if (!exists) {
        // cần tạo mới manager -> yêu cầu username + password
        payload.managerUserName = values.managerUserName;
        payload.managerPassword = values.managerPassword;
      }
    }

    createTheaterMutation.mutate(payload);
  };

  const handleUpdateTheater = (values) => {
    const selectedSystemCode = values.theaterSystemId
      ? theaterSystems.find((s) => s._id === values.theaterSystemId)?.code
      : null;

    const payload = {
      theaterName: values.theaterName,
      location: values.location,
      theaterSystemCode: selectedSystemCode,
      managerEmail: values.managerEmail || null, // có thể null để unassign
    };

    // nếu là email mới (không tồn tại) thì thêm username + password
    if (values.managerEmail && !isExistingManagerEmail(values.managerEmail)) {
      payload.managerUserName = values.managerUserName;
      payload.managerPassword = values.managerPassword;
    }

    updateTheaterMutation.mutate({
      theaterId: currentTheater._id,
      data: payload,
    });
  };

  // ===== Tables
  const theaterColumns = [
    { title: 'Theater Name', dataIndex: 'theaterName', key: 'theaterName' },
    { title: 'Location', dataIndex: 'location', key: 'location' },
    {
      title: 'Assigned System',
      key: 'theaterSystemId',
      render: (_, r) => getSystemName(r.theaterSystemId?._id || r.theaterSystemId),
    },
    {
      title: 'Manager Email',
      key: 'managerId',
      render: (_, r) =>
        r.managerId?.email
          ? r.managerId.email
          : getManagerEmail(r.managerId?._id || r.managerId),
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
                theaterSystemId: record.theaterSystemId?._id || record.theaterSystemId || undefined,
                managerEmail: record.managerId?.email || getManagerEmail(record.managerId) || undefined,
                // managerUserName/Password sẽ hiển thị conditionally nếu email mới
              });
              setShowTheaterModal(true);
            }}
          >
            Edit
          </Button>
          <Popconfirm
            title="Are you sure to delete this theater?"
            onConfirm={() => deleteTheaterMutation.mutate(record._id)}
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
      render: (src) => <img src={src} alt="Logo" className="h-10 w-10 object-contain rounded-lg" />,
    },
    { title: 'System Name', dataIndex: 'name', key: 'name' },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
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
            onConfirm={() => deleteSystemMutation.mutate(record._id)}
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

  // ===== Loading / error
  if (isLoadingTheaters || isLoadingSystems || isLoadingManagers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <Spin size="large" tip="Loading data..." />
      </div>
    );
  }
  if (isErrorTheaters || isErrorSystems || isErrorManagers) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-red-600 font-bold text-xl">
        Error loading data. Please check your backend server and API paths.
      </div>
    );
  }

  // ===== Render
  return (
    <>
      {contextHolder}
      <div className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
        {/* Header */}
        <div className="w-full max-w-6xl text-center my-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800">Theater Management Dashboard</h1>
          <p className="text-lg text-gray-600 mt-2">Administrator page for managing theaters and theater systems.</p>
        </div>

        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Create Theater */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Theater</h2>
            <Form
              form={newTheaterForm}
              layout="vertical"
              onFinish={handleCreateTheater}
            >
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
                tooltip="If the email doesn’t exist, username & password will be required to create a new theater-manager."
              >
                <Input placeholder="manager@example.com" />
              </Form.Item>

              {/* Conditionally require username/password if email is new */}
              <Form.Item noStyle shouldUpdate={(prev, cur) => prev.managerEmail !== cur.managerEmail}>
                {({ getFieldValue }) => {
                  const email = getFieldValue('managerEmail');
                  const needAccount = !!email && !isExistingManagerEmail(email);
                  return needAccount ? (
                    <>
                      <Form.Item
                        label="Manager Username"
                        name="managerUserName"
                        rules={[{ required: true, message: 'Please input manager username!' }]}
                      >
                        <Input placeholder="john.doe" />
                      </Form.Item>

                      <Form.Item
                        label="Manager Password"
                        name="managerPassword"
                        rules={[
                          { required: true, message: 'Please input manager password!' },
                          { min: 8, message: 'Password must be at least 8 characters.' },
                        ]}
                      >
                        <Input.Password placeholder="••••••••" />
                      </Form.Item>
                    </>
                  ) : null;
                }}
              </Form.Item>

              <Form.Item label="Assign to System (optional)" name="theaterSystemId">
                <Select placeholder="Select a system">
                  <Option value={''}>Unassigned</Option>
                  {theaterSystems?.map((sys) => (
                    <Option key={sys._id} value={sys._id}>
                      {sys.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" className="w-full" loading={createTheaterMutation.isLoading}>
                  Create Theater
                </Button>
              </Form.Item>
            </Form>
          </div>

          {/* Create Theater System */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Theater System</h2>
            <Form form={newSystemForm} layout="vertical" onFinish={(v) => createSystemMutation.mutate(v)}>
              <Form.Item label="System Name" name="name" rules={[{ required: true, message: 'Please input the system name!' }]}>
                <Input placeholder="System Name" />
              </Form.Item>
              <Form.Item label="System Code" name="code" rules={[{ required: true, message: 'Please input the system code!' }]}>
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

        {/* Theaters Table */}
        <div className="w-full max-w-6xl mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Theaters</h2>
          <Table
            columns={theaterColumns}
            dataSource={theaters}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            className="w-full"
            loading={isLoadingTheaters || deleteTheaterMutation.isLoading || updateTheaterMutation.isLoading}
          />
        </div>

        {/* Theater Systems Table */}
        <div className="w-full max-w-6xl mt-8 mb-12 bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Theater Systems</h2>
          <Table
            columns={systemColumns}
            dataSource={theaterSystems}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
            className="w-full"
            loading={isLoadingSystems || deleteSystemMutation.isLoading || updateSystemMutation.isLoading}
          />
        </div>

        {/* Theater Edit Modal */}
        <Modal
          title={`Edit Theater: ${currentTheater?.theaterName}`}
          open={showTheaterModal}
          onCancel={() => setShowTheaterModal(false)}
          footer={null}
          destroyOnClose
        >
          <Form form={theaterModalForm} layout="vertical" onFinish={handleUpdateTheater}>
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
                <Option value={''}>Unassigned</Option>
                {theaterSystems?.map((sys) => (
                  <Option key={sys._id} value={sys._id}>
                    {sys.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Manager Email"
              name="managerEmail"
              rules={[{ type: 'email', message: 'Please enter a valid email!' }]}
              tooltip="Leave empty to unassign manager. If the email is new, username & password will be required."
            >
              <Input placeholder="manager@example.com (leave empty for unassigned)" />
            </Form.Item>

            {/* Conditionally require username/password when changing to a NEW email */}
            <Form.Item noStyle shouldUpdate={(prev, cur) => prev.managerEmail !== cur.managerEmail}>
              {({ getFieldValue }) => {
                const email = getFieldValue('managerEmail');
                const needAccount = !!email && !isExistingManagerEmail(email);
                return needAccount ? (
                  <>
                    <Form.Item
                      label="Manager Username"
                      name="managerUserName"
                      rules={[{ required: true, message: 'Please input manager username!' }]}
                    >
                      <Input placeholder="john.doe" />
                    </Form.Item>
                    <Form.Item
                      label="Manager Password"
                      name="managerPassword"
                      rules={[
                        { required: true, message: 'Please input manager password!' },
                        { min: 8, message: 'Password must be at least 8 characters.' },
                      ]}
                    >
                      <Input.Password placeholder="••••••••" />
                    </Form.Item>
                  </>
                ) : null;
              }}
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
          destroyOnClose
        >
          <Form form={systemModalForm} layout="vertical" onFinish={(v) => updateSystemMutation.mutate({ systemId: currentSystem._id, data: v })}>
            <Form.Item label="System Name" name="name" rules={[{ required: true, message: 'Please input the system name!' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="System Code" name="code" rules={[{ required: true, message: 'Please input the system code!' }]}>
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
    </>
  );
};

export default Theater;
