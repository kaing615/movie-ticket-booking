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

// const data = {
//     message: "Daily ticket counts retrieved successfully",
//     data: {
//         dailyTicketCounts: [
//             {
//                 count: 6,
//                 date: "2025-07-17T00:00:00.000Z"
//             },
//             {
//                 count: 10,
//                 date: "2025-07-18T00:00:00.000Z"
//             },
//             {
//                 count: 8,
//                 date: "2025-07-19T00:00:00.000Z"
//             }
//         ],
//         overallTotalTicketCount: 24 // Updated for example
//     }
// }


const formatDisplayDate = (isoDateString) => {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    const formatter = new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
    });
    return formatter.format(date).replace(' ', '. ');
};

const DailyTicketChart = ({ data }) => {
    const chartData = data?.data.dailyTicketCounts;
    const overallTicketCount = data?.data.overallTotalTicketCount;

    return (
        <div>
            <h2>Overall Total Ticket Count: {overallTicketCount}</h2>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    {/* APPLY THE TICK FORMATTER HERE */}
                    <XAxis
                        dataKey="date"
                        tickFormatter={formatDisplayDate} // <--- This was missing!
                    />
                    <YAxis />
                    <Tooltip
                        labelFormatter={(label) => formatDisplayDate(label)} // Format the date in the tooltip label
                        formatter={(value, name) => [value, "Tickets"]} // Format value in tooltip
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="count"
                        stroke="#763cffff"
                        activeDot={{ r: 8 }}
                        name="Daily Ticket Count"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DailyTicketChart;