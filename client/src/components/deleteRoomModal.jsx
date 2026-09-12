import { Icon } from "@iconify/react";
import { useState } from "react";
import useRoomStore from "../store/useRoomStore";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

function DeleteRoomModal({ isOpen, roomId, onClose }) {
  const navigate = useNavigate();
  const deleteRoom = useRoomStore((state) => state.deleteRoom);

  const handleDeleteRoom = async (e) => {
    e.stopPropagation();
    try {
      if (roomId) {
        await deleteRoom(roomId);
        onClose();
        navigate("/notes-together/myroom");
      }
    } catch (error) {
      console.error("Failed to delete room:", error);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        // แก้ไข z-index และเพิ่ม ring เพื่อเน้นย้ำความสำคัญ
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ring-1 ring-slate-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Icon icon="mdi:alert-circle" className="text-red-500" width="24" />
            Delete Room
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
          >
            <Icon icon="mdi:close" width="22" className="text-slate-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 text-center flex flex-col gap-4">
          <div className="bg-red-50 border border-red-100 p-4 rounded-xl text-red-600 font-medium text-sm leading-relaxed">
            Are you absolutely sure? <br />
            This action cannot be undone and all information inside this room
            will be permanently deleted.
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 flex justify-end gap-3 bg-slate-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteRoom}
            className="px-6 py-2.5 font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            Delete Room
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default DeleteRoomModal;
