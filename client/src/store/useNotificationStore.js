import { create } from "zustand";
import api from "../services/api";
import useRoomStore from "./useRoomStore"; // นำเข้าเพื่อใช้ getState

const useNotificationStore = create((set, get) => ({
  notifications: [],

  getNotifications: async () => {
    try {
      const res = await api.get("/notifications");
      if (res?.data) {
        set({ notifications: res.data });
        return { success: true };
      }
      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Get Notification failed",
      };
    }
  },

  addNotification: (newNotic) => {
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
    } else if (newNotic?.type === "TRANSFER_OWNER") {
      const roomStore = useRoomStore.getState();

      const updatedRooms = roomStore.myRooms.map((room) => {
        if (room._id === newNotic.roomId) {
          const newOwnerId = newNotic.recipient?._id;
          const oldOwnerId = newNotic.sender?._id;
          const newOwnerData = { user: newNotic.recipient, role: "owner" };

          const isExist = room.members.some((m) => m.user?._id === newOwnerId);

          // 1. จัดการปรับสิทธิ์ในอาร์เรย์ members
          let updatedMembers = room.members.map((m) => {
            // ให้ดาวคนใหม่
            if (m.user?._id === newOwnerId) return { ...m, ...newOwnerData };
            // ปลดดาวคนเก่า (สำคัญมาก ป้องกันกษัตริย์ 2 พระองค์)
            if (m.user?._id === oldOwnerId) return { ...m, role: "editor" };
            return m;
          });

          // 2. ดันคนใหม่เข้าห้อง (กรณีเขาไม่เคยเป็น member มาก่อน)
          if (!isExist) updatedMembers.push(newOwnerData);

          // 3. ประกอบร่างห้องใหม่
          return {
            ...room,
            members: updatedMembers,
            owner: newOwnerData.user, // สลับ Root Owner
          };
        }

        return room;
      });
      useRoomStore.setState({ myRooms: updatedRooms });

      const updatedExplore = roomStore.rooms.map((room) => {
        if (room._id === newNotic.roomId) {
          const newOwnerId = newNotic.recipient?._id;
          const oldOwnerId = newNotic.sender?._id;
          const newOwnerData = { user: newNotic.recipient, role: "owner" };

          const isExist = room.members.some((m) => m.user?._id === newOwnerId);

          // 1. จัดการปรับสิทธิ์ในอาร์เรย์ members
          let updatedMembers = room.members.map((m) => {
            // ให้ดาวคนใหม่
            if (m.user?._id === newOwnerId) return { ...m, ...newOwnerData };
            // ปลดดาวคนเก่า (สำคัญมาก ป้องกันกษัตริย์ 2 พระองค์)
            if (m.user?._id === oldOwnerId) return { ...m, role: "editor" };
            return m;
          });

          // 2. ดันคนใหม่เข้าห้อง (กรณีเขาไม่เคยเป็น member มาก่อน)
          if (!isExist) updatedMembers.push(newOwnerData);

          // 3. ประกอบร่างห้องใหม่
          return {
            ...room,
            members: updatedMembers,
            owner: newOwnerData.user, // สลับ Root Owner
          };
        }

        return room;
      });
      // บันทึกค่ากลับไปที่ RoomStore โดยตรง
      useRoomStore.setState({ rooms: updatedExplore });
    }
  },

  markAllAsRead: async () => {
    try {
      const res = await api.put("/notifications/mark-as-read");
      if (res.status === 200) {
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            isRead: true,
          })),
        }));
        return { success: true };
      }
      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Mark as read failed",
      };
    }
  },

  deleteNotification: async (noticId) => {
    try {
      const res = await api.delete(`/notifications/${noticId}`);

      if (res?.data) {
        set((state) => ({
          notifications: state.notifications.filter((n) => n._id !== noticId),
        }));
        return { success: true };
      }

      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Delete notification failed",
      };
    }
  },

  deleteAllNotification: async () => {
    try {
      const res = await api.delete("/notifications/all");

      if (res?.status === 200) {
        set((state) => ({ ...state, notifications: [] }));
        return { success: true };
      }

      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Delete notification failed",
      };
    }
  },
}));

export default useNotificationStore;
