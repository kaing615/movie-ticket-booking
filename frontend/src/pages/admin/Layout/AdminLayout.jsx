import React from "react";
import { Outlet } from "react-router-dom";
import AdminSidebar from "./subcomponents/Sidebar";
const AdminLayout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* Sidebar */}
            <AdminSidebar />
            {/* Main content */}
            <main className="flex-1 p-8 overflow-y-auto min-h-screen">
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;
