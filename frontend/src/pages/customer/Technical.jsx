import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, Form, Input, Select, Alert, message, Card, Typography } from 'antd';
import { supportApi } from '../../api/modules/support.api';

const { Title } = Typography;

const TechnicalSupportPage = () => {
    const [form] = Form.useForm();
    const queryClientInstance = useQueryClient();
    const [messageApi, contextHolder] = message.useMessage();

    const createMutation = useMutation({
        mutationFn: supportApi.createSupport,
        onSuccess: () => {
            messageApi.success('Your ticket has been submitted successfully!');
            queryClientInstance.invalidateQueries(['supportTickets']); // Invalidate admin view
            form.resetFields();
        },
        onError: (err) => {
            messageApi.error(`Error submitting ticket: ${err.message}`);
        },
    });

    const onFinish = (values) => {
        // For demo, hardcoding a mock userId. In real app, this would come from auth context.
        createMutation.mutate({ ...values, userId: JSON.parse(localStorage.getItem('user'))._id });
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4 font-sans">
            {contextHolder}
            <Card
                className="w-full max-w-lg rounded-lg shadow-xl p-6 bg-white"
                title={<Title level={3} className="text-center text-gray-800">Submit a Support Request</Title>}
            >
                <Form
                    form={form}
                    layout="vertical"
                    name="user_support_form"
                    onFinish={onFinish}
                    className="space-y-4"
                >
                    <Form.Item
                        name="subject"
                        label="Subject"
                        rules={[{ required: true, message: 'Please enter the subject of your request!' }]}
                    >
                        <Input placeholder="E.g., Issue with booking, Feature request" className="rounded-md" />
                    </Form.Item>
                    <Form.Item
                        name="message"
                        label="Your Message"
                        rules={[{ required: true, message: 'Please describe your issue or request!' }]}
                    >
                        <Input.TextArea rows={6} placeholder="Describe your problem or suggestion here..." className="rounded-md" />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={createMutation.isLoading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-md h-10 text-lg shadow-md"
                        >
                            Submit Request
                        </Button>
                    </Form.Item>
                </Form>
                {createMutation.isError && (
                    <Alert message="Submission Error" description={createMutation.error.message} type="error" showIcon className="mt-4" />
                )}
            </Card>
        </div>
    );
};

export default TechnicalSupportPage;