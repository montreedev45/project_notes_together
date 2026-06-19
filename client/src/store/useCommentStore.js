import { create } from "zustand";
import api from "../services/api";

const useCommentStore = create((set) => ({
  comment: [],
  loading: false,

  getComment: async (roomId) => {
    set({ loading: true });
    try {
      const res = await api.get("/comments", { params: { roomId } });
      console.log("roomId", roomId);

      if (res.status === 200) {
        set({ comment: res.data.comments, loading: false });
        return { success: true };
      }

      set({ loading: false });
      return { success: false, message: "unexpected response from server" };
    } catch (error) {
      set({ loading: false });
      return { success: false, message: "fetch comment failed" };
    }
  },

  addCommentFromMe: async (text, roomId) => {
    set({ loading: true });
    try {
      const res = await api.post("/comments", { roomId, text });
      if (res.status === 201) {
        const incomingComment = res.data.comment || res.data.populatedComment;

        set((state) => {
          const isAlreadyExists = state.comment.some((c) => c._id === incomingComment?._id);
          if (isAlreadyExists) return { loading: false };

          return {
            comment: [...state.comment, incomingComment],
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
      const isAlreadyExists = state.comment.some((c) => c._id === incomingComment._id);
      if (isAlreadyExists) return state; 

      // ถ้ายังไม่มี (เป็นของเพื่อน) ก็ต่อท้ายอาร์เรย์เข้าไปอย่างสวยงาม
      return {
        comment: [...state.comment, incomingComment]
      };
    });
  }
}));

export default useCommentStore;
