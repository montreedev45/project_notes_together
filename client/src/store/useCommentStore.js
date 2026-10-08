import { create } from "zustand";
import api from "../services/api";

const useCommentStore = create((set) => ({
  comments: [],
  stickers: [],

  getComment: async (roomId) => {
    try {
      const res = await api.get("/comments", { params: { roomId } });

      if (res.status === 200) {
        set({ comments: res.data.comments });
        return { success: true };
      }

      return { success: false, message: "unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Get comment failed",
      };
    }
  },

  addCommentFromMe: async (roomId, type, content) => {
    try {
      const payload = {
        roomId: roomId,
        type: type,
        content: content,
      };

      const res = await api.post("/comments", payload);
      if (res.status === 201) {
        const incomingComment = res.data.comment || res.data.populatedComment;

        set((state) => {
          const isAlreadyExists = state.comments.some(
            (c) => c._id === incomingComment?._id,
          );
          if (isAlreadyExists) return state;

          return {
            comments: [...state.comments, incomingComment],
          };
        });
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Add comment failed",
      };
    }
  },

  addCommentFromSocket: (incomingComment) => {
    if (!incomingComment) return;

    set((state) => {
      // เช็คดักทางไว้ ถ้าเป็นข้อความของเราเองที่ยัดเข้าสเตทไปแล้วใน Action แรก มันจะไม่ซ้ำซ้อน
      const isAlreadyExists = state.comments.some(
        (c) => c._id === incomingComment._id,
      );
      if (isAlreadyExists) return state;

      // ถ้ายังไม่มี (เป็นของเพื่อน) ก็ต่อท้ายอาร์เรย์เข้าไปอย่างสวยงาม
      return {
        comments: [...state.comments, incomingComment],
      };
    });
  },

  getAllSticker: async () => {
    try {
      const res = await api.get("/comments/stickers/all");

      if (res.status === 200) {
        set({ stickers: res?.data?.stickers });

        return { success: true };
      }

      return { success: false, message: "unexpected response from server" };
    } catch (error) {
      return {
        success: false,
        message:
          (error?.response?.data?.message === "Validation Error"
            ? error?.response?.data?.errors?.map((m) => m.message).join(", ") // แปลง Array เป็น String ด้วยคอมม่า
            : error?.response?.data?.message) || "Get all sticker failed",
      };
    }
  },
}));

export default useCommentStore;
