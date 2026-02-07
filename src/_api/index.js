import io from "socket.io-client";
import axios from "axios";

const baseURL = "http://localhost:5000";

export const socket = io(baseURL, {
  transports: ["websocket"],
  upgrade: false,
  auth: {
    token: localStorage.getItem("token"),
  },
});

const API = axios.create({
  baseURL,
});

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    } else {
      config.headers["Content-Type"] = "application/json";
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default API;
