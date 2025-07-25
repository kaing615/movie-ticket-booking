import { adminAnalyticsApi } from "../../../api/modules/adminAnalytics.api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { Divider, Select } from "antd";
import DateSelection from "./subcomponent/DateSelector";

import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween'


dayjs.extend(isBetween)


const AdminDashboard = () => {
    const [currentDateSelection, setCurrentDateSelection] = useState([dayjs().format("YYYY-MM-DD"), dayjs().format("YYYY-MM-DD")]);
    useEffect(() => {
        const { start, end } = currentDateSelection[0] ? { start: currentDateSelection[0], end: currentDateSelection[1] } : { start: dayjs().format("YYYY-MM-DD"), end: dayjs().format("YYYY-MM-DD") };
        console.log(start, end);
    }, [currentDateSelection])
    // Query for User Count by Role
    const { data: userCounts, isLoading: userCountsLoading, error: userCountsError } = useQuery({
        queryKey: ['userCountsByRole'], // Unique key for this query
        queryFn: adminAnalyticsApi.getUserCountByRole,    // The function that fetches the data
    });

    console.log(userCounts);
    if (userCountsLoading) {
        return <div>Loading analytics data...</div>;
    }

    if (userCountsError) {
        return <div>Error loading data:
            {userCountsError?.message}
        </div>;
    }

    // const { DailyTicketCount } = useQuery({
    //     queryKey: ["DailyTicketCount", start, end],
    //     queryFn: () => adminAnalyticsApi.getDailyTicketCount(start, end),
    //     onSuccess: (data) => {
    //         console.log(data);
    //     }
    // })

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
        </>
    );
};

export default AdminDashboard;
