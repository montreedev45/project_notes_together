import { create } from "zustand";
import api from "../services/api";

const initialState = {
  rooms: [],
  myRooms: [],
  recentRooms: [],
  trashRooms: [],
  onlineUsersProvider: [],
  relativeTime: {},
  loading: false,
};

const ALLOWED_KEYS = [
  "name",
  "description",
  "color",
  "isPrivate",
  "isOnlineStatus",
  "isLastEditTime",
  "isPeopleJoinRoom",
  "isAllowLinkSharing",
  "isAllowCodeSharing",
];

const useRoomStore = create((set, get) => ({
  ...initialState,
  rooms: [],
  myRooms: [],
  recentRooms: JSON.parse(localStorage.getItem("recent-rooms") || "[]"),
  trashRooms: [],
  onlineUsersProvider: [],
  relativeTime: {},
  loading: false,

  getMyRooms: async (criteria = "all", searchTerm = "") => {
    try {
      const res = await api.post("/rooms/my-rooms", { criteria, searchTerm });

      if (res?.data) {
        set({ myRooms: res.data });
        return { success: true };
      }

      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Get myrooms failed",
      };
    }
  },

  getAllRooms: async (criteria = "all", searchTerm = "") => {
    try {
      const res = await api.post("/rooms/all-rooms", { criteria, searchTerm });

      if (res?.data) {
        set({ rooms: res.data });
        return { success: true };
      }

      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Get all rooms failed",
      };
    }
  },

  getRoomById: async (roomId) => {
    try {
      const res = await api.get(`/rooms/${roomId}`);

      if (res.data.success === true) {
        return { success: true, message: "successfully", data: res.data.room };
      }

      return { success: false };
    } catch (error) {
      return { success: false, message: error.response.data.message };
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
    try {
      const res = await api.post("/rooms", data);
      if (res?.data) {
        set((state) => ({
          rooms: [res.data, ...state.rooms],
          myRooms: [res.data, ...state.myRooms],
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
            : error?.response?.data?.message) || "Create room failed",
      };
    }
  },

  joinRoom: async ({ code = "", roomId = "" }) => {
    try {
      const finalData = {
        code: code,
        roomId: roomId,
      };

      const res = await api.post("/rooms/join", finalData);
      if (res?.data) {
        set((state) => {
          // 1. เช็กก่อนว่าห้องนี้เคยอยู่ใน myRooms แล้วหรือยัง
          const isAlreadyInMyRooms = state.myRooms.some(
            (r) => r._id === res.data._id,
          );

          return {
            // 2. ถ้ามีอยู่แล้ว ให้อัปเดตข้อมูลทับของเดิม / ถ้ายังไม่มี ค่อยเพิ่มเข้าไปด้านหน้าสุด
            myRooms: isAlreadyInMyRooms
              ? state.myRooms.map((r) =>
                  r._id === res.data._id ? res.data : r,
                )
              : [res.data, ...state.myRooms],

            rooms: state.rooms.map((r) =>
              r._id === res.data._id ? res.data : r,
            ),
          };
        });

        useRoomStore.getState().saveToRecent(res.data);
        return { data: res.data, success: true };
      }
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Create room failed",
        status: error.response?.status, // ส่ง 403 กลับไป
      };
    }
  },

  leaveRoom: async (roomId, userId) => {
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
            : error?.response?.data?.message) || "Leave room failed",
      };
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
          trashRooms: [res.data, ...state.trashRooms],
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
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Delete room failed",
      };
    }
  },

  getTrashRooms: async (criteria = "", searchTerm = "") => {
    try {
      const res = await api.get(
        `/rooms/trash?searchTerm=${searchTerm}&criteria=${criteria}`,
      );
      if (res?.data) {
        set({ trashRooms: res.data });
        return { success: true };
      }

      return { success: false, message: "unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Get trash room failed",
      };
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
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Restore room failed",
      };
    }
  },

  permanentlyDelete: async (roomId) => {
    try {
      const res = await api.delete(`/rooms/permanent/${roomId}`);
      if (res.status === 200) {
        set((state) => ({
          rooms: state.rooms.filter((r) => r._id !== roomId),
          myRooms: state.rooms.filter((r) => r._id !== roomId),
          trashRooms: state.trashRooms.filter((r) => r._id !== roomId),
        }));
        return { success: true };
      }

      return { success: false };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) ||
          "Permanently delete room failed",
      };
    }
  },

  permanentlyDeleteAll: async (roomId) => {
    try {
      const res = await api.delete(`/rooms/permanent-all`);
      if (res.data) {
        set({
          trashRooms: [],
        });
      }
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

  updateRoom: async (roomId, newData) => {
    try {
      const targetRoom = newData.find((r) => r._id === roomId) || {};
      // กรองเฉพาะคีย์ที่ตรงกับ ALLOWED_KEYS
      const sanitizedData = Object.keys(targetRoom)
        .filter((key) => ALLOWED_KEYS.includes(key))
        .reduce((obj, key) => {
          obj[key] = targetRoom[key];
          return obj;
        }, {});

      const finalData = {
        roomId: roomId,
        newData: sanitizedData,
      };

      const res = await api.put("/rooms", finalData);

      if (res.data) {
        set((state) => ({
          rooms: state.rooms.map((r) =>
            r._id === roomId ? { ...r, ...res.data } : r,
          ),
          myRooms: state.myRooms.map((r) =>
            r._id === roomId ? { ...r, ...res.data } : r,
          ),
          recentRooms: state.recentRooms.map((r) =>
            r._id === roomId ? { ...r, ...res.data } : r,
          ),
        }));

        const latestRecent = get().recentRooms;

        localStorage.setItem("recent-rooms", JSON.stringify(latestRecent));

        return { success: true };
      }

      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Update room failed",
      };
    }
  },

  updateRole: async (roomId, memberId, role) => {
    try {
      const finalData = {
        roomId,
        memberId,
        role,
      };

      const res = await api.put("/rooms/update-role", finalData);

      if (res?.data) {
        set((state) => ({
          ...state,
          myRooms: state.myRooms.map((r) =>
            r._id === roomId ? { ...r, ...res.data } : r,
          ),
          rooms: state.rooms.map((r) =>
            r._id === roomId ? { ...r, ...res.data } : r,
          ),
          recentRooms: state.recentRooms.map((r) =>
            r._id === roomId ? { ...r, ...res.data } : r,
          ),
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
            : error?.response?.data?.message) || "Update role failed",
      };
    }
  },

  deleteMember: async (roomId, memberId) => {
    try {
      const finalData = {
        roomId,
        memberId,
      };

      const res = await api.put("/rooms/delete-member", finalData);

      if (res?.data) {
        set((state) => ({
          ...state,
          myRooms: state.myRooms.map((r) => (r._id === roomId ? res.data : r)),
          rooms: state.rooms.map((r) => (r._id === roomId ? res.data : r)),
          recentRooms: state.recentRooms.map((r) =>
            r._id === roomId ? res.data : r,
          ),
        }));

        const latestRecent = get().recentRooms;
        localStorage.setItem("recent-rooms", JSON.stringify(latestRecent));

        return { success: true };
      }

      return { success: false, message: "Unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Delete member failed",
      };
    }
  },

  joinLink: async (shareLinkToken, role) => {
    try {
      const res = await api.get(`/rooms/join-link/${shareLinkToken}/${role}`);

      if (res?.data) {
        set((state) => ({
          ...state,
          myRooms: state.myRooms.map((r) =>
            r._id === shareLinkToken ? res.data : r,
          ),
          rooms: state.rooms.map((r) =>
            r._id === shareLinkToken ? res.data : r,
          ),
          recentRooms: state.recentRooms.map((r) =>
            r._id === shareLinkToken ? { ...r, members: res.data.members } : r,
          ),
        }));

        const latestRecent = get().recentRooms;
        localStorage.setItem("recent-rooms", JSON.stringify(latestRecent));

        return {
          success: true,
          data: res.data,
        };
      }

      return {
        success: false,
        status: "error",
        message: "Unexpected response from server",
      };
    } catch (error) {
      const backendStatus = error.response?.status || "error";

      return {
        success: false,
        status: backendStatus,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Join link failed",
      };
    }
  },

  setRoomOnlineCountProvider: (activeUsers) => {
    set({ onlineUsersProvider: activeUsers });
  },

  updateRoomCode: async (roomId) => {
    try {
      const res = await api.put("/rooms/update-code", { roomId });
      if (res.status === 200 && res.data.newCode) {
        set((state) => ({
          ...state,
          rooms: state.rooms.map((r) =>
            r._id === roomId ? { ...r, code: res?.data?.newCode } : r,
          ),
          myRooms: state.myRooms.map((r) =>
            r._id === roomId ? { ...r, code: res?.data?.newCode } : r,
          ),
          recentRooms: state.recentRooms.map((r) =>
            r._id === roomId ? { ...r, code: res?.data?.newCode } : r,
          ),
        }));
        return {
          success: true,
          message: "update code room successfully",
          code: res.data.code,
        };
      }

      return { success: false, message: "unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Update code failed",
      };
    }
  },

  updateLinkShare: async (roomId, role, access) => {
    try {
      const res = await api.put(`/rooms/update-link-share/${roomId}`, {
        role,
        access,
      });
      if (res.status === 200 && res.data) {
        set((state) => ({
          ...state,
          rooms: state.rooms.map((r) =>
            r._id === roomId ? { ...r, shareLink: res?.data } : r,
          ),
          myRooms: state.myRooms.map((r) =>
            r._id === roomId ? { ...r, shareLink: res?.data } : r,
          ),
          recentRooms: state.recentRooms.map((r) =>
            r._id === roomId ? { ...r, shareLink: res?.data } : r,
          ),
        }));
        return {
          success: true,
          message: "update link share room successfully",
        };
      }

      return { success: false, message: "unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Update link failed",
      };
    }
  },

  invitedUsers: async (roomId, userId) => {
    try {
      const res = await api.post("/rooms/invite-colleague", { roomId, userId });
      if (res.status === 200 && res.data.invitedUsers) {
        set((state) => ({
          ...state,
          rooms: state.rooms.map((r) =>
            
            r._id === roomId
              ? { ...r, invitedUsers: res.data.invitedUsers }
              : r,
          ),
          myRooms: state.myRooms.map((r) =>
            r._id === roomId
              ? { ...r, invitedUsers: res.data.invitedUsers }
              : r,
          ),
          recentRooms: state.recentRooms.map((r) =>
            r._id === roomId
              ? { ...r, invitedUsers: res.data.invitedUsers }
              : r,
          ),
        }));
        return {
          success: true,
          message: "invite colleague in room successfully",
        };
      }

      return { success: false, message: "unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Invite colleague failed",
      };
    }
  },

  cancelInvited: async (roomId, userId) => {
    try {
      const res = await api.post("/rooms/cancel-invite-colleague", {
        roomId,
        userId,
      });
      if (res.status === 200 && res.data.invitedUsers) {
        set((state) => ({
          ...state,
          rooms: state.rooms.map((r) =>
            r._id === roomId
              ? { ...r, invitedUsers: res.data.invitedUsers }
              : r,
          ),
          myRooms: state.myRooms.map((r) =>
            r._id === roomId
              ? { ...r, invitedUsers: res.data.invitedUsers }
              : r,
          ),
          recentRooms: state.recentRooms.map((r) =>
            r._id === roomId
              ? { ...r, invitedUsers: res.data.invitedUsers }
              : r,
          ),
        }));
        return {
          success: true,
          message: "Cancel invite colleague in room successfully",
        };
      }

      return { success: false, message: "unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) ||
          "Cancel Invite colleague failed",
      };
    }
  },

  acceptInvited: async (roomId) => {
    try {
      const res = await api.post("/rooms/accept-invite", { roomId });
      if (res.data.updatedRoom && res.status === 200) {
        const newRoom = res.data.updatedRoom;

        set((state) => {
          // 1. จัดการฝั่ง rooms (อัปเดตถ้ามีอยู่แล้ว)
          const updatedRooms = state.rooms.map(
            (r) => (r._id === newRoom._id ? newRoom : r), // เซฟทับด้วย Object ห้องใหม่ทั้งก้อน ป้องกันข้อมูลหาย
          );

          // 2. จัดการฝั่ง myRooms (เช็กว่ามีห้องนี้อยู่แล้วหรือยัง)
          const isAlreadyInMyRooms = state.myRooms.some(
            (r) => r._id === newRoom._id,
          );

          let updatedMyRooms;
          if (isAlreadyInMyRooms) {
            // ถ้าบังเอิญมีอยู่แล้ว ให้อัปเดตข้อมูลทับไป
            updatedMyRooms = state.myRooms.map((r) =>
              r._id === newRoom._id ? newRoom : r,
            );
          } else {
            // ถ้ายังไม่มี (กรณีปกติของการเพิ่งรับเชิญ) ให้ดันห้องใหม่เข้าไปอยู่บนสุด
            updatedMyRooms = [newRoom, ...state.myRooms];
          }

          return {
            ...state,
            rooms: updatedRooms,
            myRooms: updatedMyRooms,
          };
        });

        return {
          success: true,
          message: "Accept invite successful",
        };
      }

      return {
        success: false,
        message: "Unexpected response from server",
      };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ")
            : error?.response?.data?.message) || "Accept Invite failed",
      };
    }
  },

  declineInvited: async (roomId) => {
    try {
      const res = await api.post("/rooms/decline-invite", {roomId})
      if(res.status === 200){

        return {
          success: true,
          message:"Decline invite successful"
        }
      }
      return {
        success: false,
        message: "Unexpected response from server"
      }
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ")
            : error?.response?.data?.message) || "Decline Invite failed",
      };
    }
  },

  transferOwnership: async (roomId, newOwnerId) => {
    try {
      const res = await api.post("/rooms/transfer-ownership", {
        roomId,
        newOwnerId,
      });

      if (res.data?.success) {
        const updatedRoom = res.data.data;

        set((state) => ({
          ...state,
          myRooms: state.myRooms.map((r) =>
            r._id === roomId ? updatedRoom : r,
          ),
          rooms: state.rooms.map((r) => (r._id === roomId ? updatedRoom : r)),
          recentRooms: state.recentRooms.map((r) =>
            r._id === roomId ? updatedRoom : r,
          ),
        }));

        return { success: true, data: updatedRoom };
      }
      return { success: false };
    } catch (error) {
      return {
        success: false,
        status: error.response?.status,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Transfer ownership failed",
      };
    }
  },

  setRelativeTime: (roomId, time) => {
    set((state) => ({
      relativeTime: {
        ...state.relativeTime,
        [roomId]: time, // เช่น { "room123": 03:00, "room456": 02:00 }
      },
    }));
  },

  resetRoomStore: () => set(initialState),
}));

export default useRoomStore;
