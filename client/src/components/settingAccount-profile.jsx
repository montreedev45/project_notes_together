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
      <div className=" px-15 pt-9 flex flex-col gap-4 min-w-200 max-w-200">
        <div className="flex flex-col gap-3 relative">
          <span className="text-2xl font-semibold flex items-center gap-3">Username
            {user?.googleId && (
              <span className="text-xs text-red-500 mt-1">
                ( Email is managed by Google Sign-In and cannot be modified )
              </span>
            )}
          </span>
          
          <input
            type="text"
            disabled={user?.googleId} 
            value={formData.username}
            name="username"
            onChange={handleChange}
            className="w-full py-2.5 outline-0 px-4 text-xl text-secondary  rounded-lg border-2 border-gray"
          />
          <Icon
            icon="mdi:pencil"
            width="30"
            className="text-secondary absolute right-3 top-14"
          />
        </div>
        <div className="flex flex-col gap-3 relative">
          <span className="text-2xl font-semibold flex items-center gap-3">Email
            {user?.googleId && (
              <span className="text-xs text-red-500 mt-1">
                ( Email is managed by Google Sign-In and cannot be modified )
              </span>
            )}
          </span>
          
          <div className="flex gap-5 items-center ">
            <input
              type="email"
              readOnly
              value={formData.email}
              className="flex-1 py-2 outline-none px-4 text-lg rounded-lg border-2 border-gray text-secondary"
            />

            <button
              onClick={() => setIsOpenChangeEmailModal(true)}
              disabled={user?.googleId} 
              className={`${user?.googleId ? "bg-gray-300 cursor-not-allowed" : "bg-gray-400 hover:bg-gray-500 cursor-pointer"} text-white px-6 py-2.5 rounded-lg font-semibold transition-colors`}
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
        <div className="flex flex-col gap-3 relative">
          <div className="flex gap-5 items-center ">
            <button
              disabled={user?.googleId} 
              onClick={() => setIsOpenChangePasswordModal(true)}
              className={`${user?.googleId ? "bg-gray-300 cursor-not-allowed" : "bg-red hover:bg-red-400 cursor-pointer"} text-white px-6 py-2.5 rounded-lg font-semibold transition-colors`}
            >
              Change Password
            </button>
            <ChangePasswordModal
              key={isOpenChangePasswordModal}
              isOpen={isOpenChangePasswordModal}
              onClose={() => setIsOpenChangePasswordModal(false)}
            />
          </div>
        </div>
        <div className="flex items-start gap-3 flex-1">
          <span className="text-xl font-semibold">Avatar Color :</span>
          <ColorPicker
            selectedColor={selectedColor}
            setSelectedColor={handleColorChange}
          />
        </div>
        <button
          onClick={handleSubmit}
          className="w-full text-center text-lg cursor-pointer button-primary bg-primary rounded-lg hover:bg-blue-500 transition-all mb-8"
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
