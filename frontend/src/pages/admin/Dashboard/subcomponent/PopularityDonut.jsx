import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A28DFF", "#FF6666", "#FF00FF", "#800080"]; // Added more colors for more categories

const PopularityDonutChart = ({ data }) => {
    // Safely destructure the type and the actual data array
    const chartType = data?.type;
    const chartData = data?.data || [];

    // Determine the data key and name key based on the chartType
    let valueKey = "";
    let nameKey = "serviceName"; // This is consistent across both types
    let unit = ""; // To be used in the tooltip

    if (chartType === "quantity") {
        valueKey = "totalQuantity";
        unit = ""; // No specific unit for quantity, or you can add "units"
    } else if (chartType === "revenue") {
        valueKey = "totalRevenue";
        unit = "$"; // Assuming VND as the currency unit
    }

    // Calculate total using the determined valueKey
    const total = chartData.reduce((sum, entry) => sum + (entry[valueKey] || 0), 0);

    return (
        <ResponsiveContainer width="100%" height="80%">
            <PieChart>
                <Pie
                    data={chartData} // Use the extracted chartData array
                    cx="50%"
                    cy="50%"
                    innerRadius="50%"
                    outerRadius="80%"
                    fill="#8884d8"
                    dataKey={valueKey} // Dynamic dataKey
                    nameKey={nameKey} // nameKey for the labels in legend/tooltip
                // Optional: If you want percentages directly on slices:
                // label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                // labelLine={false}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    formatter={(value, name) => {
                        const percentage = ((value / total) * 100).toFixed(1);
                        // Format: "Service Name: ValueUnit (Percentage%)"
                        return [`${name}: ${value}${unit ? ` ${unit}` : ''} (${percentage}%)`];
                    }}
                />
                {/* Legend uses nameKey from Pie component to display serviceName */}
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default PopularityDonutChart;