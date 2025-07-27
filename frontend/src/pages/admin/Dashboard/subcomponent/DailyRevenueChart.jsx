import React from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

const data = [
    {
        "date": "2025-07-17",
        "dailyTotalRevenue": 62.5
    }
];
const overallTotalRevenue = 62.5;

const DailyRevenueChart = () => {
    return (
        <div>
            <h2>Overall Total Revenue: $62.50</h2>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={data}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="dailyTotalRevenue" stroke="#82ca9d" activeDot={{ r: 8 }} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DailyRevenueChart;