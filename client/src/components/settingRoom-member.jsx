import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useOutletContext } from "react-router-dom";
import useRoomStore from "../store/useRoomStore";

function SettingRoomMember() {
  const { roomData } = useOutletContext();
  const updateRole = useRoomStore((state) => state.updateRole);
  const deleteMember = useRoomStore((state) => state.deleteMember);
  const [selectedRoles, setSelectedRoles] = useState({});

  const roles = ["editor", "viewer", "commenter"];

  const handleUpdateRole = (userId, role) => {
    if (window.confirm("Are you sure you want to change this user's role?")) {
      setSelectedRoles((prev) => ({ ...prev, [userId]: role }));
      updateRole(roomData?._id, userId, role);
    }
  };

  const handleDeleteMember = (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      deleteMember(roomData?._id, userId);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-6 w-full max-w-3xl pt-2 pb-8 mx-auto">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <span className="text-2xl font-medium text-slate-800">Members</span>
          <span className="text-sm font-bold bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full border border-blue-100">
            {roomData?.members?.length || 0} Total
          </span>
        </div>

        <div className="max-h-115 overflow-y-auto flex flex-col gap-3 pr-2">
          {roomData?.members?.map((m) => {
            const isRoomOwner = m?.user?._id === roomData?.owner?._id;

            return (
              <div
                key={m?.user?._id}
                className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-100 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-50 flex-1">
                  <div
                    style={{ borderColor: m?.user?.avatar || "#e2e8f0" }}
                    className="flex-none bg-white border-2 w-12 h-12 rounded-full flex items-center justify-center relative shadow-sm"
                  >
                    <Icon
                      icon="mdi:account"
                      style={{ color: m?.user?.avatar }}
                      width="28"
                    />
                  </div>

                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-base text-slate-800 truncate flex items-center gap-1.5">
                      {m?.user?.username}
                      {isRoomOwner && (
                        <Icon
                          icon="mdi:star"
                          width="18"
                          className="text-yellow-400 shrink-0 drop-shadow-sm"
                          title="Room Owner"
                        />
                      )}
                    </span>
                    <span className="font-medium text-xs text-slate-500 truncate">
                      {m?.user?.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end border-t sm:border-none border-gray-50 pt-3 sm:pt-0">
                  {isRoomOwner ? (
                    <span className="text-xs font-bold text-slate-400 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
                      Owner
                    </span>
                  ) : (
                    <>
                      <div className="px-2 py-1.5 bg-gray-50 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                        <select
                          name="permission"
                          value={selectedRoles[m?.user?._id] || m?.role}
                          onChange={(e) =>
                            handleUpdateRole(m?.user?._id, e.target.value)
                          }
                          className="cursor-pointer bg-transparent outline-none text-sm font-semibold text-slate-700 w-23.75"
                        >
                          {roles?.map((role) => (
                            <option
                              key={role}
                              value={role}
                              disabled={role === m?.role}
                            >
                              {role}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => handleDeleteMember(m?.user?._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                        title="Remove member"
                      >
                        <Icon icon="mdi:trash-can-outline" width="22" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}

          {roomData?.members?.length === 0 && (
            <div className="flex flex-col items-center justify-center p-10 text-slate-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <Icon
                icon="mdi:account-group-outline"
                width="48"
                className="mb-2 opacity-50"
              />
              <span className="font-medium">No members found</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
export default SettingRoomMember;
