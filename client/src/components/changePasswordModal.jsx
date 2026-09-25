import { Icon } from "@iconify/react";
import { useState } from "react";
import useAuthStore from "../store/useAuthStore";

function ChangePasswordModal({ isOpen, onClose }) {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errorMsg, setErrorMsg] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const changePassword = useAuthStore((state) => state.changePassword);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg(""); 
  };

  const handleShowCurrentPassword = () => setShowCurrentPassword(!showCurrentPassword);
  const handleShowNewPassword = () => setShowNewPassword(!showNewPassword);
  const handleShowConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!formData.currentPassword || !formData.newPassword || !formData.confirmPassword) {
      return setErrorMsg("Please fill in all fields completely");
    }

    if (formData.newPassword !== formData.confirmPassword) {
      return setErrorMsg("New password and confirm password do not match");
    }

    setIsSubmitting(true);
    setErrorMsg("");

    const result = await changePassword(formData);
    
    setIsSubmitting(false);

    if (!result.success) {
      setErrorMsg(result.message);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl ring-1 ring-slate-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Change Password</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
          >
            <Icon icon="mdi:close" width="22" className="text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Form Body */}
          <div className="p-6 pt-8 space-y-6">
            <div className="flex flex-col gap-6">
              {/* Current Password */}
              <div className="relative flex items-center">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={formData.currentPassword || ""}
                  onChange={handleChange}
                  name="currentPassword"
                  placeholder="Current password"
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 border-2 border-gray-200 focus:border-primary focus:bg-white rounded-lg outline-none text-slate-800 transition-colors"
                />
                <Icon
                  icon={showCurrentPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                  onClick={handleShowCurrentPassword}
                  width="22"
                  className="text-gray-400 hover:text-gray-600 absolute right-3 cursor-pointer transition-colors"
                />
              </div>

              {/* New Password */}
              <div className="relative flex items-center">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={formData.newPassword || ""}
                  onChange={handleChange}
                  name="newPassword"
                  placeholder="New password"
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 border-2 border-gray-200 focus:border-primary focus:bg-white rounded-lg outline-none text-slate-800 transition-colors"
                />
                <Icon
                  icon={showNewPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                  onClick={handleShowNewPassword}
                  width="22"
                  className="text-gray-400 hover:text-gray-600 absolute right-3 cursor-pointer transition-colors"
                />
              </div>

              {/* Confirm Password */}
              <div className="relative flex items-center">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword || ""}
                  onChange={handleChange}
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  className="w-full pl-4 pr-10 py-3 bg-gray-50 border-2 border-gray-200 focus:border-primary focus:bg-white rounded-lg outline-none text-slate-800 transition-colors"
                />
                <Icon
                  icon={showConfirmPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                  onClick={handleShowConfirmPassword}
                  width="22"
                  className="text-gray-400 hover:text-gray-600 absolute right-3 cursor-pointer transition-colors"
                />
              </div>
              
              {/* ข้อความ Error จะถูกแสดงตรงนี้จุดเดียว */}
              {errorMsg && <p className="text-red-500 text-sm font-medium">{errorMsg}</p>}
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 pt-2 pb-8 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full px-6 py-3 font-bold rounded-xl transition-all cursor-pointer ${
                isSubmitting 
                  ? "bg-blue-300 text-white cursor-not-allowed" 
                  : "bg-primary text-white hover:shadow-lg active:scale-95"
              }`}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChangePasswordModal;