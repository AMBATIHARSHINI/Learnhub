import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8000",
});

/* 🛡️ ALWAYS attach token */
axiosInstance.interceptors.request.use((cfg) => {
  const tk = localStorage.getItem("token");
  if (tk) cfg.headers.Authorization = `Bearer ${tk}`;
  return cfg;
});

export default axiosInstance;
