import { PATH, ADMIN_PATH, MANAGER_PATH } from "./path";
import { useRoutes } from "react-router-dom";


import AdminLayout from "../pages/admin/AdminLayout.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";

import ManagerLayout from "../pages/manager/ManagerLayout.jsx";
import ManagerDashboard from "../pages/manager/ManagerDashboard.jsx";


import HomeLayout from "../components/layout/HomeLayout";
import AuthLayout from "../components/layout/AuthLayout";
import HomePage from "../pages/HomePage";
import SignupPage from "../pages/auth/SignupPage";
import NotFound from "../pages/NotFound";
import MovieDetails from "../pages/customer/MovieDetails.jsx";
import Booking from "../pages/customer/Booking.jsx";
import Movies from "../pages/customer/Movies.jsx";
import SigninPage from "../pages/auth/SigninPage";
import VerifyMailPage from "../pages/auth/VerifyEmailPage";



const useRouterElements = () => {
    const elements = useRoutes([
        {
            path: PATH.HOME,
            element: <HomeLayout />,
            children: [
                {
                    index: true,
                    element: <HomePage />,
                },
                {
                    path: `${PATH.MOVIE_DETAILS}/:movieId`,
                    element: <MovieDetails />,
                },
                {
                    path: `${PATH.BOOKING}/:movieId`,
                    element: <Booking />,
                },
                {
                    path: PATH.ONGOING,
                    element: <Movies />,
                },
                {
                    path: PATH.COMING_SOON,
                    element: <Movies />,
                }
            ]
        },
        {
            path: PATH.ADMIN,
            element: <AdminLayout />,
            children: [
                {
                    path: ADMIN_PATH.DASHBOARD,
                    element: <AdminDashboard />,
                }
            ]
        },
        {
            path: PATH.MANAGER,
            element: <ManagerLayout />,
            children: [
                {
                    path: MANAGER_PATH.DASHBOARD,
                    element: <ManagerDashboard />,
                }
            ]
        },
        {
            path: "/auth",
            element: <AuthLayout />,
            children: [
                {
                    path: PATH.SIGNIN,
                    element: <SigninPage />,
                },
                {
                    path: PATH.SIGNUP,
                    element: <SignupPage />,
                },
                {
                    path: PATH.VERIFY_EMAIL,
                    element: <VerifyMailPage />,
                }
            ]
        },
        {
            path: "*",
            element: <NotFound />,
        }
    ]);

    return elements;
};

export default useRouterElements;