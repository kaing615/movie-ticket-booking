import React from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/features/auth.slice.js";
import { 
    DashboardOutlined,
    UserOutlined,
    VideoCameraOutlined,
    PlayCircleOutlined,
    LogoutOutlined 
} from "@ant-design/icons";

const MENU_ITEMS = [
    {
        path: "/manager/dashboard",
        label: "Dashboard",
        icon: <DashboardOutlined className="text-xl" />
    },
    {
        path: "/manager/users",
        label: "Users",
        icon: <UserOutlined className="text-xl" />
    },
    {
        path: "/manager/theater-dashboard",
        label: "Theaters",
        icon: <VideoCameraOutlined className="text-xl" />
    },
    {
        path: "/manager/movies",
        label: "Movies",
        icon: <PlayCircleOutlined className="text-xl" />
    }
];

const ManagerLayout = () => {
    const dispatch = useDispatch();
    const location = useLocation();

    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-900 to-gray-800">
            {/* Sidebar */}
            <div className="w-64 bg-white/10 backdrop-blur-md">
                {/* Logo Area */}
                <div className="h-16 flex items-center px-6 border-b border-white/10">
                    <h1 className="text-2xl font-bold text-white">Cinema Gate</h1>
                </div>

                {/* Navigation Menu */}
                <div className="p-4">
                    <nav className="space-y-2">
                        {MENU_ITEMS.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                                    ${location.pathname === item.path
                                        ? "bg-orange-500 text-white shadow-lg shadow-orange-500/30"
                                        : "text-gray-300 hover:bg-white/10"
                                    }`}
                            >
                                {item.icon}
                                <span className="font-medium">{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>

                {/* Logout Button */}
                <div className="absolute bottom-0 w-64 p-4 border-t border-white/10">
                    <button
                        onClick={() => dispatch(logout())}
                        className="flex items-center space-x-3 w-full px-4 py-3 text-left text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                        <LogoutOutlined className="text-xl" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-auto">
                <div className="h-16 bg-white/10 backdrop-blur-md border-b border-white/10">
                    <div className="h-full px-6 flex items-center">
                        <h2 className="text-xl font-semibold text-white">
                            {MENU_ITEMS.find(item => item.path === location.pathname)?.label || "Dashboard"}
                        </h2>
                    </div>
                </div>
                
                <div className="p-6">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default ManagerLayout;