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

      if (res?.data?.user && res?.data?.token) {
        localStorage.setItem("token", res.data.token);
        set({ user: res.data.user, isAuthenticated: true, loading: false });

        return { success: true };
      }

      set({ loading: false });
      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: error?.response?.data?.message || "register failed",
      };
    }
  },

  updateProfile: async (data) => {
    set({ loading: true });

    try {
      const res = await api.put(`/auth/profile`, data);

      if (res?.data) {
        if (res?.data?.user && res?.data?.newToken) {
          localStorage.setItem("token", res.data.newToken);
          set({ user: res.data.user, loading: false });
          return { success: true };
        }
      }

      set({ loading: false });
      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: "Update profile failed" };
    }
  },

  changePassword: async (formData) => {
    set({ loading: true });
    try {
      const res = await api.put("/auth/change-password", formData);

      if (res?.data) {
        set({ loading: false });
        return { success: true };
      }

      set({ loading: false });
      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: "change password failed" };
    }
  },

  checkDuplicateEmail: async (formData) => {
    try {
      const res = await api.post("/auth/check-duplicate-email", formData);
      if (res?.data) {
        localStorage.setItem("temporalyToken", res.data.temporalyToken);
        return { success: true };
      }
      return { success: false };
    } catch (error) {
      return { success: false };
    }
  },

  changeEmail: async (formData) => {
    set({ loading: true });
    try {
      const res = await api.post("/auth/change-email", formData);

      if (res?.data) {
        localStorage.setItem("token", res.data.token);
        set({ user: res.data.user, loading: false });
        return { success: true };
      }

      set({ loading: false });
      return { success: false };
    } catch (error) {
      set({ loading: false });
      return { success: false };
    }
  },

  deleteAccount: async () => {
    set({ loading: true });
    try {
      const res = await api.delete("/auth/delete-account");

      if (res?.data) {
        set({ loading: false, user: null, isAuthenticated: false });
        return { success: true };
      }

      set({ loading: false });
      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      set({ loading: false });
      return { success: false };
    }
  },

  
  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("newEmail");
    localStorage.removeItem("recent-rooms");
    localStorage.removeItem("temporalyToken");
    localStorage.removeItem("verificationCode");
    set({ user: null, isAuthenticated: false, loading: false });
  },

  checkAuth: async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      set({ isAuthenticated: false, loading: false, isInitialized: true });
      return;
    }

    try {
      const res = await api.get("/auth/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });
      set({
        user: res.data.user,
        isAuthenticated: true,
        loading: false,
        isInitialized: true,
      });
    } catch (error) {
      localStorage.removeItem("token");
      set({
        user: null,
        isAuthenticated: false,
        loading: false,
        isInitialized: true,
      });
    }
  },
}));

export default useAuthStore;
