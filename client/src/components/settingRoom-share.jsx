import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useParams, useOutletContext } from "react-router-dom";
import SettingRoomPreview from "./SettingRoom-preview";
import useRoomStore from "../store/useRoomStore";
import useAuthStore from "../store/useAuthStore";

function SettingRoomShare() {
  const user = useAuthStore((state) => state.user);
  const { roomData } = useOutletContext();
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [selectedRoles, setSelectedRoles] = useState({});

  const [isAllowLinkSharing, setIsAllowLinkSharing] = useState(true);
  const [isAllowCodeSharing, setIsAllowCodeSharing] = useState(true);

  useEffect(() => {
    if (roomData) {
      setIsAllowLinkSharing(roomData.isAllowLinkSharing ?? true);
      setIsAllowCodeSharing(roomData.isAllowCodeSharing ?? true);
    }
  }, [roomData]);

  const roles = ["viewer", "editor", "commenter"];
  const link = `${import.meta.env.VITE_CLIENT_URL}/notes-together/join-link/${roomData?._id}/${selectedRoles[user?._id] || "viewer"}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomData?.code);
    setIsCopiedCode(true);
    setTimeout(() => setIsCopiedCode(false), 1000);
  };

  const handleRoleChange = (userId, role) => {
    setSelectedRoles((prev) => ({ ...prev, [userId]: role }));
  };

  return (
    <>
      <div className=" border-s-2 border-gray px-15 pt-9 flex flex-col gap-8">
        <div className="flex flex-col gap-3 relative mb-1">
          <div className="flex items-center gap-5 mb-2">
            <span className="text-2xl font-semibold">Share Link</span>
            <div className="px-4 border-2 border-gray rounded-lg">
              <select
                value={selectedRoles[user?._id] || "viewer"}
                onChange={(e) => handleRoleChange(user?._id, e.target.value)}
                className={`${isAllowLinkSharing ? "cursor-pointer" : "cursor-not-allowed"} px-2 py-1 outline-0 text-sm font-medium text-secondary`}
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="px-4 border-2 border-gray rounded-lg">
              <select
                name="people-with-access"
                id=""
                className={`${isAllowLinkSharing ? "cursor-pointer" : "cursor-not-allowed"} ps-1 pe-3 py-1 outline-0 rounded-lg text-md font-medium text-secondary`}
              >
                <option value="anyone" defaultValue>
                  anyone with link
                </option>
                <option value="reader">only invited people</option>
                <option value="viewer">restricted</option>
              </select>
            </div>
          </div>
          <div className="flex gap-5 items-center">
            <input
              type="text"
              readOnly
              onCopy={(e) => isAllowLinkSharing === false && e.preventDefault()}
              onCut={(e) => isAllowLinkSharing === false && e.preventDefault()}
              onPaste={(e) =>
                isAllowLinkSharing === false && e.preventDefault()
              }
              value={link || ""}
              className={`${isAllowLinkSharing ? "cursor-pointer" : "cursor-not-allowed"} flex-1 py-2 outline-none px-4 text-md rounded-lg border-2 border-gray text-black`}
            />

            <button
              disabled={!isAllowLinkSharing}
              onClick={handleCopy}
              className={`${isAllowLinkSharing ? "bg-blue-500 hover:bg-blue-600 cursor-pointer" : "bg-gray-400 cursor-not-allowed"} text-white px-6 py-2 rounded-lg font-semibold transition-colors`}
            >
              {isCopied ? "Copied" : "Copy"}
            </button>
          </div>
          {!isAllowLinkSharing && (
            <span className="text-red-600">
              The room owner has disabled sharing via link.
            </span>
          )}
        </div>
        <div className="flex flex-col gap-3 relative mb-3">
          <div className="flex items-center gap-5 mb-2">
            <span className="text-2xl font-semibold">Room code</span>
          </div>
          <div className="flex gap-5 items-center">
            <input
              type="text"
              readOnly
              value={roomData?.code || ""}
              className=" py-2 outline-none px-4 text-md rounded-lg border-2 border-gray text-black"
            />

            <button
              disabled={!isAllowCodeSharing}
              onClick={handleCopyCode}
              className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              {isCopiedCode ? "Copied" : "Copy"}
            </button>
          </div>
          {!isAllowCodeSharing && (
            <span className="text-red-600">
              The room owner has disabled sharing via code.
            </span>
          )}
        </div>
      </div>
    </>
  );
}
export default SettingRoomShare;
