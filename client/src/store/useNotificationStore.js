import { create } from "zustand";
import api from "../services/api";
import useRoomStore from "./useRoomStore"; // นำเข้าเพื่อใช้ getState

const useNotificationStore = create((set, get) => ({
  notifications: [],
  loading: false,

  getNotifications: async () => {
    set({ loading: true });
    try {
      const res = await api.get("/notifications");
      if (res?.data) {
        set({ notifications: res.data, loading: false });
        return { success: true };
      }
      set({ loading: false });
      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: "Fetch notification failed" };
    }
  },

  addNotification: (newNotic) => {
    //recentRooms unnecessary

    set((state) => ({
      notifications: [newNotic, ...state.notifications],
    }));

    // อัปเดตข้อมูลข้ามไปที่ RoomStore
    if (newNotic?.type === "JOIN") {
      // ใช้ getState() เพื่อดึงข้อมูลปัจจุบัน และใช้ setState() เพื่อบันทึกค่ากลับไปที่ RoomStore
      const roomStore = useRoomStore.getState();

      const updatedRooms = roomStore.myRooms.map((room) => {
        if (room._id === newNotic.roomId) {
          // ตรวจสอบว่ามี user นี้อยู่ใน members หรือยัง
          const isExist = room.members.some(
            (m) => m.user?._id === newNotic.sender?._id,
          );
          if (isExist) return room;

          // คืนค่าห้องเดิมที่เพิ่มสมาชิกใหม่เข้าไป
          return {
            ...room,
            members: [
              ...room.members,
              { user: newNotic.sender, role: "viewer" },
            ],
          };
        }
        return room;
      });
      useRoomStore.setState({ myRooms: updatedRooms });

      const updatedExplore = roomStore.rooms.map((room) => {
        if (room._id === newNotic.roomId) {
          const isExist = room.members.some(
            (m) => m.user?._id === newNotic?.sender?._id,
          );

          if (isExist) return room;

          return {
            ...room,
            members: [
              ...room.members,
              { user: newNotic.sender, role: "viewer" },
            ],
          };
        }
        return room;
      });

      // บันทึกค่ากลับไปที่ RoomStore โดยตรง
      useRoomStore.setState({ rooms: updatedExplore });
    } else if (newNotic?.type === "LEAVE") {
      const roomStore = useRoomStore.getState();

      const updatedRooms = roomStore.myRooms.map((room) => {
        if (room._id === newNotic.roomId) {
          return {
            ...room,
            members: room.members.filter(
              (m) => m.user?._id !== newNotic?.sender?._id,
            ),
          };
        }
        return room;
      });

      const updatedExplore = roomStore.rooms.map((room) => {
        if (room._id === newNotic.roomId) {
          return {
            ...room,
            members: room.members.filter(
              (m) => m.user?._id !== newNotic?.sender?._id,
            ),
          };
        }
        return room;
      });

      useRoomStore.setState({ myRooms: updatedRooms });
      useRoomStore.setState({ rooms: updatedExplore });
    }
  },

  getUnreadCount: () => {
    return get().notifications.filter((n) => !n.isRead).length;
  },

  markAllAsRead: async () => {
    try {
      const res = await api.put("/notifications/mark-as-read");
      set((state) => ({
        notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      }));
    } catch (error) {
      console.error(error);
    }
  },

  deleteNotification: async (noticId) => {
    set({ loading: true });
    try {
      const res = await api.delete(`/notifications/${noticId}`);

      if (res?.data) {
        set((state) => ({
          notifications: state.notifications.filter((n) => n._id !== noticId),
          loading: false,
        }));
        return { success: true };
      }

      set({ loading: false });
      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: "Delete notification failed" };
    }
  },

  deleteAllNotification: async () => {
    set({loading: true})
    try {
      const res = await api.delete("/notifications/all")

      if(res?.status === 200){
        set((state) => ({...state, notifications: [], loading: false}))
        return {success: true}
      }

      set({loading: false})
      return {success: false, message: "Unexpected response from server"}
    } catch (error) {
      set({loading: false})
      return {success: false, message: "Delete notification failed"}
    }
  }
}));

export default useNotificationStore;
