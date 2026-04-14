import { create } from "zustand";
import axios from "axios";
const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  loading: true,

  login: (userData, token) => {
    localStorage.setItem("token", token);
    set({ user: userData, isAuthenticated: true, loading: false });
  },

  logout: () => {
    localStorage.removeItem("token");
    set({ user: null, isAuthenticated: false, loading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      set({ isAuthenticated: false, loading: false });
      return;
    }

    try {
      const res = await axios.get("/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({ user: res.data.user, isAuthenticated: true, loading: false });
    } catch (error) {
      localStorage.removeItem("token");
      set({ user: null, isAuthenticated: false, loading: false });
    }
  }
}));


export default useAuthStore;