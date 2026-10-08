import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { getRelativeTime } from "../utils/getRelativeTime.js";
import useNotificationStore from "../store/useNotificationStore";
import useRoomStore from "../store/useRoomStore.js";
import ConfirmModal from "./confirmModal.jsx";
import toast from "react-hot-toast";

function NotificationModal({ isOpen, onClose }) {
  const notifications = useNotificationStore((state) => state.notifications);
  const deleteNotification = useNotificationStore(
    (state) => state.deleteNotification,
  );
  const deleteAllNotification = useNotificationStore(
    (state) => state.deleteAllNotification,
  );
  const acceptInvited = useRoomStore((state) => state.acceptInvited);
  const declineInvited = useRoomStore((state) => state.declineInvited);

  const [isLoading, setIsLoading] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState({
    isOpen: false,
    type: "",
    noticId: null,
  });

  const handleRequestDeleteSingle = (noticId) => {
    setConfirmConfig({
      isOpen: true,
      type: "DELETE_ONE",
      noticId: noticId,
    });
  };

  const handleRequestDeleteAll = () => {
    setConfirmConfig({
      isOpen: true,
      type: "DELETE_ALL",
      noticId: null,
    });
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "JOIN":
        return "text-green-500";
      case "LEAVE":
        return "text-red-500";
      case "TRANSFER_OWNER":
        return "text-yellow-500";
      case "INVITE":
        return "text-blue-300";
      case "CANCEL_INVITE":
        return "text-orange-300";
      case "UPDATE_ROLE":
        return "text-orange-300";
      default:
        return "";
    }
  };

  const executeDeleteNotic = async () => {
    if (!confirmConfig.type) return;

    setIsLoading(true);
    const toastId = toast.loading(
      confirmConfig.type === "DELETE_ALL"
        ? "Deleting all notifications..."
        : "Deleting notification...",
    );

    try {
      let res;
      if (confirmConfig.type === "DELETE_ONE") {
        res = await deleteNotification(confirmConfig.noticId);
      } else if (confirmConfig.type === "DELETE_ALL") {
        res = await deleteAllNotification();
      }

      if (res.success) {
        toast.success("Delete notification successful", { id: toastId });
        handleClose();
      } else {
        toast.error(res.message || "Delete notification failed", {
          id: toastId,
        });
        handleClose();
      }
    } catch (error) {
      toast.error("Network error. Please try again.", { id: toastId });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setConfirmConfig({ isOpen: false, type: "", noticId: null });
  };

  const handleAccept = async (e, roomId) => {
    e.stopPropagation();

    const toastId = toast.loading("Accepting invite...");
    const res = await acceptInvited(roomId);
    if (res.success) {
      toast.success("Accepted invite successful", { id: toastId });
    } else {
      toast.error(`${res.message || "Accept invite failed"}`, { id: toastId });
    }
  };

  const handleDecline = async (e, roomId) => {
    e.stopPropagation();

    const toastId = toast.loading("Declining invite...");
    const res = await declineInvited(roomId);

    if (res.success) {
      toast.success("Decline invite successful", { id: toastId });
    } else {
      toast.error(`${res.message || "Decline invite failed"}`, { id: toastId });
    }
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
              onClick={handleRequestDeleteAll}
              className="flex items-center gap-1 cursor-pointer hover:bg-white p-1.5 rounded-md transition-colors"
            >
              <Icon icon="mdi:trash" className="text-red-500" width="18" />
              <span className=" text-sm font-semibold text-red-500">
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

                  <div className="flex  items-start gap-2 mt-0.5">
                    <span
                      className={`text-xs font-bold ${getTypeColor(n?.type)}`}
                    >
                      {n?.type}
                    </span>
                    <span className="text-xs text-slate-600 truncate text-wrap">
                      {n?.message}
                    </span>
                  </div>
                  {n?.type === "INVITE" && (
                    <div className="flex  items-start gap-2 mt-3 mb-1">
                      <div className="flex text-xs gap-2 font-semibold text-white">
                        <button
                          onClick={(e) => handleAccept(e, n?.roomId)}
                          className="px-2.5 py-1 rounded-md bg-green-400 cursor-pointer hover:bg-green-500 transition-colors"
                        >
                          Accept
                        </button>
                        <button
                          onClick={(e) => handleDecline(e, n?.roomId)}
                          className="px-2.5 py-1 rounded-md bg-red-400 cursor-pointer hover:bg-red-500 transition-colors"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  )}

                  <span className="text-[11px] text-slate-400 mt-1 font-medium">
                    {getRelativeTime(n.createdAt)}
                  </span>
                </div>

                <button
                  onClick={() => handleRequestDeleteSingle(n._id)}
                  className="flex-none p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                >
                  <Icon
                    icon="mdi:trash"
                    width="20"
                    className="cursor-pointer"
                  />
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
      <ConfirmModal
        isOpen={confirmConfig.isOpen}
        onClose={handleClose}
        onConfirm={executeDeleteNotic}
        title={
          confirmConfig.type === "DELETE_ALL"
            ? "Clear all notifications"
            : "Confirm delete notification"
        }
        message={
          confirmConfig.type === "DELETE_ALL"
            ? "Are you sure you want to delete all notifications? This action cannot be undone."
            : `Are you sure you want to delete this notification : ${confirmConfig.noticId}?`
        }
        isLoading={isLoading}
      />
    </>
  );
}

export default NotificationModal;
