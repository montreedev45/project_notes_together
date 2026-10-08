import { useState } from "react";
import { Icon } from "@iconify/react";
import ColorPicker from "./colorPicker";
import ChangePasswordModal from "./changePasswordModal";
import StatusModal from "./statusModal";
import ChangeEmailModal from "./changeEmailModal";
import useAuthStore from "../store/useAuthStore";
import { useEffect } from "react";
import toast from "react-hot-toast";

function SettingAccountProfile() {
  const user = useAuthStore((state) => state.user);
  const updateUserProfile = useAuthStore((state) => state.updateUserProfile);

  const [selectedColor, setSelectedColor] = useState(user?.avatar);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isOpenChangePasswordModal, setIsOpenChangePasswordModal] =
    useState(false);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: "success",
    title: "",
    message: "",
  });
  const [isOpenChangeEmailModal, setIsOpenChangeEmailModal] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username,
    email: user?.email,
    avatar: selectedColor,
  });

  // update data when change email
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        username: user.username || "",
        email: user.email || "",
      }));
    }
  }, [user]);

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
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    setErrorMsg("");

    const toastId = toast.loading("Updating profile...");

    const res = await updateUserProfile(formData);

    if (res.success) {
      toast.success("Updated profile successfully", { id: toastId });
    } else {
      toast.remove(toastId);
      setModalConfig({
        isOpen: true,
        type: "error",
        title: "Save Failed",
        message:
          res.message ||
          "An error occurred while saving the data. Please try again.",
      });
    }
    setIsLoading(false);
  };

  const closeModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <>
      <form onSubmit={handleSubmit} autoComplete="off">
        <div className="flex flex-col gap-6 w-full max-w-2xl pt-2">
          <div className="flex flex-col gap-2 relative">
            <div className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
              <span className="text-xl md:text-2xl font-semibold flex items-center gap-3">
                Username
              </span>
              <span className="text-red-500 text-xs md:text-sm">
                (Letters, numbers, and underscores only)
              </span>
            </div>

            {user?.googleId !== "" && (
              <span className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded">
                Email is managed by Google Sign-In and cannot be modified.
              </span>
            )}

            <div className="relative">
              <input
                type="text"
                disabled={user?.googleId !== ""}
                value={formData.username}
                name="username"
                onChange={handleChange}
                className="w-full py-3 px-4 font-normal text-lg text-gray-400 outline-0 border-2 border-gray-200 rounded-lg disabled:bg-gray-100 disabled:text-gray-400 transition-colors pr-12"
              />
              <Icon
                icon="mdi:pencil"
                width="24"
                className="text-gray-300 absolute right-4 top-1/2 -translate-y-1/2"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 relative">
            <span className="text-xl md:text-2xl font-semibold flex items-center gap-3">
              Email
            </span>
            {user?.googleId !== "" && (
              <span className="text-xs text-red-500 font-medium bg-red-50 p-2 rounded">
                Email is managed by Google Sign-In and cannot be modified.
              </span>
            )}

            <div className="flex flex-col sm:flex-row gap-3 items-stretch md:items-center md:justify-center">
              <input
                type="email"
                readOnly
                value={formData.email}
                className="flex-1 py-3 px-4 text-lg rounded-lg font-normal text-gray-400 outline-0 border-2 border-gray-200"
              />
              <button
                type="button"
                onClick={() => setIsOpenChangeEmailModal(true)}
                disabled={user?.googleId !== ""}
                className={`shrink-0 px-8 py-3 rounded-lg mt-5 md:mt-0 font-semibold transition-colors ${
                  user?.googleId !== ""
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                    : "bg-gray-200 hover:bg-gray-300 text-gray-500 cursor-pointer active:scale-95"
                }`}
              >
                Change
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-3 items-start">
            <button
              type="button"
              onClick={() => setIsOpenChangePasswordModal(true)}
              className="bg-red-500 hover:bg-red-600 active:scale-95 cursor-pointer text-white px-6 py-3 rounded-lg font-semibold transition-all w-full sm:w-auto"
            >
              Change Password
            </button>
            <span className="text-red-600 w-full text-xs md:text-sm p-3 bg-red-50 rounded-lg border border-red-100 leading-relaxed">
              This password change is only for logging in via email on this
              website. It will not affect your Google account password.
            </span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <span className="text-lg font-semibold shrink-0">
              Avatar Color:
            </span>
            <ColorPicker
              selectedColor={selectedColor}
              setSelectedColor={handleColorChange}
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full py-3 text-lg cursor-pointer button-primary rounded-lg font-bold hover:scale-[1.02] active:scale-95 transition-transform"
            >
              {isLoading ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </form>
      <ChangePasswordModal
        isOpen={isOpenChangePasswordModal}
        onClose={() => setIsOpenChangePasswordModal(false)}
      />
      <StatusModal
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        type={modalConfig.type}
        title={modalConfig.title}
        message={modalConfig.message}
      />

      <ChangeEmailModal
        isOpen={isOpenChangeEmailModal}
        onClose={() => setIsOpenChangeEmailModal(false)}
      />
    </>
  );
}

export default SettingAccountProfile;
