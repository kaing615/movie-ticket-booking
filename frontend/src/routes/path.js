import { Theater, Users } from "lucide-react";

export const PATH = {
	NOT_FOUND: "*",
	AUTH: "/auth",
	ADMIN: "/admin",
	MANAGER: "/manager",
	CUSTOMER: "/",
};

export const AUTH_PATH = {
	SIGNUP: "signup",
	SIGNIN: "signin",
	VERIFY_EMAIL: "verify-email",
};

export const CUSTOMER_PATH = {
	HOME: "home",
	MOVIE_DETAILS: "movie-details",
	BOOKING: "booking",
	ONGOING: "ongoing",
	COMING_SOON: "coming-soon",
};

export const ADMIN_PATH = {
	DASHBOARD: "dashboard",
	USERS: "users",
	THEATERS: "theaters",
	MOVIES: "movies",
	SHOWS: "shows",
};

export const MANAGER_PATH = {
	DASHBOARD: "dashboard",
	THEATERDASHBOARD: "theater-dashboard",
};
