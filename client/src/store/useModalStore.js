import { create } from "zustand";

const useModalStore = create((set) => ({
  deleteModal: { isOpen: false, roomId: null },
  
  openDeleteModal: (roomId) => set({ deleteModal: { isOpen: true, roomId } }),
  closeDeleteModal: () => set({ deleteModal: { isOpen: false, roomId: null } }),
}));

export default useModalStore;