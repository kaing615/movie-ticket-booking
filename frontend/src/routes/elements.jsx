import { PATH, AUTH_PATH, ADMIN_PATH, MANAGER_PATH, CUSTOMER_PATH } from "./path";
import { useRoutes, Navigate } from "react-router-dom";

//Admin pages
import AdminLayout from "../pages/admin/AdminLayout.jsx";
import AdminDashboard from "../pages/admin/AdminDashboard.jsx";
import UserManagement from "../pages/admin/UserManagement.jsx";

//Manager pages
import ManagerLayout from "../pages/manager/ManagerLayout.jsx";
import ManagerDashboard from "../pages/manager/ManagerDashboard.jsx";
import TheaterDashboard from "../pages/manager/TheaterDashboard.jsx";

//Customer pages
import MovieDetails from "../pages/customer/MovieDetails.jsx";
import Booking from "../pages/customer/Booking.jsx";
import Movies from "../pages/customer/Movies.jsx";
import HomePage from "../pages/customer/HomePage.jsx";

//Layouts
import HomeLayout from "../components/layout/HomeLayout";
import AuthLayout from "../components/layout/AuthLayout";

//Auth pages
import SignupPage from "../pages/auth/SignupPage";
import SigninPage from "../pages/auth/SigninPage";
import VerifyMailPage from "../pages/auth/VerifyEmailPage";

//General pages
import NotFound from "../pages/NotFound";
import ShowManagement from "../pages/admin/ShowManagement.jsx";



const useRouterElements = () => {
    const elements = useRoutes([
        {
            path: "/",
            element: <Navigate to={`${CUSTOMER_PATH.HOME}`} replace />
        },
        {
            path: PATH.CUSTOMER,
            element: <HomeLayout />,
            children: [
                {
                    path: CUSTOMER_PATH.HOME,
                    element: <HomePage />,
                },
                {
                    path: `${CUSTOMER_PATH.MOVIE_DETAILS}/:id`,
                    element: <MovieDetails />,
                },
                {
                    path: `${CUSTOMER_PATH.BOOKING}/:id`,
                    element: <Booking />,
                },
                {
                    path: CUSTOMER_PATH.ONGOING,
                    element: <Movies />,
                },
                {
                    path: CUSTOMER_PATH.COMING_SOON,
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
                },
                {
                    path: ADMIN_PATH.USERS,
                    element: <UserManagement />
                },
                {
                    path: ADMIN_PATH.SHOWS,
                    element: <ShowManagement />
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
                },
                {
                    path: MANAGER_PATH.THEATERDASHBOARD,
                    element: <TheaterDashboard />,
                }
            ]
        },
        {
            path: PATH.AUTH,
            element: <AuthLayout />,
            children: [
                {
                    path: AUTH_PATH.SIGNIN,
                    element: <SigninPage />,
                    index: true
                },
                {
                    path: AUTH_PATH.SIGNUP,
                    element: <SignupPage />,
                },
                {
                    path: AUTH_PATH.VERIFY_EMAIL,
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