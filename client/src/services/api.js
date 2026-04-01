import axios from "axios";
const apiurl = import.meta.env.VITE_SERVER_URL;
//console.log(import.meta.env.VITE_SERVER_URL);

const api = axios.create({
  baseURL: `${apiurl}/api`,
});

// attech token every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 500) {
      const currentPath = window.location.pathname;
      console.log("api interceptor: ", currentPath)
      window.location.href = `/500?from=${encodeURIComponent(currentPath)}`;
    }

    return Promise.reject(error);
  },
);

export default api;
