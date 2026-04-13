import { Icon } from "@iconify/react";
import { useState } from "react";

function ForgotPasswordModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const handleClose = () => {
    onClose();
    setStep(1);
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-third w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b-2 border-secondary">
          <h2 className="text-xl font-semibold text-slate-800">forgot password</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
          >
            <Icon icon="mdi:close" width="24" className="text-slate-500" />
          </button>
        </div>

        {/* Form Body */}
        <div className="mt-6  text-black">
          <>
            <div className="flex gap-5 items-center mx-6 ">
              <input
                type="text"
                readOnly
                value=""
                placeholder="Current email"
                className="flex-1 py-2 outline-none px-4 text-lg rounded-lg border-2 border-gray text-secondary"
              />

              <button
                onClick={() => setStep(2)}
                className="cursor-pointer bg-primary hover:bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold transition-colors"
              >
                Send
              </button>
            </div>
            <div className="p-6 mx-6 my-6  bg-yellow">
              We have sent the verification code to your email. Please click the link provided to confirm.
            </div>
          </>
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;
