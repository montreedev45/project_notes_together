import { create } from "zustand";
import api from "../services/api";

const initialState = {
  rooms: [],
  loading: false,
};

const useRoomStore = create((set) => ({
  ...initialState,
  rooms: [],
  loading: false,

  getMyRooms: async (criteria="all", searchTerm="room") => {
    set({ loading: true });
    try {
      const res = await api.post("/rooms/my-rooms", {criteria, searchTerm});

      if (res?.data) {
        set({ rooms: res.data, loading: false });
        return { success: true };
      }

      set({ loading: false });
      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      alert(error.message)
      set({ loading: false });
      return {
        success: false,
        message: "Fetch rooms failed",
      };
    }
  },

  getAllRooms: async (criteria="all", searchTerm="room") => {
    set({ loading: true });
    try {
      const res = await api.post("/rooms/all-rooms", {criteria, searchTerm});

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

  joinRoom: async (code = "", roomId = "") => {
    set({ loading: true });
    try {
      const finalData = {
        code: code,
        roomId: roomId,
      };

      console.log("roomId", roomId);
      console.log("code", code);
      console.log("finalData", finalData);

      const res = await api.post("/rooms/join", finalData);

      if (res?.data) {
        set((state) => ({ rooms: [res.data, ...state.rooms], loading: false }));
        return { success: true };
      }

      set({ loading: false });
      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: "join room failed" };
    }
  },

  resetRoomStore: () => set(initialState),
}));

export default useRoomStore;
