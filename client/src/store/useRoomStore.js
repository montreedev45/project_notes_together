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

      const res = await api.post("/rooms/join", finalData);

      if (res?.data) {
        set((state) => {
          const isExist = state.rooms.find((r) => r._id === res.data._id);

          if (isExist) {
            return {
              rooms: state.rooms.map((r) =>
                r._id === res.data._id ? res.data : r,
              ),
              loading: false,
            };
          } else {
            return {
              rooms: [res.data, ...state.rooms],
              loading: false,
            };
          }
        });
        set({ loading: false });
        return { success: true };
      }
    } catch (error) {
      set({ loading: false });
      return { success: false, message: "join room failed" };
    }
  },

  leaveRoom: async (roomId, userId) => {
    set({ loadaing: true });
    try {
      const res = await api.post("/rooms/leave", { roomId });

      if (res?.data) {
        set((state) => ({
          rooms: state.rooms.filter((r)=> r._id !== roomId),
          loadaing: false,
        }));
        return { success: true };
      }

      set({ loading: false });
      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      set({ loadaing: false });
      return { loadaing: false, message: "leave room failed" };
    }
  },

  resetRoomStore: () => set(initialState),
}));

export default useRoomStore;
