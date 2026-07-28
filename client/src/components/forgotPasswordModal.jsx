import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import useAuthStore from "../store/useAuthStore";

function ForgotPasswordModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const forgotPassword = useAuthStore((state) => state.forgotPassword);

  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);


  const handleClose = () => {
    setEmail("");
    setIsSent(false);
    onClose();
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      const res = await forgotPassword(email);
      if(res.message.includes("Google")){
        setErrorMsg(res.message || "")
      }
      setIsSent(true);
    } catch (error) {
      console.error("Failed to send reset link:", error);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-third w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b-2 border-secondary">
          <h2 className="text-xl font-semibold text-slate-800">
            Forgot Password
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
          >
            <Icon icon="mdi:close" width="24" className="text-slate-500" />
          </button>
        </div>

        <div className="my-6 text-black">
          <form onSubmit={handleForgotPassword} className="flex gap-3 items-center mx-6">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
              className="flex-1 py-2 outline-none px-4 text-base rounded-lg border-2 border-gray-300 text-secondary focus:border-primary"
            />

            <button
              type="submit"
              className="cursor-pointer bg-primary hover:bg-blue-600 text-white px-5 py-2.5 rounded-lg font-semibold transition-colors"
            >
              Send
            </button>
          </form>

          {isSent && (
            <div className="p-4 mx-6 my-6 bg-amber-100 text-amber-800 rounded-lg text-sm border border-amber-300">
              {`${errorMsg ? errorMsg : "We have sent the verification link to your email. Please check your inbox and click the link to reset your password."}`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;