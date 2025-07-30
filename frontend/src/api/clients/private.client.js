import axios from "axios";
import queryString from "query-string";
import { logout } from "../../redux/features/auth.slice.js";

const baseURL = import.meta.env.VITE_API_URL;

const createPrivateClient = (dispatch) => {
	// Accept dispatch as an argument
	const privateClient = axios.create({
		baseURL,
		// paramsSerializer: {
		// 	encode: (params) => queryString.stringify(params),
		// },
	});

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

	privateClient.interceptors.response.use(
		(response) => {
			if (response && response.data) {
				return response.data;
			}
			return response;
		},
		async (error) => {
			// Make this async to await dispatch if needed
			if (error.response) {
				// Check for common unauthorized/forbidden status codes
				// You might need to adjust these based on your backend's specific responses
				if (
					error.response.status === 401 ||
					error.response.status === 403
				) {
					console.warn(
						"Authentication error: Token expired or invalid. Logging out..."
					);
					if (dispatch) {
						dispatch(logout());
					}
					window.location.href = "/auth/signin"; // Redirect to login page
				}
			}
			// Re-throw the error so it can be caught by the calling code (e.g., in a try-catch block)
			throw error.response?.data || error; // Prefer server error data, fallback to generic error
		}
	);

	return privateClient;
};

export default createPrivateClient;
