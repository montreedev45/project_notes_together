import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useOutletContext } from "react-router-dom";
import useRoomStore from "../store/useRoomStore";
import useAuthStore from "../store/useAuthStore";

function SettingRoomShare() {
  const users = useAuthStore((state) => state.users);
  const getUser = useAuthStore((state) => state.getUser);
  const clearUsers = useAuthStore((state) => state.clearUsers);
  const updateRoomCode = useRoomStore((state) => state.updateRoomCode);
  const loading = useRoomStore((state) => state.loading);
  const updateLinkShare = useRoomStore((state) => state.updateLinkShare);
  const invitedUsers = useRoomStore((state) => state.invitedUsers);
  const { roomData } = useOutletContext();
  const [isCopied, setIsCopied] = useState(false);
  const [isCopiedCode, setIsCopiedCode] = useState(false);
  const [isChangeCode, setIsChangeCode] = useState(false);
  const [selectedRole, setSelectedRole] = useState(roomData?.shareLink?.role);
  const [selectedAccess, setSelectedAccess] = useState(
    roomData?.shareLink?.access,
  );
  const [isAllowLinkSharing, setIsAllowLinkSharing] = useState(true);
  const [isAllowCodeSharing, setIsAllowCodeSharing] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!searchTerm.trim()) {
      clearUsers();
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      getUser(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, getUser, clearUsers]);

  useEffect(() => {
    return () => {
      clearUsers();
    };
  }, [clearUsers]);

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
      <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
        {/* =========================================
          SECTION 1: Invite Colleagues
      ========================================= */}
        <div className="flex flex-col gap-4">
          {/* แก้ไข HTML Nesting: แยก Header และ Search ออกจากกัน */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
            <h2 className="text-xl font-bold text-slate-800">
              Invite Colleagues
            </h2>

            <div className="bg-white flex items-center rounded-lg relative w-full sm:w-64 border border-gray-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
              <Icon
                icon="mdi:search"
                width="20"
                className="absolute left-3 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full py-2 pl-10 pr-4 outline-none text-sm text-slate-700 bg-transparent"
              />
            </div>
          </div>

          {/* User List */}
          <div className="max-h-75 overflow-y-auto no-scrollbar bg-gray-50 border border-gray-200 rounded-xl p-2 shadow-inner">
            {users.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-sm font-medium">
                No users found matching your search.
              </div>
            ) : (
              users.map((user) => {
                const isMember = roomData?.members?.some(
                  (member) => member?.user?._id === user?._id,
                );
                const isInvited = roomData?.invitedUsers?.some(
                  (m) => (m?._id || m) === user?._id,
                );

                return (
                  <div
                    key={user?._id}
                    className="flex items-center justify-between py-3 px-4 bg-white rounded-lg mb-2 last:mb-0 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        style={{ borderColor: user?.avatar || "#e2e8f0" }}
                        className="flex-none bg-white border-2 w-10 h-10 rounded-full flex items-center justify-center shadow-sm"
                      >
                        <Icon
                          icon="mdi:account"
                          style={{ color: user?.avatar }}
                          width="24"
                        />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-bold text-sm text-slate-800 truncate">
                          {user?.username}
                        </span>
                        <span className="font-medium text-xs text-slate-500 truncate">
                          {user?.email}
                        </span>
                      </div>
                    </div>

                    {/* UI Logic: แสดงสถานะที่ชัดเจน (Member > Invited > Invite) */}
                    <div className="shrink-0 ml-3">
                      {isMember ? (
                        <span className="text-xs font-semibold text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                          Joined
                        </span>
                      ) : isInvited ? (
                        <span className="text-xs font-semibold text-yellow-600 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100">
                          Pending
                        </span>
                      ) : (
                        <button
                          onClick={() => handleInvite(user?._id)}
                          className="flex items-center gap-1.5 text-xs font-semibold text-white bg-blue-500 hover:bg-blue-600 px-4 py-1.5 rounded-full transition-colors active:scale-95"
                        >
                          <Icon icon="mdi:invite" width="16" />
                          Invite
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* =========================================
          SECTION 2: Share Link
      ========================================= */}
        <div className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-xl font-bold text-slate-800">
              Share Link
              {selectedAccess === "invited" && <span className="text-red-400 text-xs font-medium">
                &nbsp; ( user must be invited before they can use this link. )
              </span>}
            </h2>

            {/* Settings Dropdowns */}
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={roomData?.shareLink?.access || "anyone"}
                onChange={(e) => handleAccessChange(e.target.value)}
                disabled={!isAllowLinkSharing}
                className="bg-gray-50 border border-gray-200 text-slate-700 text-sm font-medium rounded-lg px-3 py-1.5 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 transition-colors"
              >
                {access.map((ac) => (
                  <option key={ac} value={ac}>
                    {ac === "anyone"
                      ? "Anyone with link"
                      : "Only invited people"}
                  </option>
                ))}
              </select>

              <select
                value={roomData?.shareLink?.role}
                onChange={(e) => handleRoleChange(e.target.value)}
                disabled={!isAllowLinkSharing}
                className="bg-gray-50 border border-gray-200 text-slate-700 text-sm font-medium rounded-lg px-3 py-1.5 outline-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed hover:border-gray-300 transition-colors"
              >
                {roles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Link Input & Action */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              readOnly
              value={link || ""}
              className={`flex-1 py-2.5 px-4 outline-none text-sm rounded-lg border-2 transition-colors ${
                isAllowLinkSharing
                  ? "border-gray-200 bg-white text-slate-700"
                  : "border-gray-100 bg-gray-100 text-gray-400 select-none"
              }`}
            />
            <button
              disabled={!isAllowLinkSharing}
              onClick={handleCopy}
              className={`shrink-0 px-6 py-2.5 rounded-lg font-bold transition-all active:scale-95 ${
                isAllowLinkSharing
                  ? "bg-primary text-white hover:bg-blue-600 shadow-sm"
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
              {isCopied ? "Copied!" : "Copy Link"}
            </button>
          </div>

          {!isAllowLinkSharing && (
            <span className="text-sm font-medium text-red-500 bg-red-50 px-3 py-1.5 rounded-md inline-block w-fit">
              Sharing via link is currently disabled.
            </span>
          )}
        </div>

        {/* =========================================
          SECTION 3: Room Code
      ========================================= */}
        <div className="flex flex-col gap-4 bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-800">Room Code</h2>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              type="text"
              readOnly
              value={roomData?.code || ""}
              className={`flex-1 sm:max-w-50 text-center font-mono font-bold tracking-widest py-2.5 px-4 outline-none text-lg rounded-lg border-2 transition-colors ${
                isAllowCodeSharing
                  ? "border-gray-200 bg-slate-50 text-slate-800"
                  : "border-gray-100 bg-gray-100 text-gray-400 select-none"
              }`}
            />

            <div className="flex gap-2 w-full sm:w-auto">
              <button
                disabled={!isAllowCodeSharing}
                onClick={handleCopyCode}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-bold transition-all active:scale-95 ${
                  isAllowCodeSharing
                    ? "bg-primary text-white hover:bg-blue-600 shadow-sm"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isCopiedCode ? "Copied!" : "Copy Code"}
              </button>
              <button
                disabled={!isAllowCodeSharing}
                onClick={handleUpdateCodeRoom}
                className={`flex-1 sm:flex-none px-6 py-2.5 rounded-lg font-bold transition-all active:scale-95 ${
                  isAllowCodeSharing
                    ? "bg-amber-500 text-white hover:bg-amber-600 shadow-sm"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {isChangeCode ? "Changing..." : "Reset"}
              </button>
            </div>
          </div>

          {!isAllowCodeSharing && (
            <span className="text-sm font-medium text-red-500 bg-red-50 px-3 py-1.5 rounded-md inline-block w-fit">
              Sharing via code is currently disabled.
            </span>
          )}
        </div>
      </div>
    </>
  );
}
export default SettingRoomShare;
