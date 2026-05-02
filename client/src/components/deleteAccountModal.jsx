import { Icon } from "@iconify/react";
import { useState } from "react";
import useAuthStore from "../store/useAuthStore";

function DeleteAccountModal({ isOpen, onClose }) {
  const user = useAuthStore((state) => state.user);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);

  const handleDelete = () => {
    deleteAccount();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b-2 border-secondary">
          <h2 className="text-xl font-semibold text-slate-800">delete account</h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
          >
            <Icon icon="mdi:close" width="24" className="text-slate-500" />
          </button>
        </div>

        <div className="p-10 text-center">
          <div className="bg-yellow-100 p-4 rounded-xl text-slate-700">
            Are you sure? We will delete all information about you.
          </div>
        </div>

        <div className="p-6 flex justify-center gap-4 bg-slate-50">
          <button
            onClick={onClose}
            className="w-32 py-2.5 bg-secondary text-white rounded-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            cancel
          </button>
          <button
            onClick={handleDelete}
            className="w-32 py-2.5 bg-red-500 text-white rounded-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountModal;
