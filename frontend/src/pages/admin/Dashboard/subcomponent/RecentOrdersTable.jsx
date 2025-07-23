import React, { useState, useEffect } from "react";
import { Table, Tag, message } from "antd";
import dayjs from "dayjs";
import privateClient from "../../../../api/clients/private.client.js";

const RecentOrdersTable = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 6, // Display 6 items per page for a compact dashboard view
        total: 0,
    });

    const fetchRecentOrders = async (page, limit) => {
        setLoading(true);
        try {
            const today = dayjs().format("YYYY-MM-DD");

            // Make API call to your /api/orders endpoint with date range and pagination
            const response = await axiosInstance.get(
                `/api/orders?page=${page}&limit=${limit}&date=${today}`
            );

            const fetchedOrders = response.data.data?.[0]?.orders || [];
            const apiPagination = response.data.pagination;

            setOrders(fetchedOrders);
            setPagination({
                ...pagination,
                current: apiPagination.page,
                pageSize: apiPagination.limit,
                total: apiPagination.total_records,
            });

        } catch (error) {
            console.error("Failed to fetch recent orders:", error);
            message.error("Failed to load recent orders.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecentOrders(pagination.current, pagination.pageSize);
    }, [pagination.current, pagination.pageSize]);

    const handleTableChange = (newPagination) => {
        setPagination(prevPagination => ({
            ...prevPagination,
            current: newPagination.current,
            pageSize: newPagination.pageSize,
        }));
    };

    const columns = [
        {
            title: "Order ID",
            dataIndex: "orderId",
            key: "orderId",
            render: (text) => text ? `...${text.slice(-6)}` : '',
        },
        {
            title: "Customer",
            key: "customerName",
            render: (record) => {
                const firstName = record.customerInfo?.firstName || '';
                const lastName = record.customerInfo?.lastName || '';
                if (firstName || lastName) {
                    return `${firstName} ${lastName}`.trim();
                }
                return 'N/A';
            },
        },
        {
            title: "Total Price",
            dataIndex: "total_order_price",
            key: "total_order_price",
            render: (price) => `$${(price || 0).toFixed(2)}`,
        },
        {
            title: "Status",
            dataIndex: "orderStatus",
            key: "orderStatus",
            render: (status) => {
                let color;
                switch (status) {
                    case "pending":
                        color = "orange";
                        break;
                    case "completed":
                        color = "green";
                        break;
                    case "cancelled":
                        color = "red";
                        break;
                    default:
                        color = "blue"; // Fallback color
                }
                return (
                    <Tag color={color} key={status}>
                        {status ? status.toUpperCase() : 'UNKNOWN'}
                    </Tag>
                );
            },
        },
        {
            title: "Order Time",
            dataIndex: "orderDate",
            key: "orderDate",
            render: (date) => date ? dayjs(date).format("h:mm:ss A") : 'N/A',
        },
    ];

    // Columns for the nested services table
    const serviceColumns = [
        {
            title: "Service Name",
            dataIndex: "serviceName",
            key: "serviceName",
        },
        {
            title: "Unit",
            dataIndex: "serviceUnit",
            key: "serviceUnit",
        },
        {
            title: "Quantity",
            dataIndex: "numberOfUnit",
            key: "numberOfUnit",
        },
        {
            title: "Price/Unit",
            dataIndex: "pricePerUnit",
            key: "pricePerUnit",
            render: (price) => `$${(price || 0).toFixed(2)}`,
        },
        {
            title: "Total Price",
            dataIndex: "totalPrice",
            key: "totalPrice",
            render: (price) => `$${(price || 0).toFixed(2)}`,
        },
    ];

    // Function to render the expanded row content
    const expandedRowRender = (record) => {
        return (
            <div className="mb-4 p-4 bg-gray-300">
                <p className="m-0 font-semibold text-lg">
                    Customer Phone: {record.customerInfo?.phoneNumber || 'N/A'}
                </p>
                <p className="mb-2 font-semibold text-lg">Customer Address: {record.customerInfo?.address || 'N/A'}</p>
                <p className="mb-2 font-bold text-base">Services:</p>
                <Table
                    columns={serviceColumns}
                    dataSource={record.services || []}
                    rowKey={(service, index) => service.serviceId || index} // Use serviceId or index as key
                    pagination={false} // No pagination for the nested table
                    size="small" // Make nested table compact
                    className="nested-services-table" // Optional: for custom styling
                    // Prevent table border for cleaner look
                    style={{ border: 'none' }}
                />
            </div>
        );
    };

    return (
        <div className="bg-white p-4 rounded-lg mt-4 pb-0 pt-2.5">
            <h2 className="text-xl font-semibold mb-4">Recent Orders (Today)</h2>
            <Table
                columns={columns}
                dataSource={orders}
                rowKey="orderId"
                loading={loading}
                pagination={{
                    ...pagination,
                    showSizeChanger: false, // You might want to enable this if you plan to allow users to change page size
                    showQuickJumper: false,
                    // pageSizeOptions: ['5', '6', '10'], // Removed this as showSizeChanger is false
                }}
                onChange={handleTableChange}
                className="w-full"
                size="small"
                // Add the expandable prop here
                expandable={{
                    expandedRowRender,
                    rowExpandable: (record) => record.services && record.services.length > 0, // Only show expand icon if there are services
                }}
            />
        </div>
    );
};

export default RecentOrdersTable;