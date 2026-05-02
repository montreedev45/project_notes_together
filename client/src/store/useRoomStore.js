import { create } from "zustand";
import api from "../services/api";

const initialState = {
  rooms: [], //explore page
  myRooms: [],
  recentRooms: [],
  trashRooms: [],
  loading: false,
};

const useRoomStore = create((set) => ({
  ...initialState,
  rooms: [],
  myRooms: [],
  recentRooms: JSON.parse(localStorage.getItem("recent-rooms") || "[]"),
  trashRooms: [],
  loading: false,

  getMyRooms: async (criteria = "all", searchTerm = "") => {
    set({ loading: true });
    try {
      const res = await api.post("/rooms/my-rooms", { criteria, searchTerm });

      if (res?.data) {
        set({ myRooms: res.data, loading: false });
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

  getAllRooms: async (criteria = "all", searchTerm = "") => {
    set({ loading: true });
    try {
      const res = await api.post("/rooms/all-rooms", { criteria, searchTerm });

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

  getRecentRooms: (criteria = "all", searchTerm = "", userId = "") => {
    set((state) => {
      const allRecentRooms = JSON.parse(
        localStorage.getItem("recent-rooms") || "[]",
      );

      //search feature
      let filterRooms = allRecentRooms.filter((r) =>
        r.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );

      //filter feature
      if (criteria === "owner") {
        filterRooms = filterRooms.filter((r) => r.owner?._id === userId);
      } else if (criteria === "private") {
        filterRooms = filterRooms.filter((r) => r.isPrivate === true);
      } else if (criteria === "public") {
        filterRooms = filterRooms.filter((r) => r.isPrivate === false);
      } else if (criteria === "joined") {
        filterRooms = filterRooms.filter((r) =>
          r.members?.some((m) => (m.user?._id || m.user) === userId),
        );
      }

      return { recentRooms: filterRooms };
    });
  },

  clearRecentRooms: () => {
    localStorage.removeItem("recent-rooms");

    set({ recentRooms: [] });
  },

  // save recent room
  saveToRecent: (room) => {
    if (!room || !room._id) return; // กันพังถ้าข้อมูลไม่ครบ

    set((state) => {
      const maxRecent = 5;

      // 1. ดึงข้อมูลจาก State ปัจจุบัน (ชัวร์กว่าดึงจาก LocalStorage ตรงๆ)
      // ถ้า state.recentRooms ยังไม่มีค่า ให้เริ่มด้วย Array ว่าง
      const currentRecent = Array.isArray(state.recentRooms)
        ? state.recentRooms
        : [];

      // 2. กรองห้องเดิมออกเพื่อป้องกันการซ้ำ
      const filtered = currentRecent.filter((r) => r._id !== room._id);

      // 3. หม่ใส่หน้าสุด และตัดเหลือ 5
      const updated = [room, ...filtered].slice(0, maxRecent);

      // 4. บันทึกลง LocalStorage (สะกด Key ให้ตรงกัน)
      localStorage.setItem("recent-rooms", JSON.stringify(updated));

      // 5. อัปเดต State ใน Zustand
      return { recentRooms: updated };
    });
  },

  createRoom: async (data) => {
    set({ loading: true });

    try {
      const res = await api.post("/rooms", data);

      if (res?.data) {
        set((state) => ({
          rooms: [res.data, ...state.rooms],
          myRooms: [res.data, ...state.myRooms],
          loading: false,
        }));
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
        set((state) => ({
          myRooms: [res.data, ...state.myRooms],
          rooms: state.rooms.map((r) =>
            r._id === res.data._id ? res.data : r,
          ),
        }));

        useRoomStore.getState().saveToRecent(res.data);

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
          myRooms: state.myRooms.filter((r) => r._id !== roomId),
          rooms: state.rooms.map((r) =>
            r._id === roomId
              ? {
                  ...r,
                  members: r.members.filter((m) => m.user._id !== userId),
                }
              : r,
          ),
          loadaing: false,
        }));
        return { success: true };
      }

      set({ loading: false });
      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      set({ loadaing: false });
      return { success: false, message: "leave room failed" };
    }
  },

  deleteRoom: async (roomId) => {
    try {
      const res = await api.post(`/rooms/delete/${roomId}`);

      if (res.status === 200) {
        set((state) => ({
          myRooms: state.myRooms.filter((r) => r._id !== roomId),
          rooms: state.rooms.filter((r) => r._id !== roomId),
          recentRooms: state.recentRooms.filter((r) => r._id !== roomId),
          trashRooms: [res.data, ...state.trashRooms]
        }));

        //manage localstorage
        const currentRecent = JSON.parse(
          localStorage.getItem("recent-rooms") || "[]",
        );
        const updatedRecent = currentRecent.filter((r) => r._id !== roomId);
        localStorage.setItem("recent-rooms", JSON.stringify(updatedRecent));

        return { success: true };
      }

      return { success: false, message: "unexpected response from server" };
    } catch (error) {}
  },

  getTrashRooms: async (searchTerm = "") => {
    set({ loading: true });
    try {
      const res = await api.get(`/rooms/trash?searchTerm=${searchTerm}`);
      if (res?.data) {
        set({ trashRooms: res.data, loading: false });
        return { success: true };
      }

      set({ loading: false });
      return { success: false, message: "unexpected response from server" };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: "fetch trash rooms failed" };
    }
  },

  restoreRoom: async (roomId) => {
    try {
      const res = await api.post(`rooms/restore/${roomId}`);
      if (res?.data) {
        set((state) => ({
          rooms: [res.data, ...state.rooms],
          myRooms: [res.data, ...state.myRooms],
          trashRooms: state.trashRooms.filter((r) => r._id !== roomId),
        }));
      }
    } catch (error) {
      return { success: false, message: "restore room failed" };
    }
  },

  permanentlyDelete: async (roomId) => {
    try {
      const res = await api.delete(`/rooms/permanent/${roomId}`);
      set((state) => ({
        rooms: state.rooms.filter((r) => r._id !== roomId),
        myRooms: state.rooms.filter((r) => r._id !== roomId),
        trashRooms: state.trashRooms.filter((r) => r._id !== roomId),
      }));
    } catch (error) {
      return { success: false, message: "restore room failed" };
    }
  },

  updateRoomLocal: (roomId, newData) => {
    set((state) => ({
      myRooms: state.myRooms.map((r) =>
        r._id === roomId ? { ...r, ...newData } : r,
      ),
    }));
  },

  resetRoomStore: () => set(initialState),
}));

export default useRoomStore;
