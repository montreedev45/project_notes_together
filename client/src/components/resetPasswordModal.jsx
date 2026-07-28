import { Icon } from "@iconify/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

function ResetPasswordModal({ isOpen, onClose, token, email }) {
  if (!isOpen) return null;
  const navigate = useNavigate()

  const resetPassword = useAuthStore((state) => state.resetPassword);
  const loading = useAuthStore((state) => state.loading);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setError("");
    setIsSent(false);
    onClose();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError("");

    if (!password || !confirmPassword) return;

    if (password !== confirmPassword) {
      return setError("The password and confirm password do not match.");
    }

    const finalData = {
      token,
      email,
      newPassword : password,
    };

    try {
      const res = await resetPassword(finalData);
      if(res.success === true){
        handleClose()
        navigate("/login")
      }
      setIsSent(true);
    } catch (err) {
      console.error("Failed to reset password:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to reset password. Please try again.",
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-third w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200 shadow-xl">
        <div className="flex items-center justify-between p-6 border-b-2 border-secondary">
          <h2 className="text-xl font-semibold text-slate-800">
            Reset Password
          </h2>
          <button
            type="button"
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
          >
            <Icon icon="mdi:close" width="24" className="text-slate-500" />
          </button>
        </div>

        <div className="my-6 text-black">
          <form
            onSubmit={handleResetPassword}
            className="flex flex-col gap-3 items-center mx-6 px-2 py-2"
          >
            <div className="w-full flex flex-col gap-4">
              <div className="flex items-center relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  placeholder="New password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading || isSent}
                  minLength={6}
                  className="w-full py-2 outline-none pl-4 pr-10 text-base rounded-lg border-2 border-gray-300 text-slate-800 focus:border-primary transition-colors disabled:bg-gray-100"
                />
                <Icon
                  icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                  onClick={() => setShowPassword(!showPassword)}
                  width="20"
                  className="text-gray-500 absolute right-3 cursor-pointer hover:text-slate-700"
                />
              </div>

              <div className="flex items-center relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  placeholder="Confirm password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={loading || isSent}
                  minLength={6}
                  className="w-full py-2 outline-none pl-4 pr-10 text-base rounded-lg border-2 border-gray-300 text-slate-800 focus:border-primary transition-colors disabled:bg-gray-100"
                />
                <Icon
                  icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  width="20"
                  className="text-gray-500 absolute right-3 cursor-pointer hover:text-slate-700"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isSent}
              className="w-full bg-primary hover:bg-blue-600 active:scale-[0.99] transition-all text-white py-2.5 mt-2 rounded-lg font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save"}
            </button>

            {isSent && (
              <div className="w-full text-center p-3 mt-3 bg-emerald-50 text-emerald-800 rounded-lg text-sm border border-emerald-200">
                Password updated successfully! Please log in with your new
                password.
              </div>
            )}

            {error && (
              <div className="w-full text-center p-3 mt-3 bg-red-50 text-red-600 rounded-lg text-sm border border-red-200">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordModal;
