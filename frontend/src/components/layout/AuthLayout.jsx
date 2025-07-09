import React from "react";
import { Outlet } from "react-router-dom";

function AuthLayout() {
    return (
        <div>
            <p>AuthLayout</p>
            <Outlet />
        </div>
    );
}

export default AuthLayout;
