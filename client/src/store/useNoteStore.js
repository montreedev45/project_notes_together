import { create } from "zustand";
import api from "../services/api";

const useNoteStore = create((set) => ({
  imageUrl: "",

  uploadImage: async (formData) => {
    try {
      const res = await api.post("notes/upload", formData);
      const url = res.data.url ?? "";
      
      set({ imageUrl: url }); 
      
      return url; 
    } catch (error) {
      console.error("Upload error:", error);
      return null;
    }
  },
}));

export default useNoteStore;
