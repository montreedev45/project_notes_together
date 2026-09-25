import { Icon } from "@iconify/react";
import { useState, useEffect } from "react";
import useAuthStore from "../store/useAuthStore";

function ForgotPasswordModal({ isOpen, onClose }) {
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const [email, setEmail] = useState("");

  const [isSent, setIsSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleClose = () => {
    setEmail("");
    setIsSent(false);
    setErrorMsg("");
    onClose();
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) return;

    setErrorMsg("");

    try {
      const res = await forgotPassword(email);

      if(res?.message?.includes("Google")){
        setErrorMsg(res.message || "");
      }

      setIsSent(true);
    } catch (error) {
      console.error("Failed to send reset link:", error);
      setErrorMsg("An error occurred. Please try again.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-70 md:max-w-100 overflow-hidden transform transition-all">
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Forgot Password</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100 cursor-pointer"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="px-6 py-4">
          {isSent ? (
            !errorMsg ? (
              <div className="text-center py-6">
                <Icon
                  icon="mdi:check-circle"
                  className="text-green-500 w-16 h-16 mx-auto mb-4"
                />
                <h3 className="text-lg font-bold text-gray-800 mb-2">
                  Check your inbox
                </h3>
                <p className="text-gray-600 text-sm">
                  We've sent a password reset link to <br />
                  <span className="font-semibold">{email}</span>
                </p>
              </div>
            ) : (
              <>
                <div className="text-center py-6">
                  <Icon
                    icon="mdi:alert-circle"
                    className="text-red-500 w-16 h-16 mx-auto mb-4"
                  />
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    warning
                  </h3>
                  <p className="text-red-600 text-sm">
                    {errorMsg}
                  </p>
                </div>
              </>
            )
          ) : (
            <>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed bg-amber-100 p-5 rounded-lg">
                Enter the email address associated with your account, and we'll
                send you a link to reset your password.
              </p>

              <form
                className="flex flex-col gap-4"
                onSubmit={handleForgotPassword}
              >
                <input
                  type="email"
                  placeholder="Enter your email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-primary transition-colors text-gray-700"
                />
                <button
                  type="submit"
                  className="w-full py-3 button-primary rounded-lg font-semibold hover:scale-[1.02] active:scale-95 transition-transform"
                >
                  Send Reset Link
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ForgotPasswordModal;