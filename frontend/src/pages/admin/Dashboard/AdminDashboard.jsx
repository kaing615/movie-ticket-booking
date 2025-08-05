import { adminAnalyticsApi } from "../../../api/modules/admin/adminAnalytics.api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Divider, Select } from "antd";
import DateSelection from "./subcomponent/DateSelector";
import MetricCard from "./subcomponent/MetricCard"
import DailyTicketChart from "./subcomponent/DailyTicketChart";
import DailyRevenueChart from "./subcomponent/DailyRevenueChart";

import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween'


dayjs.extend(isBetween)


const AdminDashboard = () => {
    const [currentDateSelection, setCurrentDateSelection] = useState([dayjs().format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")]);
    useEffect(() => {
        const { start, end } = currentDateSelection[0] ? { start: currentDateSelection[0], end: currentDateSelection[1] } : { start: dayjs().format("YYYY-MM-DD"), end: dayjs().format("YYYY-MM-DD") };
    }, [currentDateSelection])

    // Query for User Count by Role
    const { data: userCounts, isLoading: userCountsLoading, error: userCountsError } = useQuery({
        queryKey: ['userCountsByRole'], // Unique key for this query
        queryFn: adminAnalyticsApi.getUserCountByRole,    // The function that fetches the data
    });
    // "data": {
    //     "message": "User counts by role retrieved successfully",
    //         "data": [
    //             {
    //                 "count": 1,
    //                 "role": "admin"
    //             },
    //             {
    //                 "count": 2,
    //                 "role": "customer"
    //             },
    //             {
    //                 "count": 2,
    //                 "role": "theater-manager"
    //             }
    //         ]
    // }

    const {
        data: dailyTicketCount,
        isLoading: dailyTicketCountLoading,
        error: dailyTicketCountError
    } = useQuery({
        queryKey: ['dailyTicketCount', currentDateSelection],
        queryFn: () => adminAnalyticsApi.getDailyTicketCount(currentDateSelection[0], currentDateSelection[1]),
    });

    const {
        data: dailyTicketRevenue,
        isLoading: dailyTicketRevenueLoading,
        error: dailyTicketRevenueError
    } = useQuery({
        queryKey: ['dailyTicketRevenue', currentDateSelection],
        queryFn: () => adminAnalyticsApi.getDailyTicketRevenue(currentDateSelection[0], currentDateSelection[1]),
    });

    console.log(dailyTicketCount);
    console.log(dailyTicketRevenue);

    return (
        <>
            <div className="flex items-center justify-between w-full h-25 py-3 px-4">
                <div className="flex flex-col items-between justify-between">
                    <p className="font-semibold text-4xl m-0 mt-2">Welcome back</p>
                    <p className="text-base text-gray-600 mt-1">Track users, revenues, and stay on top of finances — all in one place.</p>
                </div>
                <div className="w-15% flex items-center justify-between">
                    <p className="m-0 mr-2 text-gray-600">From:</p>
                    <DateSelection onSelection={setCurrentDateSelection} value={currentDateSelection}></DateSelection>
                </div>
            </div>
            <div className="w-full">
                <Divider className="border-gray-600 m-0"></Divider>
            </div>
            <div className="grid grid-cols-3 grid-rows-1 divide-x divide-gray-500 mt-4">
                <MetricCard title={'Customers'} stat={userCounts?.data[1].count}></MetricCard>
                <MetricCard title={'Managers'} stat={userCounts?.data[2].count}></MetricCard>
                <MetricCard title={'Admins'} stat={userCounts?.data[0].count}></MetricCard>
            </div>
            <DailyTicketChart data={dailyTicketCount}></DailyTicketChart>
            <DailyRevenueChart data={dailyTicketRevenue}></DailyRevenueChart>
        </>
    );
};

export default AdminDashboard;
