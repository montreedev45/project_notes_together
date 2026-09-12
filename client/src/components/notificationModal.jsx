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

  const getTypeColor = (type) => {
    return type === "JOIN" ? "text-green-500" : "text-red-500";
  };

  if (!isOpen) return null;
  return (
    <>
      <div className="absolute right-0 top-12 z-50 w-[90vw] sm:w-96 bg-white border border-slate-200 rounded-xl shadow-2xl select-none">
        <div className="relative flex justify-between items-center px-5 py-3 border-b border-gray-200 bg-gray-200 rounded-t-xl z-10">
          <span className="text-lg font-bold text-slate-800 capitalize">
            Notifications
          </span>
          {notifications.length > 0 && (
            <button
              onClick={handleDeleteAllNotic}
              className="flex items-center gap-1 cursor-pointer hover:bg-red-50 p-1.5 rounded-md transition-colors"
            >
              <Icon icon="mdi:trash" className="text-red-500" width="18" />
              <span className="text-sm font-semibold text-red-500">
                Clear All
              </span>
            </button>
          )}
        </div>

        <ul className="relative max-h-90 overflow-y-auto no-scrollbar flex flex-col">
          {notifications.length === 0 ? (
            <li className="flex flex-col items-center justify-center p-8 text-slate-400">
              <Icon
                icon="mdi:bell-sleep"
                width="48"
                className="mb-2 opacity-50"
              />
              <span className="text-sm font-medium">No new notifications</span>
            </li>
          ) : (
            notifications.map((n) => (
              <li
                key={n._id}
                className="flex items-start gap-3 p-4 border-b border-gray-100 last:border-b-0 hover:bg-blue-50/50 transition-colors"
              >
                <div
                  style={{ borderColor: n?.sender?.avatar || "#ccc" }}
                  className="flex-none bg-white border-2 w-9 h-9 rounded-full flex items-center justify-center mt-1"
                >
                  <Icon
                    icon="mdi:account"
                    style={{ color: n?.sender?.avatar || "#ccc" }}
                    width="24"
                  />
                </div>
                <div className="flex flex-col grow min-w-0">
                  <span className="font-semibold text-sm text-slate-800 truncate">
                    {n?.sender?.username}
                  </span>

                  <div className="flex items-center gap-2 mt-0.5">
                    <span
                      className={`text-xs font-bold ${getTypeColor(n?.type)}`}
                    >
                      {n?.type}
                    </span>
                    <span className="text-xs text-slate-600 truncate">
                      {n?.message}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-400 mt-1 font-medium">
                    {getRelativeTime(n.createdAt)}
                  </span>
                </div>

                <button
                  onClick={() => handleDeleteNotic(n._id)}
                  className="flex-none p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Icon icon="mdi:trash" width="20" />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </>
  );
}

export default NotificationModal;
