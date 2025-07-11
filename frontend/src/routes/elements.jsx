import { PATH } from "./path";
import { useRoutes } from "react-router-dom";
import HomeLayout from "../components/layout/HomeLayout";
import AuthLayout from "../components/layout/AuthLayout";
import HomePage from "../pages/HomePage";
import SignupPage from "../pages/auth/SignupPage";
import NotFound from "../pages/NotFound";
import MovieDetails from "../pages/MovieDetails";
import Booking from "../pages/Booking";
import Movies from "../pages/Movies";
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