import React, { useState } from 'react'; // Import useState
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import dayjs from 'dayjs';

const OrderTrafficBarChart = ({ className, data }) => {
    const dailyVolume = data?.dailyVolume || [];
    const overallTotalVolume = data?.overallTotalVolume || 0;
    const overallTotalCompletedVolume = data?.overallTotalCompletedVolume || 0;
    const overallTotalCancelledVolume = data?.overallTotalCancelledVolume || 0;

    // State to manage the visibility of each data series (bar or line)
    const [activeSeries, setActiveSeries] = useState({
        count: true,          // Corresponds to 'Total Orders' bar
        completedCount: true, // Corresponds to 'Completed Orders' line
        cancelledCount: true  // Corresponds to 'Cancelled Orders' line
    });

    // Handler for clicking legend items to toggle visibility
    const handleLegendClick = (e) => {
        const { dataKey } = e; // dataKey will be 'count', 'completedCount', or 'cancelledCount'
        setActiveSeries(prev => ({
            ...prev,
            [dataKey]: !prev[dataKey] // Toggle the boolean value for the clicked dataKey
        }));
    };

    // Custom Legend Content Component
    const CustomLegendContent = (props) => {
        const { payload } = props; // 'payload' contains data about each series from Recharts

        return (
            <ul className="flex justify-center mt-2">
                {
                    payload.map((entry, index) => {
                        const { dataKey, color, value } = entry;
                        const isActive = activeSeries[dataKey];

                        let displayColor = color; // Default from Recharts payload
                        if (dataKey === 'count') displayColor = '#3498DB';
                        else if (dataKey === 'completedCount') displayColor = '#28B463';
                        else if (dataKey === 'cancelledCount') displayColor = '#FF0000';

                        return (
                            <li
                                key={`item-${index}`}
                                className={`flex items-center mr-4 cursor-pointer select-none ${isActive ? '' : 'opacity-50'}`}
                                onClick={() => handleLegendClick({ dataKey: dataKey })}
                            >
                                <span
                                    className="inline-block w-3 h-3 rounded-full mr-1"
                                    style={{ backgroundColor: displayColor }}
                                ></span>
                                <span className="text-sm">{value}</span>
                            </li>
                        );
                    })
                }
            </ul>
        );
    };

    return (
        <div className={className}>
            <p className='font-semibold text-xl m-0 mt-1'>Order Traffic Summary</p>
            <p className='font-light text-sm m-0'>
                Total Orders: <b className='text-[#3498DB]'>{overallTotalVolume}</b> |
                Completed: <b className='text-green-700'>{overallTotalCompletedVolume}</b> |
                Cancelled: <b className='text-red-600'>{overallTotalCancelledVolume}</b>
            </p>
            <ResponsiveContainer height="100%">
                <ComposedChart data={dailyVolume} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(date) => dayjs(date).format('MMM DD')} />
                    <YAxis allowDecimals={false} domain={[0, 'auto']} />
                    <Tooltip />
                    {/* Use the custom content renderer for the Legend */}
                    <Legend content={<CustomLegendContent />} />

                    {/* Bar for Total Orders - opacity controlled by activeSeries state */}
                    <Bar
                        dataKey="count"
                        fill="#3498DB"
                        name="Total Orders"
                        fillOpacity={activeSeries.count ? 1 : 0.2} // Opacity based on state
                    />
                    {/* Line for Completed Orders - opacity controlled by activeSeries state */}
                    <Line
                        type="monotone"
                        dataKey="completedCount"
                        stroke="#28B463"
                        name="Completed Orders"
                        strokeWidth={2}
                        dot={true}
                        strokeOpacity={activeSeries.completedCount ? 1 : 0.2} // Opacity based on state
                    />
                    {/* Line for Cancelled Orders - opacity controlled by activeSeries state */}
                    <Line
                        type="monotone"
                        dataKey="cancelledCount"
                        stroke="#E74C3C"
                        name="Cancelled Orders"
                        strokeWidth={2}
                        dot={true}
                        strokeOpacity={activeSeries.cancelledCount ? 1 : 0.2} // Opacity based on state
                    />
                </ComposedChart>
            </ResponsiveContainer>
        </div>
    );
};

export default OrderTrafficBarChart;