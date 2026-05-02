import { Icon } from "@iconify/react";
import { useState } from "react";
import useRoomStore from "../store/useRoomStore";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";

function DeleteRoomModal({  isOpen, roomId, onClose }) {
  const navigate = useNavigate();
  const deleteRoom = useRoomStore((state) => state.deleteRoom);

  const handleDeleteRoom = async (e) => {
    e.stopPropagation();
    try {
      if (roomId) {
        await deleteRoom(roomId);
        onClose();
        navigate("/notes-together/dashboard");
      }
    } catch (error) {
      console.error("Failed to delete room:", error);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b-2 border-secondary">
          <h2 className="text-xl font-semibold text-slate-800">delete room</h2>
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
            Are you sure? We will delete all information about this room.
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
            onClick={handleDeleteRoom}
            className="w-32 py-2.5 bg-red-500 text-white rounded-lg hover:scale-105 active:scale-95 transition-transform cursor-pointer"
          >
            delete
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default DeleteRoomModal;
