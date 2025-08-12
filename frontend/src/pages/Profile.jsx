import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Button, Input, Modal, message, Tooltip, Table, Tag, Collapse } from "antd";
import { EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { userApi } from "../api/modules/user.api.js";
import {bookingApi} from "../api/modules/booking.api.js";
import { logout, updateUser } from "../redux/features/auth.slice.js";
import BookingHistory from "./BookingHistory.jsx";
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
        mutationFn: (data) => userApi.updateProfile(data),
        onSuccess: (res) => {
            message.success("Cập nhật thành công!");
            setEditingField(null);
            setFieldValue("");
            if (res?.user) dispatch(updateUser(res.user));
            queryClient.invalidateQueries(["userProfile", user?._id]);
        },
        onError: (err) => {
            message.error(err?.response?.data?.message || "Có lỗi xảy ra!");
        },
    });

    const deleteUserMutation = useMutation({
        mutationFn: (data) => userApi.deleteProfile(data),
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

    console.log("User: ", user);

    return (
         <div className="max-w-7xl mx-auto py-10 px-4"> {/* Increased max-width */}
            <div className="grid gap-8"> {/* Using grid for better layout */}
                {/* Profile Information Card */}
                <div className="bg-white rounded-xl shadow p-8">
                    <h2 className="text-3xl font-bold text-blue-700 text-center mb-8">
                        Thông tin cá nhân
                    </h2>
                    <div className="space-y-5 max-w-2xl mx-auto"> {/* Centered profile info */}
                        {fields.map(field => (
                        <div key={field.key} className="flex items-center justify-between group">
                            <div className="flex items-center">
                                <span className="font-semibold">{field.label}:</span>
                                {field.key === "isVerified" ? (
                                    <span style={{ marginLeft: 8 }}>
                                    {user?.isVerified ? "Đã xác thực" : "Chưa xác thực"}
                                    </span>
                                ) : field.key === "role" ? (
                                    <span style={{ marginLeft: 8 }}>{user?.role}</span>
                                ) : editingField === field.key ? (
                                    <Input
                                    size="small"
                                    value={fieldValue}
                                    onChange={e => setFieldValue(e.target.value)}
                                    style={{ width: 220, marginLeft: 8 }}
                                    autoFocus
                                    />
                                ) : (
                                    <span style={{ marginLeft: 8 }}>{user[field.key]}</span>
                                )}
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
                                                style={{ marginLeft: 8 }}
                                            />
                                        </Tooltip>
                                    )
                                )}
                            </div>
                        </div>
                    ))}
                    </div>
                    <div className="flex justify-center mt-10">
                        <Button danger onClick={handleDelete}>
                            Xóa tài khoản
                        </Button>
                    </div>
                </div>

                {/* Booking History Card */}
                <div className="bg-white rounded-xl shadow p-8">
                    <BookingHistory />
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;