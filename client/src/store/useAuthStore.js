import { create } from "zustand";
import api from "../services/api";
import useRoomStore from "../store/useRoomStore";
import { disconnectSocket } from "../socket";

const useAuthStore = create((set) => ({
  users: [],
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  isInitialized: false, //use when check that Have finished process yet?

  login: async (formData) => {
    try {
      if (!formData?.email?.trim() || !formData?.password?.trim()) {
        return { success: false, message: "Please fill in all fields" };
      }

      const res = await api.post("/auth/login", formData);

      if (res?.data?.user && res.status === 200) {
        localStorage.setItem("token", res.data.token);
        set({
          user: res?.data?.user,
          isAuthenticated: true,
        });
        return { success: true };
      }

      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Login failed",
      };
    }
  },

  register: async (formData) => {
    try {
      if (
        !formData?.username?.trim() ||
        !formData?.email?.trim() ||
        !formData?.password?.trim() ||
        !formData?.confirmPassword?.trim()
      ) {
        return { success: false, message: "Please fill in all fields" };
      }

      if (formData?.password !== formData?.confirmPassword) {
        return {
          success: false,
          message: "Please try again: password is not match",
        };
      }

      const res = await api.post("/auth/register", formData);

      if (res?.data?.user && res.status === 201) {
        localStorage.setItem("token", res.data.token);
        set({ user: res.data.user, isAuthenticated: true });
        return { success: true };
      }

      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Register failed",
      };
    }
  },

  updateUserProfile: async (updatedData) => {
    try {
      const res = await api.put("auth/profile", updatedData);
      const { user } = res.data;

      if (res?.data?.user && res?.status === 200) {
        localStorage.setItem("user", JSON.stringify(user));
        set({ user: user });
        return { success: true };
      }

      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Update failed",
      };
    }
  },

  changePassword: async (formData) => {
    try {
      const res = await api.put("/auth/change-password", formData);
      if (res?.data && res?.status === 200) {
        return { success: true };
      }

      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Update failed",
      };
    }
  },

  forgotPassword: async (currentEmail) => {
    try {
      const res = await api.post("/auth/forgot-password", { currentEmail });

      if (res.data.success === true) {
        return { success: res.data.success, message: res.data.message };
      }

      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Forgot password failed",
      };
    }
  },

  resetPassword: async (formData) => {
    try {
      const res = await api.post("/auth/reset-password", formData);

      if (res?.status === 200) {
        return { success: true };
      }

      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Reset password failed",
      };
    }
  },

  checkDuplicateEmail: async (formData) => {
    try {
      const res = await api.post("/auth/check-duplicate-email", formData);
      if (res?.data) {
        localStorage.setItem("temporalyToken", res.data.temporalyToken);
        return { success: true };
      }
      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Register failed",
      };
    }
  },

  changeEmail: async (formData) => {
    try {
      const res = await api.post("/auth/change-email", formData);
      if (res?.data?.user && res?.status === 200) {
        set({ user: res.data.user });
        return { success: true };
      }

      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Register failed",
      };
    }
  },

  deleteAccount: async () => {
    try {
      const res = await api.delete("/auth/delete-account");

      if (res?.data) {
        set({ user: null, isAuthenticated: false });
        return { success: true };
      }

      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Delete account failed",
      };
    }
  },

  getUser: async (searchTerm) => {
    try {
      const res = await api.post("/auth/users", { searchTerm });
      if (res?.data) {
        set({ users: res.data });
        return { success: true };
      }

      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return { success: false };
    }
  },

  googleLogin: async (access_token) => {
    try {
      const res = await api.post("/auth/google", { access_token });
      // บันทึก Token / User Info เข้า Zustand Store
      if (res?.data?.user && res?.status === 200) {
        set({
          user: res.data.user,
          isAuthenticated: true,
        });

        return { success: true };
      }

      return { success: false, message: "Login failed" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Google login failed",
      };
    }
  },

  setUser: (userData) => {
    set({ user: userData });
  },

  clearUsers: () => set({ users: [] }),

  logout: async () => {
    try {
      const res = await api.post("/auth/logout");
      if (res.status === 200) {
        localStorage.removeItem("token");
        localStorage.removeItem("newEmail");
        localStorage.removeItem("recent-rooms");
        localStorage.removeItem("temporalyToken");
        localStorage.removeItem("verificationCode");
        set({ user: null, isAuthenticated: false, loading: false });

        useRoomStore.getState().resetRoomStore();
        disconnectSocket();
        return { success: true };
      }
    } catch (error) {
      console.log("error", error);
    }
  },

  checkAuth: async () => {
    try {
      const res = await api.get("/auth/verify");
      set({
        user: res.data.user,
        isAuthenticated: true,
        loading: false,
        isInitialized: true,
      });
    } catch (error) {
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
