import { Icon } from "@iconify/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import toast from "react-hot-toast";

function ResetPasswordModal({ isOpen, onClose, token, email }) {
  const navigate = useNavigate();

  const resetPassword = useAuthStore((state) => state.resetPassword);

  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleClose = () => {
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setErrorMsg("");
    setIsLoading(false);
    onClose();
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    if (!password || !confirmPassword) {
      toast.error("Please fill in all password fields.");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      toast.error("The password and confirm password do not match.");
      setIsLoading(false);
      return;
    }

    const finalData = {
      token,
      email,
      newPassword: password,
    };

    const toastId = toast.loading("Resetting password...");
    const res = await resetPassword(finalData);
    if (res.success === true) {
      toast.success("Reset password successful", { id: toastId });
      handleClose();
      navigate("/login");
      setIsLoading(false);
    } else {
      toast.error(`${res.message || "Reset password failed"}`, {
        id: toastId,
      });
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="select-none fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl ring-1 ring-slate-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-slate-50">
            <h2 className="text-xl font-bold text-slate-800">Reset Password</h2>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
            >
              <Icon icon="mdi:close" width="22" className="text-slate-500" />
            </button>
          </div>
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
                  disabled={isLoading}
                  minLength={6}
                  className="w-full py-2 outline-none pl-4 pr-10 text-base rounded-lg border-2 border-gray-200 text-gray-400 focus:border-primary transition-colors disabled:bg-gray-100"
                />
                <Icon
                  icon={showPassword ? "mdi:eye-off" : "mdi:eye"}
                  onClick={() => setShowPassword(!showPassword)}
                  width="20"
                  className="text-gray-300 absolute right-3 cursor-pointer"
                />
              </div>

              <div className="flex items-center relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  placeholder="Confirm password"
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  minLength={6}
                  className="w-full py-2 outline-none pl-4 pr-10 text-base rounded-lg border-2 border-gray-200 text-gray-400 focus:border-primary transition-colors disabled:bg-gray-100"
                />
                <Icon
                  icon={showConfirmPassword ? "mdi:eye-off" : "mdi:eye"}
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  width="20"
                  className="text-gray-300 absolute right-3 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-blue-600 active:scale-[0.99] transition-all text-white py-2.5 mt-2 rounded-lg font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordModal;
