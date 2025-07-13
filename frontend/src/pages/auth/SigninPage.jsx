import React, { useEffect } from "react";
import { Form, Input, Button, Typography, message } from "antd";
import { useNavigate, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { loginUser } from "../../redux/features/auth.slice.js";
import { LockOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const SigninPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [messageApi, contextHolder] = message.useMessage();

    const { isAuthenticated, status, error, user } = useSelector((state) => state.auth);

    useEffect(() => {
        if (isAuthenticated && status === "succeeded" && user) {
            if (user.role === "admin") {
                navigate("/admin/dashboard", { replace: true });
            } else if (user.role === "theater-manager") {
                navigate("/manager/dashboard", { replace: true });
            } else {
                navigate("/customer/home", { replace: true });
            }
        }
    }, [isAuthenticated, status, navigate, user]);

    useEffect(() => {
        if (status === "failed" && error) {
            messageApi.error(error);
        } else if (status === "succeeded") {
            messageApi.success("Đăng nhập thành công!");
        }
    }, [status, error, messageApi]);

    const onFinish = async (values) => {
        try {
            dispatch(loginUser({ email: values.email, password: values.password }));
        } catch (error) {
            console.error("Login failed:", error);
        }
    };

    if (isAuthenticated && status !== "loading") {
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-200 via-orange-100 to-pink-100 p-4">
            {contextHolder}
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-2xl p-10 border-0">
                    <div className="flex flex-col items-center mb-8">
                        <img
                            src="../../../public/img/logo.png"
                            alt="Cinema Gate"
                            className="w-40 h-40 mb-2 drop-shadow-lg"
                            style={{ objectFit: "contain" }}
                        />
                    </div>
                    <div className="flex flex-col items-center mb-8">
                        <LockOutlined className="text-orange-500 text-5xl mb-2 drop-shadow-md" />
                        <Title level={2} className="mb-1 text-gray-800 font-semibold">Đăng nhập</Title>
                        <Text className="text-gray-500 text-base mb-2">
                            Đăng nhập để tiếp tục sử dụng <span className="font-bold text-orange-500">Cinema Gate</span>
                        </Text>
                    </div>
                    <Form
                        name="login"
                        layout="vertical"
                        initialValues={{ remember: true }}
                        onFinish={onFinish}
                        className="space-y-1"
                    >
                        <Form.Item
                            label={<span className="font-semibold">Email</span>}
                            name="email"
                            rules={[{ required: true, message: "Hãy nhập email!" }]}
                            className="mb-4"
                        >
                            <Input size="large" placeholder="Nhập email của bạn" className="rounded-xl" />
                        </Form.Item>
                        <Form.Item
                            label={<span className="font-semibold">Mật khẩu</span>}
                            name="password"
                            rules={[{ required: true, message: "Hãy nhập mật khẩu!" }]}
                            className="mb-4"
                        >
                            <Input.Password size="large" placeholder="Nhập mật khẩu" className="rounded-xl" />
                        </Form.Item>
                        <Form.Item name="remember" valuePropName="checked" className="mb-4">
                            <div className="flex justify-between items-center">
                                <Link to="#" className="text-orange-500 hover:underline font-medium">
                                    Quên mật khẩu?
                                </Link>
                            </div>
                        </Form.Item>
                        <Form.Item>
                            <Button
                                type="primary"
                                htmlType="submit"
                                size="large"
                                block
                                loading={status === "loading"}
                                className="rounded-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 border-0 hover:from-pink-500 hover:to-orange-500 transition"
                                style={{ boxShadow: "0 6px 20px 0 #f472b6AA" }}
                            >
                                Đăng nhập
                            </Button>
                        </Form.Item>
                    </Form>
                    <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6" />
                    <div className="text-center">
                        <Text>Chưa có tài khoản? </Text>
                        <Link to="/auth/signup" className="text-orange-500 font-semibold hover:underline">
                            Đăng ký ngay
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SigninPage;
