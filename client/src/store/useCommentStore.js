import { create } from "zustand";
import api from "../services/api";

const useCommentStore = create((set) => ({
  comments: [],
  stickers: [],
  loading: false,

  getComment: async (roomId) => {
    set({ loading: true });
    try {
      const res = await api.get("/comments", { params: { roomId } });

      if (res.status === 200) {
        set({ comments: res.data.comments, loading: false });
        return { success: true };
      }

      set({ loading: false });
      return { success: false, message: "unexpected response from server" };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: "fetch comment failed" };
    }
  },

  addCommentFromMe: async (roomId, type, content) => {
    set({ loading: true });
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
          if (isAlreadyExists) return { loading: false };

          return {
            comments: [...state.comments, incomingComment],
            loading: false,
          };
        });
        return { success: true };
      }
    } catch (error) {
      set({ loading: false });
      return { success: false };
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
    set({ loading: true });
    try {
      const res = await api.get("/comments/stickers/all");

      if (res.status === 200) {
        set({ stickers: res?.data?.stickers, loading: false });

        return { success: true };
      }

      set({ loading: false });
      return { success: false, message: "unexpected response from server" };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: "fetch stickers failed" };
    }
  },
}));

export default useCommentStore;
