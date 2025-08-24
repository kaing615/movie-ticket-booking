import React, { useMemo, useState } from "react";
import "antd/dist/reset.css";
import {
  Tabs,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Space,
  Tag,
  Popconfirm,
  message,
  Tooltip,
  Switch,
  Divider,
} from "antd";
import {
  UserAddOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminManagementApi } from "../../api/modules/admin/adminManagement.api.js"

const { TabPane } = Tabs;

function useSearchFilter(data) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    if (!q) return data || [];
    const s = q.toLowerCase();
    return (data || []).filter(
      (u) =>
        String(u.email || "").toLowerCase().includes(s) ||
        String(u.userName || "").toLowerCase().includes(s)
    );
  }, [data, q]);
  return { q, setQ, filtered };
}

function UserManagement() {
  const queryClient = useQueryClient();
  const [messageApi, contextHolder] = message.useMessage();

  // Modal state
  const [isCreateCustomerOpen, setCreateCustomerOpen] = useState(false);
  const [isEditCustomerOpen, setEditCustomerOpen] = useState(false);
  const [isEditManagerOpen, setEditManagerOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [editingManager, setEditingManager] = useState(null);

  const [createCustomerForm] = Form.useForm();
  const [editCustomerForm] = Form.useForm();
  const [editManagerForm] = Form.useForm();

  // ===== Queries
  const {
    data: customers,
    isLoading: loadingCustomers,
    isError: errorCustomers,
  } = useQuery({
    queryKey: ["customers"],
    queryFn: adminManagementApi.getCustomers,
  });

  const {
    data: managers,
    isLoading: loadingManagers,
    isError: errorManagers,
  } = useQuery({
    queryKey: ["managers"],
    queryFn: adminManagementApi.getManagers,
  });

  // Local search
  const {
    q: qCustomers,
    setQ: setQCustomers,
    filtered: filteredCustomers,
  } = useSearchFilter(customers);
  const {
    q: qManagers,
    setQ: setQManagers,
    filtered: filteredManagers,
  } = useSearchFilter(managers);

  // ===== Mutations (Customers)
  const createCustomerMutation = useMutation({
    mutationFn: adminManagementApi.createCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      createCustomerForm.resetFields();
      setCreateCustomerOpen(false);
      messageApi.success("Customer created");
    },
    onError: (err) => messageApi.error(err?.message || "Create failed"),
  });

  const updateCustomerMutation = useMutation({
    mutationFn: ({ id, data }) => adminManagementApi.updateCustomer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      setEditCustomerOpen(false);
      messageApi.success("Customer updated");
    },
    onError: (err) => messageApi.error(err?.message || "Update failed"),
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: adminManagementApi.deleteCustomer,
    onSuccess: () => {
      queryClient.invalidateQueries(["customers"]);
      messageApi.success("Customer deleted");
    },
    onError: (err) => messageApi.error(err?.message || "Delete failed"),
  });

  // ===== Mutations (Managers)
  const updateManagerMutation = useMutation({
    mutationFn: ({ id, data }) => adminManagementApi.updateManager(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["managers"]);
      setEditManagerOpen(false);
      messageApi.success("Manager updated");
    },
    onError: (err) => messageApi.error(err?.message || "Update failed"),
  });

  const deleteManagerMutation = useMutation({
    mutationFn: adminManagementApi.deleteManager,
    onSuccess: () => {
      queryClient.invalidateQueries(["managers"]);
      messageApi.success("Manager deleted");
    },
    onError: (err) => messageApi.error(err?.message || "Delete failed"),
  });

  // ===== Columns
  const customerColumns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (v) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: "User name",
      dataIndex: "userName",
      key: "userName",
      render: (v) => v || "—",
    },
    {
      title: "Verified",
      key: "isVerified",
      dataIndex: "isVerified",
      render: (v) => (
        <Tag color={v ? "green" : "default"}>{v ? "Verified" : "Unverified"}</Tag>
      ),
      width: 130,
    },
    {
      title: "Active",
      key: "isDeleted",
      dataIndex: "isDeleted",
      render: (v) => <Tag color={!v ? "blue" : "red"}>{!v ? "Active" : "Inactive"}</Tag>,
      width: 110,
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit customer">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingCustomer(record);
                editCustomerForm.setFieldsValue({
                  email: record.email,
                  userName: record.userName,
                  isDeleted: !!record.isDeleted,
                });
                setEditCustomerOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this customer?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteCustomerMutation.mutate(record._id)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const managerColumns = [
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      render: (v) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: "User name",
      dataIndex: "userName",
      key: "userName",
      render: (v) => v || "—",
    },
    {
      title: "Active",
      key: "isDeleted",
      dataIndex: "isDeleted",
      render: (v) => <Tag color={!v ? "blue" : "red"}>{!v ? "Active" : "Inactive"}</Tag>,
      width: 110,
    },
    {
      title: "Actions",
      key: "actions",
      width: 180,
      render: (_, record) => (
        <Space>
          <Tooltip title="Edit manager (no password change)">
            <Button
              icon={<EditOutlined />}
              onClick={() => {
                setEditingManager(record);
                editManagerForm.setFieldsValue({
                  email: record.email,
                  userName: record.userName,
                  isDeleted: !!record.isDeleted,
                });
                setEditManagerOpen(true);
              }}
            />
          </Tooltip>
          <Popconfirm
            title="Delete this manager?"
            okText="Delete"
            okButtonProps={{ danger: true }}
            onConfirm={() => deleteManagerMutation.mutate(record._id)}
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // ===== Handlers
  const handleCreateCustomer = (values) => {
    // Backend sẽ set role = "customer" (nếu API yêu cầu, có thể thêm { role: 'customer' } trong body)
    createCustomerMutation.mutate({
      email: values.email,
      userName: values.userName,
      // KHÔNG gửi password – “không cho đổi mật khẩu”
    });
  };

  const handleUpdateCustomer = (values) => {
    if (!editingCustomer?._id) return;
    updateCustomerMutation.mutate({
      id: editingCustomer._id,
      data: {
        email: values.email,
        userName: values.userName,
        isDeleted: !!values.isDeleted,
      },
    });
  };

  const handleUpdateManager = (values) => {
    if (!editingManager?._id) return;
    // KHÔNG cho đổi mật khẩu, KHÔNG cho đổi role
    updateManagerMutation.mutate({
      id: editingManager._id,
      data: {
        email: values.email, // có thể disable nếu không muốn đổi email
        userName: values.userName,
        isDeleted: !!values.isDeleted,
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {contextHolder}
      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 16,
          border: "1px solid #f0f0f0",
          marginBottom: 16,
        }}
      >
        <Space align="center" style={{ width: "100%", justifyContent: "space-between" }}>
          <Space>
            <UserOutlined style={{ fontSize: 20 }} />
            <span style={{ fontSize: 20, fontWeight: 600 }}>User Management</span>
          </Space>
          <Space>
            <Tooltip title="Reload lists">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  queryClient.invalidateQueries(["customers"]);
                  queryClient.invalidateQueries(["managers"]);
                }}
              />
            </Tooltip>
          </Space>
        </Space>
      </div>

      <div
        style={{
          background: "#fff",
          borderRadius: 16,
          padding: 16,
          border: "1px solid #f0f0f0",
        }}
      >
        <Tabs defaultActiveKey="customers" destroyInactiveTabPane>
          <TabPane
            tab={
              <Space>
                <UserOutlined /> Customers
              </Space>
            }
            key="customers"
          >
            <Space style={{ marginBottom: 12, width: "100%", justifyContent: "space-between" }}>
              <Space.Compact style={{ width: 360 }}>
                <Input
                  prefix={<SearchOutlined />}
                  value={qCustomers}
                  onChange={(e) => setQCustomers(e.target.value)}
                  placeholder="Search email or username"
                  allowClear
                />
              </Space.Compact>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={() => {
                  createCustomerForm.resetFields();
                  setCreateCustomerOpen(true);
                }}
              >
                New customer
              </Button>
            </Space>

            <Table
              rowKey="_id"
              loading={loadingCustomers}
              dataSource={filteredCustomers}
              columns={customerColumns}
              pagination={{ pageSize: 8 }}
              locale={{
                emptyText: errorCustomers ? "Failed to load customers" : undefined,
              }}
            />
          </TabPane>

          <TabPane
            tab={
              <Space>
                <TeamOutlined /> Theater Managers
              </Space>
            }
            key="managers"
          >
            <Space style={{ marginBottom: 12, width: "100%", justifyContent: "space-between" }}>
              <Space.Compact style={{ width: 360 }}>
                <Input
                  prefix={<SearchOutlined />}
                  value={qManagers}
                  onChange={(e) => setQManagers(e.target.value)}
                  placeholder="Search email or username"
                  allowClear
                />
              </Space.Compact>
              {/* Không có nút create manager ở đây: manager được tạo khi tạo Theater */}
              <div />
            </Space>

            <Table
              rowKey="_id"
              loading={loadingManagers}
              dataSource={filteredManagers}
              columns={managerColumns}
              pagination={{ pageSize: 8 }}
              locale={{
                emptyText: errorManagers ? "Failed to load managers" : undefined,
              }}
            />
          </TabPane>
        </Tabs>
      </div>

      {/* ===== Modals */}

      {/* Create Customer */}
      <Modal
        title="Create Customer"
        open={isCreateCustomerOpen}
        onCancel={() => setCreateCustomerOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={createCustomerForm} layout="vertical" onFinish={handleCreateCustomer}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input email" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input placeholder="customer@example.com" />
          </Form.Item>
          <Form.Item
            label="User name"
            name="userName"
            rules={[{ required: true, message: "Please input user name" }]}
          >
            <Input placeholder="Customer name" />
          </Form.Item>
          {/* Không cho đổi/đặt mật khẩu ở đây */}
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={createCustomerMutation.isLoading}
              block
            >
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Customer */}
      <Modal
        title={`Edit Customer: ${editingCustomer?.email || ""}`}
        open={isEditCustomerOpen}
        onCancel={() => setEditCustomerOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={editCustomerForm} layout="vertical" onFinish={handleUpdateCustomer}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input email" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="User name"
            name="userName"
            rules={[{ required: true, message: "Please input user name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Inactive"
            name="isDeleted"
            valuePropName="checked"
            tooltip="Turn on to deactivate this account"
          >
            <Switch />
          </Form.Item>
          <Divider style={{ margin: "8px 0 16px" }} />
          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Button onClick={() => setEditCustomerOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateCustomerMutation.isLoading}
              >
                Save changes
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Manager (no password fields) */}
      <Modal
        title={`Edit Manager: ${editingManager?.email || ""}`}
        open={isEditManagerOpen}
        onCancel={() => setEditManagerOpen(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={editManagerForm} layout="vertical" onFinish={handleUpdateManager}>
          <Form.Item
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Please input email" },
              { type: "email", message: "Invalid email" },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="User name"
            name="userName"
            rules={[{ required: true, message: "Please input user name" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Inactive"
            name="isDeleted"
            valuePropName="checked"
            tooltip="Turn on to deactivate this account"
          >
            <Switch />
          </Form.Item>
          <Divider style={{ margin: "8px 0 16px" }} />
          <Form.Item>
            <Space style={{ width: "100%", justifyContent: "space-between" }}>
              <Button onClick={() => setEditManagerOpen(false)}>Cancel</Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={updateManagerMutation.isLoading}
              >
                Save changes
              </Button>
            </Space>
          </Form.Item>
          <p style={{ marginTop: 8, color: "#999" }}>
            Password changes are not allowed here. Managers are created (with password) when creating a theater.
          </p>
        </Form>
      </Modal>
    </div>
  );
}

export default UserManagement;
