import { useState } from "react";
import { Icon } from "@iconify/react";
import ColorPicker from "./colorPicker";
import Toggle from "./toggleButton";
import ChangePasswordModal from "./changePasswordModal";
import SaveModal from "./saveModal";
import ChangeEmailModal from "./changeEmailModal";
import useAuthStore from "../store/useAuthStore";

function SettingAccountProfile() {
  const user = useAuthStore((state) => state.user);
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile);
  const [selectedColor, setSelectedColor] = useState(user?.avatar);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [isOpenChangePasswordModal, setIsOpenChangePasswordModal] =
    useState(false);
  const [isOpenSaveModal, setIsOpenSaveModal] = useState(false);
  const [isOpenChangeEmailModal, setIsOpenChangeEmailModal] = useState(false);

  const [formData, setFormData] = useState({
    username: user?.username,
    email: user?.email,
    avatar: selectedColor,
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleColorChange = (color) => {
    setSelectedColor(color);
    setFormData({ ...formData, avatar: color });
  };

  const handleSubmit = async (e) => {
    e.stopPropagation();
    const result = await updateUserProfile(formData);
  };

  return (
    <>
      <div className="flex flex-col gap-8 w-full max-w-2xl pt-2 pb-8">
        <div className="flex flex-col gap-2 relative">
          <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
            <span className="text-xl md:text-2xl font-semibold flex items-center gap-3">
              Username 
            </span>
            <span className="text-red-500 text-xs md:text-sm">
              (Letters, numbers, and underscores only)
            </span>
          </div>

          {user?.googleId === "google" && (
            <span className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded">
              Email is managed by Google Sign-In and cannot be modified.
            </span>
          )}

          <div className="relative">
            <input
              type="text"
              disabled={user?.googleId === "google"}
              value={formData.username}
              name="username"
              onChange={handleChange}
              className="w-full py-3 outline-none px-4 text-lg text-slate-700 rounded-lg border-2 border-gray-200 focus:border-primary disabled:bg-gray-100 disabled:text-gray-400 transition-colors pr-12"
            />
            <Icon
              icon="mdi:pencil"
              width="24"
              className="text-gray-400 absolute right-4 top-1/2 -translate-y-1/2"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2 relative">
          <span className="text-xl md:text-2xl font-semibold flex items-center gap-3">
            Email
          </span>
          {user?.googleId === "google" && (
            <span className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded">
              Email is managed by Google Sign-In and cannot be modified.
            </span>
          )}

          <div className="flex flex-col sm:flex-row gap-3 items-stretch md:items-center md:justify-center">
            <input
              type="email"
              readOnly
              value={formData.email}
              className="flex-1 py-3 outline-none px-4 text-lg rounded-lg border-2 border-gray-200 text-slate-500 bg-gray-50"
            />
            <button
              onClick={() => setIsOpenChangeEmailModal(true)}
              disabled={user?.googleId === "google"}
              className={`shrink-0 px-8 py-3 rounded-lg mt-5 md:mt-0 font-semibold transition-colors ${
                user?.googleId === "google"
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-500 cursor-pointer active:scale-95"
              }`}
            >
              Change
            </button>
            <ChangeEmailModal
              key={isOpenChangeEmailModal}
              isOpen={isOpenChangeEmailModal}
              onClose={() => setIsOpenChangeEmailModal(false)}
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 items-start">
          <button
            onClick={() => setIsOpenChangePasswordModal(true)}
            className="bg-red-500 hover:bg-red-600 active:scale-95 cursor-pointer text-white px-6 py-3 rounded-lg font-semibold transition-all w-full sm:w-auto"
          >
            Change Password
          </button>
          <span className="text-red-600 w-full text-xs md:text-sm p-3 bg-red-50 rounded-lg border border-red-100 leading-relaxed">
            This password change is only for logging in via email on this
            website. It will not affect your Google account password.
          </span>
          <ChangePasswordModal
            key={isOpenChangePasswordModal}
            isOpen={isOpenChangePasswordModal}
            onClose={() => setIsOpenChangePasswordModal(false)}
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <span className="text-lg font-semibold shrink-0">Avatar Color:</span>
          <ColorPicker
            selectedColor={selectedColor}
            setSelectedColor={handleColorChange}
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full mt-4 py-3 text-lg cursor-pointer button-primary rounded-lg font-bold hover:scale-[1.02] active:scale-95 transition-transform"
        >
          Save Changes
        </button>

        <SaveModal
          isOpen={isOpenSaveModal}
          onClose={() => setIsOpenSaveModal(false)}
        />
      </div>
    </>
  );
}

export default SettingAccountProfile;
