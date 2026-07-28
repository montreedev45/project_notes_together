import { create } from "zustand";
import api from "../services/api";
const useAuthStore = create((set) => ({
  users: [],
  user: null,
  token: null,
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

  updateUserProfile: async (updatedData) => {
    try {
      console.log("formdata", updatedData)
      const response = await api.put('auth/profile', updatedData);
      console.log("response", response)

      const { user, token } = response.data;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      set({ user, token });

      return { success: true };
    } catch (error) {
      throw error.response?.data?.message || 'Update failed';
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

  forgotPassword: async(currentEmail) =>{
    set({loading: true})
    try {
      const res = await api.post("/auth/forgot-password", {currentEmail})

      if(res.data.success === true){
        set({loading: false})
        return {success: res.data.success, message: res.data.message}
      }

      set({loading: false})
      return {success: false, message: res.data.message}
    } catch (error) {
      set({loading: false})
      return {success: false, message: error.response.data.message}
    }
  },

  resetPassword: async(formData) => {
    set({loading: true})
    try {
      const res = await api.post("/auth/reset-password", formData) 

      if(res?.status === 200){
        return {success: true}
      }
      
      return { success: false, message: res.data.message }
    } catch (error) {
      return {success: false, message: error.response.data.message}
    } finally{
      set({loading: false})
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

      if (res?.status === 200) {
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

  googleLogin: async (credential) => {
    try {
      // ส่ง credential ที่ได้จาก Google ไปให้ Backend
      const res = await api.post('/auth/google', { credential });

      // บันทึก Token / User Info เข้า Zustand Store
      if (res?.data?.user && res?.data?.token) {
        localStorage.setItem("token", res.data.token);
        console.log("res.data.user", res.data.user)

        set({
          user: res.data.user,
          isAuthenticated: true,
        });

        return { success: true };
      }

      return { success: false, message: "Login failed" };
    } catch (error) {
      console.error('Google Login Error:', error.response?.data || error.message);
      throw error;
    } finally {
      loading: false;
    }
  },

  setUser: (userData) => {
    set({user: userData})
  },

  clearUsers: ()=> set({ users: []}),
  
  
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

      console.log("##", res.data)
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
