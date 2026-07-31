import { create } from "zustand";
import api from "../services/api";
import useAuthStore from "./useAuthStore";

const usePlanStore = create((set, get) => ({
  plans: [],
  loading: false,

  getPlan: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/plans");
      if (res?.data?.success === true) {
        set((state) => ({
          ...state,
          plans: res.data.data,
          loading: false,
        }));
        return { success: true };
      }

      set({ loading: false });
      return { success: false, message: "unexpected response from server" };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: "fetch plans failed" };
    }
  },

  upgradePlan: async (planId) => {
    set({ loading: true });
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
      const errorMsg = error.response?.data?.message || "Upgrade plan failed";
      return { success: false, message: errorMsg };
    } finally {
      set({ loading: false });
    }
  },
}));

export default usePlanStore;
