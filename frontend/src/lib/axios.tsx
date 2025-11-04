import Axios from "axios";

const axios = Axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001/api",
  withCredentials: true,
  timeout: 10000,
  headers: { "Content-Type": "application/json" },
});

// Attach token automatically (use the correct key)
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // <— fixed
  if (token) {
    if (!config.headers) {
      config.headers = {} as any;
    }
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Optional: normalize API errors
axios.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err?.response?.data?.message ||
      err?.message ||
      "Something went wrong";
    return Promise.reject(new Error(message));
  }
);

export default axios;
