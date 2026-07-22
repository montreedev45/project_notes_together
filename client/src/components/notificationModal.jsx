import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { getRelativeTime } from "../utils/getRelativeTime.js";
import useNotificationStore from "../store/useNotificationStore";

function NotificationModal({ isOpen, onClose }) {
  const notifications = useNotificationStore((state) => state.notifications);
  const deleteNotification = useNotificationStore(
    (state) => state.deleteNotification,
  );
  const deleteAllNotification = useNotificationStore(
    (state) => state.deleteAllNotification,
  );

  const handleDeleteNotic = (noticId) => {
    if (
      window.confirm(`Are you sure you want to delete notification ${noticId}`)
    ) {
      deleteNotification(noticId);
    }
  };

  const handleDeleteAllNotic = () => {
    if (window.confirm("Are you sure you want to delete all notification")) {
      deleteAllNotification();
    }
  };

  if (!isOpen) return null;
  return (
    <>
      <div className="relative right-105 top-8 z-9999 select-none">
        <div className="absolute w-110 h-68 bg-white border border-slate-200 rounded-xl shadow-lg">
          <div className="absolute right-6 -top-2 w-5 h-5 bg-gray-200 -rotate-45"></div>
          <div className="flex justify-between items-center px-6 py-2 text-xl font-medium border-b-2 border-gray-200 bg-gray-200 rounded-tl-lg rounded-tr-lg">
            <span>notification</span>
            {notifications.length !== 0 && (
              <button
                onClick={handleDeleteAllNotic}
                className="flex items-center cursor-pointer"
              >
                <Icon icon="mdi:trash" className="text-red-400" width="18" />
                <span className="text-sm text-red-400">clear all</span>
              </button>
            )}
          </div>

          <ul className="relative mt-1.5 h-53 overflow-auto no-scrollbar z-10 flex flex-col gap-1">
            {notifications.map((n) => (
              <li
                key={n._id} 
                className="flex justify-between items-center p-3 px-5 pb-1"
              >
                <div className="min-w-25 flex items-center font-medium text-sm gap-2">
                  <div
                    style={{ borderColor: n?.sender?.avatar }}
                    className="flex-none bg-white border-2 w-7 h-7 rounded-full flex items-center justify-center"
                  >
                    <Icon
                      icon="mdi:account"
                      style={{ color: n?.sender?.avatar }}
                      width="20"
                    />
                  </div>
                  <span>{n?.sender?.username}</span>
                </div>
                <div className="flex grow gap-1 justify-start text-xs text-secondary font-medium">
                  <span
                    style={{
                      color: n?.type === "JOIN" ? "#64ed4c" : "#ed4c4c",
                    }}
                  >
                    {n?.type}
                  </span>{" "}
                  &nbsp; &nbsp; <span className="text-xs font-normal">{n?.message}</span>
                </div>
                <div className="min-w-20 grow-0 px-4 text-end text-xs text-gray font-normal">
                  {getRelativeTime(n.createdAt)}
                </div>
                <Icon
                  icon="mdi:trash"
                  onClick={() => handleDeleteNotic(n._id)}
                  className="text-red-400 cursor-pointer"
                  width="18"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
}

export default NotificationModal;
