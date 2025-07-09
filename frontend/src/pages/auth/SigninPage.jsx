import React, { useEffect } from 'react';
import { Form, Input, Button, Checkbox, Card, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser } from '../../redux/features/auth.slice.js'; // Adjust path as needed

const { Title, Text } = Typography;

const SigninPage = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [messageApi, contextHolder] = message.useMessage();

    // Select relevant state from Redux store
    const { isAuthenticated, status, error, user } = useSelector((state) => state.auth);

    useEffect(() => {
        // If login is successful and auth status is 'succeeded', navigate to dashboard
        if (isAuthenticated && status === 'succeeded') {
            console.log(user); ư
            //điều hướng tại đây
            if (user.role === 'admin') {
                navigate('/admin/dashboard', { replace: true });
            } else if (user.role === 'theater-manager') {
                navigate('/manager/dashboard', { replace: true });
            }
        }
    }, [isAuthenticated, status, navigate, user]);

    useEffect(() => {
        if (status === 'failed' && error) {
            messageApi.error(error);
        } else if (status === 'succeeded') {
            messageApi.success('Login successful!');
        }
    }, [status, error, messageApi]);

    const onFinish = async (values) => {
        try {
            dispatch(loginUser({ email: values.email, password: values.password }));
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Form validation failed:', errorInfo);
    };

    // The RedirectIfAuthenticated component wrapped around LoginPage in App.js
    // should prevent rendering this if already authenticated.
    // This check is mainly for development if accessing LoginPage directly, or if there's a race condition.
    if (isAuthenticated && status !== 'loading') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            {contextHolder}
            <Card
                className="w-full max-w-md shadow-lg rounded-lg"
                style={{ padding: '2rem' }}
            >
                <div className="text-center mb-6">
                    <Title level={2} className="text-gray-800">
                        Welcome Back!
                    </Title>
                    <Text className="text-gray-500">
                        Sign in to your account to continue.
                    </Text>
                </div>

                <Form
                    name="login"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    onFinishFailed={onFinishFailed}
                    layout="vertical" // Stack labels above inputs
                >
                    <Form.Item
                        label="email"
                        name="email"
                        rules={[
                            { required: true, message: 'Please input your email!' },
                        ]}
                        className="mb-4"
                    >
                        <Input
                            size="large"
                            placeholder="Enter your email"
                            className="rounded-md"
                        />
                    </Form.Item>

                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            { required: true, message: 'Please input your password!' },
                        ]}
                        className="mb-6"
                    >
                        <Input.Password
                            size="large"
                            placeholder="Enter your password"
                            className="rounded-md"
                        />
                    </Form.Item>

                    <Form.Item name="remember" valuePropName="checked" className="mb-6">
                        <Checkbox>Remember me</Checkbox>
                    </Form.Item>

                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={status === 'verifying'}
                            className="w-full rounded-md pt-4 pb-5 text-lg font-semibold text-center"
                        >
                            Log in
                        </Button>
                    </Form.Item>

                    <div className="text-center mt-4">
                        <a href="#" className="text-blue-500 hover:text-blue-700">
                            Forgot password?
                        </a>
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default SigninPage;