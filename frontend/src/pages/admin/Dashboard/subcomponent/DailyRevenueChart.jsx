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
//     success: true,
//     data: {
//         dailyRevenue: [
//             {
//                 dailyTotalRevenue: 62.5,
//                 date: "2025-07-17T00:00:00.000Z"
//             },
//             {
//                 dailyTotalRevenue: 120.0,
//                 date: "2025-07-18T00:00:00.000Z"
//             },
//             {
//                 dailyTotalRevenue: 90.0,
//                 date: "2025-07-19T00:00:00.000Z"
//             }
//         ],
//         overallTotalRevenue: 272.5 // Added more data for a better chart example
//     }
// };

const formatDisplayDate = (isoDateString) => {
    if (!isoDateString) return '';
    const date = new Date(isoDateString);
    const formatter = new Intl.DateTimeFormat('en-US', {
        day: '2-digit',
        month: 'short',
    });
    return formatter.format(date).replace(' ', '. ');
};

const DailyRevenueChart = ({ data }) => {
    const chartData = data?.data.dailyRevenue;
    const overallRevenue = data?.data.overallTotalRevenue;

    return (
        <div className='flex flex-col items-center border-t border-gray-300 ml-4 mt-7'>
            <h2 className='text-gray-800 p-4'>Overall Total Revenue: ${overallRevenue}</h2>
            <ResponsiveContainer width="100%" height={400}>
                <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDisplayDate} />
                    <YAxis />
                    <Tooltip
                        labelFormatter={(label) => formatDisplayDate(label)} // Format the date in the tooltip label
                        formatter={(value, name) => [`$${value.toFixed(2)}`, "Revenue"]} // Format value in tooltip
                    />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="dailyTotalRevenue"
                        stroke="#0007c7ff"
                        activeDot={{ r: 8 }}
                        name="Daily Revenue" // Name for the legend and tooltip
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default DailyRevenueChart;