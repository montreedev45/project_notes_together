import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { getRelativeTime } from "../utils/getRelativeTime.js";
import useNotificationStore from "../store/useNotificationStore";

function NotificationModal({ isOpen, onClose }) {
  const notifications = useNotificationStore((state) => state.notifications);

  useEffect(() => {
    console.log("notifications", notifications);
  }, [notifications]);

  if (!isOpen) return null;
  return (
    <>
      <div className="relative right-125 top-8 z-50 select-none">
        <div className="absolute w-130 h-68 bg-white border border-slate-200 rounded-xl shadow-lg">
          <div className="absolute right-6 -top-2 w-5 h-5 bg-gray-200 -rotate-45"></div>
          <div className="px-4 py-2 text-xl font-medium border-b-2 border-gray-200 bg-gray-200 rounded-tl-lg rounded-tr-lg">
            <span>notification</span>
          </div>

          <ul className="relative mt-1.5 h-53 overflow-auto z-10 flex flex-col gap-1">
            {notifications.map((n) => (
              <li key={n._id} className="flex justify-between items-center p-3 px-5 pb-1">
                <div className="grow flex items-center font-medium text-md gap-2">
                  <div
                    style={{ borderColor: n?.sender?.avatar }}
                    className="flex-none bg-white border-2 w-8 h-8 rounded-full flex items-center justify-center"
                  >
                    <Icon
                      icon="mdi:account"
                      style={{ color: n?.sender?.avatar }}
                      width="25"
                    />
                  </div>
                  <span>{n?.sender?.username}</span>
                </div>
                <div className="min-w-30 grow-0 text-right text-sm text-secondary font-medium">
                  <span style={{color: n?.type === "JOIN" ? "#64ed4c" : "#ed4c4c"}}>{n?.type}</span> &nbsp; &nbsp; {n?.roomName}
                </div>
                <div className="min-w-45 grow-0 text-right text-md text-gray font-normal">
                  {getRelativeTime(n.createdAt)}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default NotificationModal;
