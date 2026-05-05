import { useState, useEffect } from "react";
import { Icon } from "@iconify/react";
import { useParams, useOutletContext } from "react-router-dom";
import SettingRoomPreview from "./SettingRoom-preview";
import useRoomStore from "../store/useRoomStore";
import useAuthStore from "../store/useAuthStore";

function SettingRoomMember() {
  const user = useAuthStore((state) => state.user);
  const users = useAuthStore((state) => state.users);
  const getUser = useAuthStore((state) => state.getUser);
  const addMember = useRoomStore((state) => state.addMember);
  const updateRole = useRoomStore((state)=> state.updateRole)
  const { roomData } = useOutletContext();
  const [isCopied, setIsCopied] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRoles, setSelectedRoles] = useState({});

  const link = "https://notes-together/0/editor";
  const roles = ["editor", "viewer", "commenter"];

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };

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

  const handleRoleChange = (userId, role) => {
    setSelectedRoles((prev) => ({ ...prev, [userId]: role }));
  };

  const handleUpdateRole = (userId, role) => {
  if (window.confirm("Are you sure you want to change this user's role?")) {
    
    setSelectedRoles((prev) => ({ ...prev, [userId]: role }));

    updateRole(roomData?._id, userId, role);

  }
};


  return (
    <>
      <div className=" border-s-2 border-gray px-15 pt-9 flex flex-col gap-8">
        <div className=" gap-3 relative ">
          <span className="flex items-center justify-between text-2xl font-semibold mb-4">
            Add Member
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
          <div className=" max-h-42 overflow-auto">
            {users.map((user) => {
              const isMember = roomData?.members?.some(
                (member) => member?.user?._id === user?._id,
              );

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
                  <div className="flex items-center gap-3">
                    {!isMember ? (
                      <>
                        <div className=" px-2 rounded-lg border-2 border-gray">
                          <select
                            value={selectedRoles[user._id] || "editor"}
                            onChange={(e) =>
                              handleRoleChange(user._id, e.target.value)
                            }
                            className="cursor-pointer px-2 py-1 outline-0 text-sm font-medium text-secondary"
                          >
                            {roles.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </div>
                        <button
                          onClick={() => handleAddMember(user)}
                          className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white  px-5 py-1 rounded-lg font-semibold transition-all"
                        >
                          Add
                        </button>
                      </>
                    ) : (
                      <>
                        <span className="text-red-300 font-medium text-sm">
                          Already member
                        </span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className=" flex flex-col relative">
          <span className="flex  justify-between text-2xl font-semibold">
            Members ({roomData?.members?.length || 0})
          </span>
          <div className="h-57 px-5 mt-1 overflow-auto">
            {roomData?.members?.map((m) => {
              const isRoomOwner = m?.user?._id === roomData?.owner?._id;
              return (
                <div
                  key={m?.user?._id}
                  className="flex items-center justify-between mt-3 pb-1"
                >
                  <div className="grow flex items-center gap-3">
                    <div
                      style={{ borderColor: m?.user?.avatar }}
                      className="flex-none bg-white border-2 w-10 h-10 rounded-full flex items-center justify-center"
                    >
                      <Icon
                        icon="mdi:account"
                        style={{ color: m?.user?.avatar }}
                        width="30"
                      />
                    </div>
                    <div className="flex flex-col min-w-20 leading-tight">
                      <span className="font-bold text-sm truncate text-slate-800 flex gap-2">
                        {m?.user?.username}
                        {isRoomOwner && (
                          <>
                            <Icon
                              icon="mdi:star"
                              width="20"
                              className="text-yellow-300"
                            />
                          </>
                        )}
                      </span>
                      <span className="font-normal text-xs text-secondary truncate">
                        {m?.user?.email}
                      </span>
                    </div>
                  </div>
                  <div className="grow flex-none flex gap-3 items-center">
                    <span className="w-3 h-3 rounded-full bg-green-500"></span>
                    online
                  </div>
                  <div className="min-w-42 max-w-42 flex-none flex gap-3 py-1 items-center">
                    {!isRoomOwner && (
                      <>
                        <div className="px-2 border-2 border-gray rounded-lg">
                          <select
                            name="permission"
                            value={selectedRoles[m?.user?._id] || m?.role}
                            onChange={(e) =>
                              handleUpdateRole(m?.user?._id, e.target.value)
                            }
                            id=""
                            className="cursor-pointer px-2 py-1 outline-0 rounded-lg  text-sm font-semibold text-secondary"
                          >
                            {roles?.map((role) => (
                              <option key={role} value={role}>
                                {role}
                              </option>
                            ))}
                          </select>
                        </div>
                        <Icon
                          icon="mdi:trash"
                          className="text-secondary cursor-pointer hover:text-olive-500 transition-all"
                          width="24"
                        ></Icon>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
export default SettingRoomMember;
