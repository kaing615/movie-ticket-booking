import axios from "axios";
import queryString from "query-string";

const baseURL = import.meta.env.VITE_API_URL;

const publicClient = axios.create({
	baseURL,
	paramsSerializer: {
		encode: (params) => queryString.stringify(params),
	},
});

publicClient.interceptors.request.use(
	(config) => {
		config.headers = {
			...config.headers,
			"Content-Type": "application/json",
		};
		return config;
	},
	(error) => Promise.reject(error)
);

publicClient.interceptors.response.use(
	(response) => response?.data || response,
	(error) => {
		// Xử lý lỗi chung
		throw error?.response?.data || error;
	}
);

export default publicClient;
