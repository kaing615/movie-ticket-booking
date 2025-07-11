import React from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/features/auth.slice.js";

const AdminLayout = () => {
    const dispatch = useDispatch();
    return (
        <div className="flex h-screen">
            <div className="w-64 bg-gray-200 p-4">
                <h1 className="text-2xl font-bold mb-4">Admin Layout</h1>
                <ul>
                    <li>
                        <a href="/admin/dashboard">Dashboard</a>
                    </li>
                    <li>
                        <a href="/admin/users">Users</a>
                    </li>
                    <li>
                        <a href="/admin/theaters">Theaters</a>
                    </li>
                    <li>
                        <a href="/admin/movies">Movies</a>
                    </li>
                    <li>
                        <button onClick={() => dispatch(logout())} className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded">Logout</button>
                    </li>
                </ul>
            </div>
            <div className="flex-1 p-4">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
