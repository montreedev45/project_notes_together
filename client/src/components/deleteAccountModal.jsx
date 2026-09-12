import { Icon } from "@iconify/react";
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
      className="fixed inset-0 z-999 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-opacity"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 ring-1 ring-red-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-red-50">
          <h2 className="text-xl font-bold text-red-600 flex items-center gap-2">
            <Icon icon="mdi:alert-octagon" width="26" />
            Delete Account
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="p-1.5 hover:bg-red-100 rounded-full cursor-pointer transition-colors"
          >
            <Icon icon="mdi:close" width="22" className="text-red-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 text-center flex flex-col gap-4">
          <div className="bg-red-50 border border-red-200 p-5 rounded-xl text-red-600 font-medium text-sm leading-relaxed text-left">
            <strong className="block text-base mb-1">
              Are you absolutely sure?
            </strong>
            This action is irreversible. All of your rooms, notes, and personal
            data will be permanently wiped from our servers immediately.
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 flex justify-end gap-3 bg-gray-50 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-2.5 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 active:scale-95 transition-all cursor-pointer shadow-sm"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteAccountModal;
