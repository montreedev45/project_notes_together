import { Icon } from "@iconify/react";
import { useState } from "react";

function ChangePasswordModal({ isOpen, onClose }) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-third w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b-2 border-secondary">
          <h2 className="text-xl font-semibold text-slate-800">change password</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
          >
            <Icon icon="mdi:close" width="24" className="text-slate-500" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-8 space-y-6">
          <div className="flex flex-col gap-8 text-lg text-gray-400">
            <input
              type="text"
              placeholder="Current password"
              className="w-full px-4 py-2.5 bg-gray-100 border-2 border-secondary rounded-lg outline-none "
            />
            <input
              type="text"
              placeholder="New password"
              className="w-full px-4 py-2.5 bg-gray-100 border-2 border-secondary rounded-lg outline-none "
            />
            <input
              type="text"
              placeholder="Confirm password"
              className="w-full px-4 py-2.5 bg-gray-100 border-2 border-secondary rounded-lg outline-none "
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-2 flex justify-center">
          <button className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:scale-105 cursor-pointer active:scale-95 transition-all">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
