import React from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import { UserAddOutlined } from "@ant-design/icons";
import { authApi } from "../../api/modules/auth.api.js";
import { useDispatch } from "react-redux";
import { showLoading, hideLoading } from "../../redux/features/loading.slice.js";

const { Title, Text } = Typography;

function SignupPage() {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const onFinish = async (values) => {
        dispatch(showLoading());
        try {
            console.log(values);
            const res = await authApi.signup(values);
            message.success(res?.data?.message || "Đăng ký thành công!");
            navigate(`/auth/verify-email?email=${encodeURIComponent(values.email)}`);
        } catch (err) {
            message.error(err.response?.data?.message || "Đăng ký thất bại");
        } finally {
            dispatch(hideLoading());
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1e293b] via-[#f472b6] to-[#fbbf24] p-4">
            <div className="w-full max-w-md">
                <div className="bg-white border border-gray-100 rounded-2xl shadow-2xl p-10 relative">
                    <div className="flex flex-col items-center mb-8">
                        <img
                            src="/img/logo.png"
                            alt="Cinema Gate"
                            className="w-40 h-40 mb-2 drop-shadow-lg"
                            style={{ objectFit: "contain" }}
                        />
                    </div>
                    <div className="flex flex-col items-center mb-6">
                        <UserAddOutlined className="text-4xl text-[#2563eb] mb-2 drop-shadow-sm" />
                        <Title level={2} className="mb-1 text-gray-800 font-semibold">Đăng ký tài khoản</Title>
                        <Text className="text-gray-500 text-base mb-2">Tạo tài khoản mới để trải nghiệm <span className="text-orange-500 font-bold">Cinema Gate</span></Text>
                    </div>
                    <Form
                        name="signup"
                        layout="vertical"
                        autoComplete="off"
                        onFinish={onFinish}
                        initialValues={{ remember: true }}
                        className="space-y-2"
                    >
                        <Form.Item
                            label={<span className="font-semibold">Tên người dùng</span>}
                            name="userName"
                            rules={[{ required: true, message: "Hãy nhập tên người dùng!" }]}
                        >
                            <Input size="large" placeholder="Tên của bạn" className="rounded-xl" />
                        </Form.Item>
                        <Form.Item
                            label={<span className="font-semibold">Email</span>}
                            name="email"
                            rules={[
                                { required: true, message: "Hãy nhập email!" },
                                { type: "email", message: "Email không hợp lệ!" },
                            ]}
                        >
                            <Input size="large" placeholder="Email của bạn" className="rounded-xl" />
                        </Form.Item>
                        <Form.Item
                            label={<span className="font-semibold">Mật khẩu</span>}
                            name="password"
                            rules={[{ required: true, message: "Hãy nhập mật khẩu!" }]}
                        >
                            <Input.Password size="large" placeholder="Nhập mật khẩu" className="rounded-xl" />
                        </Form.Item>
                        <Form.Item className="mb-0">
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                className="rounded-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 border-0 hover:from-pink-500 hover:to-orange-500"
                                style={{ boxShadow: "0 6px 20px 0 #f472b6AA" }}
                            >
                                Đăng ký
                            </Button>
                        </Form.Item>
                    </Form>
                    {/* Divider */}
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6" />
                    {/* Link đăng nhập */}
                    <div className="text-center">
                        <Text>Đã có tài khoản? </Text>
                        <Link to="/auth/signin" className="text-[#2563eb] font-semibold hover:underline">
                            Đăng nhập
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SignupPage;
