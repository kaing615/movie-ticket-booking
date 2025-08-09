import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Input, Modal, message, Tooltip } from "antd";
import { EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/modules/auth.api";
import { logout } from "../redux/features/auth.slice";

const fields = [
    { key: "email", label: "Email" },
    { key: "userName", label: "Tên người dùng" },
    { key: "role", label: "Vai trò", editable: false },
    { key: "isVerified", label: "Trạng thái xác thực", editable: false },
];

const ProfilePage = () => {
    const { user } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const [editingField, setEditingField] = useState(null);
    const [fieldValue, setFieldValue] = useState("");

    const updateUserMutation = useMutation({
        mutationFn: (data) => authApi.updateProfile(data),
        onSuccess: () => {
            message.success("Cập nhật thành công!");
            setEditingField(null);
            setFieldValue("");
            queryClient.invalidateQueries(["userProfile", user?._id]);
        },
        onError: (err) => {
            message.error(err?.response?.data?.message || "Có lỗi xảy ra!");
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: () => authApi.deleteProfile(),
        onSuccess: () => {
            message.success("Tài khoản đã bị xóa!");
            dispatch(logout());
        },
        onError: (err) => {
            message.error(err?.response?.data?.message || "Có lỗi xảy ra!");
        },
    });

    const handleEdit = (key) => {
        setEditingField(key);
        setFieldValue(user[key]);
    };

    const handleEditSave = (key) => {
        if (!fieldValue || !fieldValue.trim()) {
            message.error("Không được để trống!");
            return;
        }
        updateUserMutation.mutate({ [key]: fieldValue });
    };

    const handleEditCancel = () => {
        setEditingField(null);
        setFieldValue("");
    };

    const handleDelete = () => {
        Modal.confirm({
            title: "Xác nhận xóa tài khoản?",
            content: "Bạn chắc chắn muốn xóa tài khoản này? Hành động này không thể hoàn tác.",
            okText: "Xóa",
            okType: "danger",
            cancelText: "Hủy",
            onOk: () => deleteUserMutation.mutate(),
        });
    };

    return (
        <div className="max-w-2xl mx-auto py-10 px-4">
            <div className="bg-white rounded-xl shadow p-8">
                <h2 className="text-3xl font-bold text-blue-700 text-center mb-8">Thông tin cá nhân</h2>
                <div className="space-y-5">
                    {fields.map(field => (
                        <div key={field.key} className="flex items-center justify-between group">
                            <div>
                                <span className="font-semibold">{field.label}:</span>{" "}
                                {field.key === "isVerified"
                                    ? (user?.isVerified ? "Đã xác thực" : "Chưa xác thực")
                                    : field.key === "role"
                                    ? user?.role
                                    : editingField === field.key
                                        ? (
                                            <Input
                                                size="small"
                                                value={fieldValue}
                                                onChange={e => setFieldValue(e.target.value)}
                                                style={{ width: 220, marginRight: 8 }}
                                                autoFocus
                                            />
                                        )
                                        : user[field.key]
                                }
                            </div>
                            <div className="flex gap-2">
                                {field.editable !== false && (
                                    editingField === field.key ? (
                                        <>
                                            <Tooltip title="Lưu">
                                                <Button
                                                    icon={<CheckOutlined />}
                                                    size="small"
                                                    type="primary"
                                                    onClick={() => handleEditSave(field.key)}
                                                    loading={updateUserMutation.isLoading}
                                                />
                                            </Tooltip>
                                            <Tooltip title="Hủy">
                                                <Button
                                                    icon={<CloseOutlined />}
                                                    size="small"
                                                    onClick={handleEditCancel}
                                                />
                                            </Tooltip>
                                        </>
                                    ) : (
                                        <Tooltip title="Chỉnh sửa">
                                            <Button
                                                icon={<EditOutlined />}
                                                size="small"
                                                onClick={() => handleEdit(field.key)}
                                            />
                                        </Tooltip>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end mt-10">
                    <Button danger onClick={handleDelete}>
                        Xóa tài khoản
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;