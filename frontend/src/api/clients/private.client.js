import axios from "axios";
import queryString from "query-string";
import { logout } from "../../redux/features/auth.slice.js";

const baseURL = import.meta.env.VITE_API_URL;

// Create a singleton instance
const privateClient = axios.create({
    baseURL,
    paramsSerializer: {
        encode: (params) => queryString.stringify(params),
    },
});

// Add request interceptor
privateClient.interceptors.request.use(
    async (config) => {
        config.headers = {
            ...config.headers,
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("actkn")}`,
        };
        return config;
    },
    (error) => Promise.reject(error)
);

// Add response interceptor
privateClient.interceptors.response.use(
    (response) => {
        if (response && response.data) return response.data;
        return response;
    },
    (error) => {
        if (error.response?.status === 401 || error.response?.status === 403) {
            console.warn("Authentication error: Token expired or invalid");
            store.dispatch(logout()); // Use store.dispatch instead of passing dispatch
            window.location.href = "/auth/signin";
        }
        throw error.response?.data || error;
    }
);

export default privateClient;