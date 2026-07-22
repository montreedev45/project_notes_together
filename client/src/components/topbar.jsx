import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { Link } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";
import NotificationModal from "./notificationModal";
import useNotificationStore from "../store/useNotificationStore";

function Topbar() {
  const user = useAuthStore((state) => state.user);
  const [isOpenNotificationModal, setIsOpenNotificationModal] = useState(false);

  const { notifications, getUnreadCount, markAllAsRead } =
    useNotificationStore();

  const planColors = {
    free: "bg-slate-400 text-white",
    teams: "bg-indigo-600 text-white",
    business: "bg-rose-500 text-white",
  };

  const getNotifications = useNotificationStore(
    (state) => state.getNotifications,
  );

  const unreadCount = getUnreadCount();

  useEffect(() => {
    getNotifications()
  }, [])

  return (
    <>
      <div className="bg-third flex items-center px-15 h-20 border-b-2 border-gray-200">
        <Link to="/" className="flex items-center">
          <img
            src="/logo.svg"
            alt=""
            className="min-w-60 max-w-60 cursor-pointer"
          />
        </Link>
        <span
          className={`${planColors[user.plan]} border rounded-md  flex justify-center items-center min-w-fit h-fit py-0.5 px-4 text-sm mt-1 ms-2 font-semibold`}
        >
          {user.plan} plan
        </span>
        <div className="relative flex justify-end items-center w-full">
          <div className="me-5 cursor-pointer hover:scale-105 transition-transform">
            <Link
              to={`/notes-together/${user?._id}/setting-account`}
              className="flex items-center gap-3 "
            >
              <div className="flex flex-col min-w-0 leading-tight">
                <span className="font-bold text-sm truncate text-slate-800">
                  {user?.username}
                </span>
              </div>
              <div
                style={{ borderColor: user?.avatar }}
                className={`flex-none bg-white border-2  w-10 h-10 rounded-full flex items-center justify-center cursor-pointer`}
              >
                <Icon
                  icon="mdi:account"
                  style={{ color: user?.avatar }}
                  width="30"
                />
              </div>
            </Link>
          </div>
          <span>
            <Icon
              onClick={() => {
                setIsOpenNotificationModal(!isOpenNotificationModal);
                if (unreadCount > 0) markAllAsRead();
              }}
              icon="mdi:bell"
              className="cursor-pointer hover:scale-105 transition-transform text-secondary"
              width="30"
            />
            {unreadCount > 0 && (
              <span
                style={{ backgroundColor: "#eb4034" }}
                className="w-2.5 h-2.5 absolute top-2 right-1 rounded-full"
              ></span>
            )}
          </span>
          <NotificationModal
            isOpen={isOpenNotificationModal}
            onClose={() => setIsOpenNotificationModal(false)}
          />
        </div>
      </div>
    </>
  );
}

export default Topbar;
