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

  privateClient.interceptors.request.use((config) => {
    const token = localStorage.getItem("actkn");
    config.headers = {
      ...config.headers,
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    return config;
  });

  privateClient.interceptors.response.use(
    (response) => response?.data ?? response,
    async (error) => {
      if (
        error?.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        console.warn("Auth error -> logout");
        if (dispatch) dispatch(logout());
        window.location.href = "/auth/signin";
      }
      // Quan trọng: rethrow nguyên lỗi để nơi gọi đọc được status, data...
      return Promise.reject(error);
    }
  );

  return privateClient;
};

export default createPrivateClient;
