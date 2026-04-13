import { Icon } from "@iconify/react";

function SaveModal({ isOpen, onClose }) {

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-third w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b-2 border-secondary">
          <h2 className="text-xl font-semibold text-slate-800">save success</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
          >
            <Icon icon="mdi:close" width="24" className="text-slate-500" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-8 space-y-6 flex items-center justify-center">
          <div className="border-4 border-green-400 w-fit p-7 rounded-full"> 

          <Icon icon="icon-park-outline:check" className="text-green-400" width="88" height="88" />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-2 flex justify-center">
          <button onClick={onClose} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:scale-105 cursor-pointer active:scale-95 transition-all">
            Ok
          </button>
        </div>
      </div>
    </div>
  );
}

export default SaveModal;
