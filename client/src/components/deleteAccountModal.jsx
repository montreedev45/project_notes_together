import { Icon } from "@iconify/react";
import { useState } from "react";

function DeleteAccountModal({ isOpen, onClose }) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-third w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b-2 border-secondary">
          <h2 className="text-xl font-semibold text-slate-800">delete account</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
          >
            <Icon icon="mdi:close" width="24" className="text-slate-500" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 mt-8 mx-8 bg-yellow text-black">
          <span>Are you sure? We will delete all information about you.</span>
        </div>

        {/* Footer Actions */}
        <div className="p-6 flex justify-center gap-5">
          <button onClick={onClose} className="px-6 py-2.5 bg-secondary text-white font-normal  rounded-lg hover:scale-105 cursor-pointer active:scale-95 transition-all">
            cancle
          </button>
          <button className="px-6 py-2.5 bg-red-500 text-white font-normal rounded-lg hover:scale-105 cursor-pointer active:scale-95 transition-all">
            delete
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountModal;
