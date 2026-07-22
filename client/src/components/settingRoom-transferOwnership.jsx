import { useState, useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import useAuthStore from "../store/useAuthStore";
import useRoomStore from "../store/useRoomStore";
import { useOutletContext, useNavigate } from "react-router-dom";
import { getSocket } from "../socket";

function SettingRoomTransferOwnership() {
  const { roomData } = useOutletContext();
  const [searchTerm, setSearchTerm] = useState("");

  const socket = getSocket()
  const navigate = useNavigate()

  const user = useAuthStore((state) => state.user);
  const users = useAuthStore((state) => state.users);
  const getUser = useAuthStore((state) => state.getUser);
  const clearUsers = useAuthStore((state) => state.clearUsers);

  const transferOwnership = useRoomStore((state) => state.transferOwnership);

  const filteredMembers = useMemo(() => {
    const allMembers = roomData?.members || [];

    if (!searchTerm.trim()) return allMembers;

    // กรองเอาเฉพาะสมาชิกที่ username ตรงกับคำที่พิมพ์ (แปลงเป็นตัวพิมพ์เล็กเพื่อไม่ให้ติดปัญหา Case-sensitive)
    return allMembers.filter((member) =>
      member.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [searchTerm, roomData]);

  const handleTransfer = async(newOwnerId, newOwnerName) => {
    const confirmTransfer = window.confirm(`Are you sure you want to transfer ownership of the room to ${newOwnerName}`)

    if(confirmTransfer){
      const res = await transferOwnership(roomData?._id, newOwnerId);
      if(res.success){
        // socket.emit("transfer_owner", {
        //   roomId: roomData._id,
        //   oldOwnerId: user._id,
        //   newOwnerId: newOwnerId
        // })

        alert("transfer ownership successfully")
        navigate("/notes-together/explore")
      }
    }
  };

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

  return (
    <>
      <div className=" border-s-2 border-gray px-15 pt-9 flex flex-col gap-8">
        <div className="flex flex-col gap-3 relative mb-1">
          <div className=" gap-3 relative ">
            <span className="flex items-center justify-between text-2xl font-semibold mb-4">
              Transfer Ownership
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
            <div className=" max-h-120 overflow-auto no-scrollbar">
              {filteredMembers.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  ไม่พบสมาชิกที่คุณกำลังค้นหา
                </p>
              ) : (
                filteredMembers.map((member) => {
                  const isOwner = roomData?.owner?._id === member.user?._id;

                  return (
                    <div
                      key={member?.user?._id}
                      className="flex items-center justify-between py-2 px-5"
                    >
                      <div className=" flex items-center gap-3">
                        <div
                          style={{ borderColor: member?.user?.avatar }}
                          className="flex-none bg-white border-2 w-10 h-10 rounded-full flex items-center justify-center"
                        >
                          <Icon
                            icon="mdi:account"
                            style={{ color: member?.user?.avatar }}
                            width="30"
                          />
                        </div>
                        <div className="flex flex-col ">
                          <span className="font-bold text-sm truncate text-slate-800">
                            {member?.user?.username}
                          </span>
                          <span className="font-normal text-xs text-secondary truncate">
                            {member?.user?.email}
                          </span>
                        </div>
                      </div>
                      <div className="min-w-50 flex">
                        <button
                          onClick={() => handleTransfer(member?.user?._id, member?.user?.username)}
                          disabled={isOwner}
                          className={
                            `${isOwner ? "bg-gray-300 cursor-not-allowed" : "bg-red-400 hover:bg-red-500 cursor-pointer"}   flex text-white items-center gap-2 px-5 text-sm py-1 font-semibold rounded-md transition-all flex-1 justify-center`
                          }
                        >
                          <Icon icon={isOwner ? "mdi:star" :"mdi:transfer"} width={20} />
                          {isOwner ? "owner" : "transfer ownership"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingRoomTransferOwnership;
