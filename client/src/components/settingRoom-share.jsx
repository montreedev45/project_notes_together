import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useParams, useOutletContext } from "react-router-dom";
import SettingRoomPreview from "./SettingRoom-preview";
import useRoomStore from "../store/useRoomStore";
import useAuthStore from "../store/useAuthStore";

function SettingRoomShare() {
  const user = useAuthStore((state) => state.user);
  const users = useAuthStore((state) => state.users);
  const getUser = useAuthStore((state) => state.getUser);
  const { roomData } = useOutletContext();
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isChangeCode, setIsChangeCode] = useState(false);
  const [selectedRole, setSelectedRole] = useState(roomData?.shareLink?.role);
  const [selectedAccess, setSelectedAccess] = useState(
    roomData?.shareLink?.access,
  );
  const updateRoomCode = useRoomStore((state) => state.updateRoomCode);
  const loading = useRoomStore((state) => state.loading);
  const updateLinkShare = useRoomStore((state) => state.updateLinkShare);
  const invitedUsers = useRoomStore((state) => state.invitedUsers);

  const [isAllowLinkSharing, setIsAllowLinkSharing] = useState(true);
  const [isAllowCodeSharing, setIsAllowCodeSharing] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");

  const handleAddMember = (user) => {
    const roleToSend = selectedRoles[user._id] || "editor";
    setSearchTerm("");
    addMember(roomData?._id, user._id, roleToSend);
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      getUser(searchTerm);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    if (roomData) {
      setIsAllowLinkSharing(roomData.isAllowLinkSharing ?? true);
      setIsAllowCodeSharing(roomData.isAllowCodeSharing ?? true);
    }
  }, [roomData]);

  const roles = ["viewer", "editor", "commenter"];
  const access = ["anyone", "invited"];
  const link = `${import.meta.env.VITE_CLIENT_URL}/notes-together/join-link/${roomData?.shareLink?.token}/${roomData?.shareLink?.role || "viewer"}`;

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

  const handleRoleChange = (role) => {
    setSelectedRole(role);
    updateLinkShare(roomData._id, role, selectedAccess);
  };

  const handleAccessChange = (access) => {
    setSelectedAccess(access);
    updateLinkShare(roomData._id, selectedRole, access);
  };

  const handleUpdateCodeRoom = async () => {
    if (loading) return;

    setIsChangeCode(true);
    const result = await updateRoomCode(roomData._id);

    if (result.success) {
      setTimeout(() => {
        setIsChangeCode(false);
      }, 1000);
    } else {
      setIsChangeCode(false);
      alert(result.message);
    }
  };

  const handleInvite = (userId) => {
    invitedUsers(roomData?._id, userId);
    
  };

  return (
    <>
      <div className=" border-s-2 border-gray px-15 pt-9 flex flex-col gap-8">
        <div className="flex flex-col gap-3 relative mb-1">
          <div className=" gap-3 relative ">
            <span className="flex items-center justify-between text-2xl font-semibold mb-4">
              Invited Colleague
              <div className="bg-white flex items-center rounded-xl relative">
                <Icon
                  icon="mdi:search"
                  width="20"
                  height="20"
                  className="absolute left-2 text-secondary"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-53 py-1.5 rounded-lg ps-9 outline-0 font-normal text-gray-500 border-2 border-gray text-sm"
                />
              </div>
            </span>
            <div className=" max-h-42 overflow-auto no-scrollbar">
              {users.map((user) => {
                const isMember = roomData?.members?.some(
                  (member) => member?.user?._id === user?._id,
                );

                const isInvited = roomData?.invitedUsers?.some((m) => {
                  // กรณีที่ 1: m เป็น Object ให้เช็ก m?._id
                  // กรณีที่ 2: m เป็น String ID โล่งๆ ให้เอา m มาเทียบตรงๆ ได้เลย
                  return (m?._id || m) === user?._id;
                });

                return (
                  <div
                    key={user?._id}
                    className="flex items-center justify-between py-2 px-5"
                  >
                    <div className=" flex items-center gap-3">
                      <div
                        style={{ borderColor: user?.avatar }}
                        className="flex-none bg-white border-2 w-10 h-10 rounded-full flex items-center justify-center"
                      >
                        <Icon
                          icon="mdi:account"
                          style={{ color: user?.avatar }}
                          width="30"
                        />
                      </div>
                      <div className="flex flex-col ">
                        <span className="font-bold text-sm truncate text-slate-800">
                          {user?.username}
                        </span>
                        <span className="font-normal text-xs text-secondary truncate">
                          {user?.email}
                        </span>
                      </div>
                    </div>
                    <div>
                      <button
                        onClick={() => handleInvite(user?._id)}
                        disabled={isInvited}
                        className={`${isInvited ? "bg-gray-300 cursor-not-allowed" : "bg-blue-400 cursor-pointer hover:bg-blue-500"} flex text-white items-center gap-2 px-5 text-sm py-1 font-semibold rounded-md `}
                      >
                        <Icon icon="mdi:invite" width={20} />
                        Invite
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-3 relative mb-1">
          <div className="flex items-center gap-5 mb-2">
            <span className="text-2xl font-semibold">Share Link</span>
            <div className="px-4 border-2 border-gray rounded-lg">
              <select
                value={roomData?.shareLink?.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                className={`${isAllowLinkSharing ? "cursor-pointer" : "cursor-not-allowed"} px-2 py-1 outline-0 text-sm font-medium text-secondary`}
                disabled={!isAllowLinkSharing}
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
                value={roomData?.shareLink?.access || "anyone"}
                onChange={(e) => handleAccessChange(e.target.value)}
                name="people-with-access"
                id=""
                className={`${isAllowLinkSharing ? "cursor-pointer" : "cursor-not-allowed"} ps-1 pe-3 py-1 outline-0 rounded-lg text-sm font-medium text-secondary`}
                disabled={!isAllowLinkSharing}
              >
                {access.map((ac) => (
                  <option key={ac} value={ac}>
                    {ac === "anyone"
                      ? "anyone with link"
                      : "only invited people"}
                  </option>
                ))}
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
              className={`${isAllowCodeSharing ? "bg-blue-500 hover:bg-blue-600 cursor-pointer" : "bg-gray-400 cursor-not-allowed"} text-white px-6 py-2 rounded-lg font-semibold transition-colors`}
            >
              {isCopiedCode ? "Copied" : "Copy"}
            </button>
            <button
              disabled={!isAllowCodeSharing}
              onClick={handleUpdateCodeRoom}
              className={`${isAllowCodeSharing ? "bg-yellow-400 hover:bg-yellow-500 cursor-pointer" : "bg-gray-400 cursor-not-allowed"} text-white px-6 py-2 rounded-lg font-semibold transition-colors`}
            >
              {isChangeCode ? "Changing" : "Change"}
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
