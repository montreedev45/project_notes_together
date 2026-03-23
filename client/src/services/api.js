import axios from "axios";
const apiurl = import.meta.env.VITE_SERVER_URL;
//console.log(import.meta.env.VITE_SERVER_URL);

const api = axios.create({
    baseURL: `${apiurl}/api`
})

api.interceptors.request.use((config)=>{
    const token = localStorage.getItem("token");

    if(token){
        config.headers.Authorization = `Bearer ${token}`
    }

    return config;
})

export default api;