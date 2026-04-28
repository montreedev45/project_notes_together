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

  const changePassword = useAuthStore((state) => state.changePassword)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleShowCurrentPassword = () => {
    setShowCurrentPassword(!showCurrentPassword);
  };
  const handleShowNewPassword = () => {
    setShowNewPassword(!showNewPassword);
  };
  const handleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleSubmit = (e) => {
    e.stopPropagation()
  
    if(formData.newPassword !== formData.confirmPassword) {
      return alert("Please fill again, new password and confirm password not match")
    }

    if(!formData.currentPassword || !formData.newPassword || !formData.confirmPassword){
      return alert("Please fill in all field completely")
    }

    changePassword(formData)
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-third w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b-2 border-secondary">
          <h2 className="text-xl font-semibold text-slate-800">
            change password
          </h2>
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
            <div className="relative flex items-center">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={formData.currentPassword}
                onChange={handleChange}
                name="currentPassword"
                placeholder="Current password"
                className="w-full px-4 py-2.5 bg-gray-100 border-2 border-secondary rounded-lg outline-none "
              />
              <Icon
                icon="mdi:eye"
                onClick={handleShowCurrentPassword}
                width="20"
                className="text-gray absolute right-3 cursor-pointer"
              />
            </div>
            <div className="relative flex items-center">
              <input
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleChange}
                name="newPassword"
                placeholder="New password"
                className="w-full px-4 py-2.5 bg-gray-100 border-2 border-secondary rounded-lg outline-none "
              />
              <Icon
                icon="mdi:eye"
                onClick={handleShowNewPassword}
                width="20"
                className="text-gray absolute right-3 cursor-pointer"
              />
            </div>
            <div className="relative flex items-center">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                name="confirmPassword"
                placeholder="Confirm password"
                className="w-full px-4 py-2.5 bg-gray-100 border-2 border-secondary rounded-lg outline-none "
              />
              <Icon
                icon="mdi:eye"
                onClick={handleShowConfirmPassword}
                width="20"
                className="text-gray absolute right-3 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-2 flex justify-center">
          <button onClick={handleSubmit} className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:scale-105 cursor-pointer active:scale-95 transition-all">
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default ChangePasswordModal;
