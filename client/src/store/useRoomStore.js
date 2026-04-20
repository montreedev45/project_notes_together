import { create } from "zustand";
import api from "../services/api";

const useRoomStore = create((set) => ({
  rooms: [],
  loading: false,

  getMyRooms: async () => {
    set({ loading: true });

    try {
      const res = await api.get("/rooms");

      if (res?.data) {
        set({ rooms: res.data, loading: false });
        return { success: true };
      }

      set({ loading: false });
      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      set({ loading: false });
      return {
        success: false,
        message: "Fetch rooms failed",
      };
    }
  },

  createRoom: async (data) => {
    set({ loading: true });

    try {
      const res = await api.post("/rooms", data);

      if (res?.data) {
        set((state) => ({ rooms: [res.data, ...state.rooms], loading: false }));
        return { success: true };
      }

      set({ loading: false });
      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: "Fetch rooms failed" };
    }
  },
}));

export default useRoomStore;
