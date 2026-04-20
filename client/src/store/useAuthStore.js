import { create } from "zustand";
import api from "../services/api";
const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  isInitialized: false, //use when check that Have finished process yet?

  login: async (formData) => {
    set({ loading: true });
    try {
      if (!formData?.email?.trim() || !formData?.password?.trim()) {
        set({ loading: false });
        return { success: false, message: "Please fill in all fields" };
      }

      const res = await api.post("/auth/login", formData);

      if (res?.data?.user && res?.data?.token) {
        localStorage.setItem("token", res.data.token);

        set({
          user: res.data.user,
          isAuthenticated: true,
          loading: false,
        });

        return { success: true };
      }

      set({ loading: false });
      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error?.response?.data?.message || "Login failed",
      };
    }
  },

  register: async (formData) => {
    set({ loading: true });

    try {
      const res = await api.post("/auth/register", formData)

      if(res?.data?.user && res?.data?.token){
        localStorage.setItem("token", res.data.token)
        set({ user:res.data.user, isAuthenticated: true, loading: false})
        
        return { success: true };
      }

      set({loading: false})
      return {success: false, message:"Unexpected response from server"}
    } catch (error) {
      set({loading: false})
      return {success: false, message: error?.response?.data?.message || "register failed"}
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false, loading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      set({ isAuthenticated: false, loading: false , isInitialized: true});
      return;
    }

    try {
      const res = await api.get("/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: res.data.user, isAuthenticated: true, loading: false, isInitialized: true });
    } catch (error) {
      localStorage.removeItem("token");
      set({ user: null, isAuthenticated: false, loading: false, isInitialized: true});
    }
  },
}));

export default useAuthStore;
