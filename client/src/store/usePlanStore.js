import { create } from "zustand";
import api from "../services/api";
import useAuthStore from "./useAuthStore";

const usePlanStore = create((set, get) => ({
  plans: [],

  getPlan: async () => {
    try {
      const res = await api.get("/plans");
      if (res?.data?.success === true) {
        set((state) => ({
          ...state,
          plans: res.data.data,
        }));
        return { success: true };
      }

      return { success: false, message: "unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Get plan failed",
      };
    }
  },

  upgradePlan: async (planId) => {
    try {
      const res = await api.post("/auth/upgrade-plan", { planId });

      if (res.data?.success && res.status === 200) {
        if (res.data.user) {
          useAuthStore.getState().setUser(res.data.user);
        }

        return {
          success: true,
          message: res.data.message || "Plan upgraded successfully!",
        };
      }

      return {
        success: false,
        message: res.data?.message || "Unexpected response from server",
      };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Update plan failed",
      };
    }
  },
}));

export default usePlanStore;
