import {
    PATH,
    AUTH_PATH,
    ADMIN_PATH,
    MANAGER_PATH,
    CUSTOMER_PATH,
} from "./path";
import { useRoutes, Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { ROLE } from "../constants/role.js";

// Admin pages
import AdminLayout from "../pages/admin/Layout/AdminLayout.jsx";
import AdminDashboard from "../pages/admin/Dashboard/AdminDashboard.jsx";
import UserManagement from "../pages/admin/UserManagement.jsx";
import TheaterManagement from "../pages/admin/Theaters/Theater.jsx";
import MovieManagement from "../pages/admin/Movies/Movies.jsx";
import ShowManagement from "../pages/admin/ShowManagement.jsx";

// Manager pages
import ManagerLayout from "../pages/manager/ManagerLayout.jsx";
import ManagerDashboard from "../pages/manager/ManagerDashboard.jsx";
import TheaterDashboard from "../pages/manager/TheaterDashboard.jsx";
import RoomsDashboard from "../pages/manager/RoomsDashboard.jsx";
import RevenueDashboard from "../components/revenue/RevenueDashboard.jsx";

// Customer pages
import MovieDetails from "../pages/customer/MovieDetails.jsx";
import Booking from "../pages/customer/Booking.jsx";
import Movies from "../pages/customer/Movies.jsx";
import HomePage from "../pages/customer/HomePage.jsx";
import SeatSelection from "../pages/customer/SeatSelection.jsx";
import MyTickets from "../pages/customer/MyTickets.jsx";
import TechnicalSupportPage from "../pages/customer/Technical.jsx";
import TheaterSystem from "../pages/customer/TheaterSystem.jsx";
import Theater from "../pages/customer/Theater.jsx";

// Layouts
import HomeLayout from "../components/layout/HomeLayout";
import AuthLayout from "../components/layout/AuthLayout";

// Auth pages
import SignupPage from "../pages/auth/SignupPage";
import SigninPage from "../pages/auth/SigninPage";
import VerifyMailPage from "../pages/auth/VerifyEmailPage";

// General pages
import ProfilePage from "../pages/Profile.jsx";
import NotFound from "../pages/NotFound";

function useAuth() {
  const { isAuthenticated, user, status } = useSelector((s) => s.auth);
  return {
    isAuthenticated,
    role: user?.role ?? null,
    loading: status === "loading" || status === "initializing",
  };
}

function RoleRedirect({
  fallback = `${PATH.CUSTOMER}${CUSTOMER_PATH.HOME || ""}`,
}) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated || !role) return <Navigate to={fallback} replace />;

  if (role === ROLE.ADMIN) return <Navigate to={`${PATH.ADMIN}`} replace />;
  if (role === ROLE.THEATERMANAGER)
    return <Navigate to={`${PATH.MANAGER}`} replace />;
  return <Navigate to={`${PATH.CUSTOMER}`} replace />;
}

const useRouterElements = () => {
  const elements = useRoutes([
    { path: "/", element: <RoleRedirect /> },
    {
      path: PATH.CUSTOMER,
      element: <HomeLayout />,
      children: [
        {
          path: CUSTOMER_PATH.HOME,
          element: <HomePage />,
        },
        {
          path: CUSTOMER_PATH.PROFILE,
          element: <ProfilePage />,
        },
        {
          path: `${CUSTOMER_PATH.MOVIE_DETAILS}/:id`,
          element: <MovieDetails />,
        },
        {
          path: `${CUSTOMER_PATH.BOOKING}`,
          element: <Booking />,
        },
        {
          path: `${CUSTOMER_PATH.BOOKING}/:movieId`,
          element: <Booking />,
        },
        {
          path: `${CUSTOMER_PATH.BOOKING}/show/:showId`,
          element: <SeatSelection />,
        },
        {
          path: `${CUSTOMER_PATH.SUPPORT}`,
          element: <TechnicalSupportPage />,
        },
        {
          path: "/my-tickets",
          element: <MyTickets />,
        },
        {
          path: `${CUSTOMER_PATH.THEATER_SYSTEMS}/:id`,
          element: <TheaterSystem />,
        },
        {
          path: `${CUSTOMER_PATH.THEATER}/:theaterId`,
          element: <Theater />,
        },
        {
          path: `${CUSTOMER_PATH.MOVIES}/:status?`,
          element: <Movies />,
        },
      ],
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
          element: <UserManagement />,
        },
        {
          path: ADMIN_PATH.SHOWS,
          element: <ShowManagement />,
        },
        {
          path: ADMIN_PATH.MOVIES,
          element: <MovieManagement />,
        },
        {
          path: ADMIN_PATH.THEATERS,
          element: <TheaterManagement />,
        },
      ],
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
          path: MANAGER_PATH.ROOMS,
          element: <RoomsDashboard />,
        },
        {
          path: MANAGER_PATH.THEATERDASHBOARD,
          element: <TheaterDashboard />,
        },
        {
          path: MANAGER_PATH.REVENUE,
          element: <RevenueDashboard />,
        },
      ],
    },
    {
      path: PATH.AUTH,
      element: <AuthLayout />,
      children: [
        {
          path: AUTH_PATH.SIGNIN,
          element: <SigninPage />,
          index: true,
        },
        {
          path: AUTH_PATH.SIGNUP,
          element: <SignupPage />,
        },
        {
          path: AUTH_PATH.VERIFY_EMAIL,
          element: <VerifyMailPage />,
        },
      ],
    },
    {
      path: "*",
      element: <NotFound />,
    },
  ]);

  return elements;
};

export default useRouterElements;
