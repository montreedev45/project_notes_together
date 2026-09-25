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
      <div className="flex flex-col gap-6 w-full max-w-3xl pt-2 pb-8 mx-auto">
      
      {/* --- Header & Search (แยกออกจากกันอย่างถูกต้อง) --- */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-3">
        <h2 className="text-xl font-bold text-slate-800">Transfer Ownership</h2>
        
        <div className="bg-white flex items-center rounded-lg relative w-full sm:w-64 border border-gray-300 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
          <Icon icon="mdi:search" width="20" className="absolute left-3 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search member..."
            className="w-full py-2 pl-10 pr-4 outline-none text-sm text-slate-700 bg-transparent"
          />
        </div>
      </div>

      {/* --- Member List --- */}
      {/* เปลี่ยน max-h-120 เป็น max-h-[500px] */}
        <div className="max-h-115 overflow-y-auto flex flex-col gap-3 pr-2">
        {filteredMembers.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-slate-400">
            <Icon icon="mdi:account-search-outline" width="48" className="mb-2 opacity-50" />
            <span className="font-medium text-sm">No members found matching your search.</span>
          </div>
        ) : (
          filteredMembers.map((member) => {
            const isOwner = roomData?.owner?._id === member.user?._id;

            return (
              <div
                key={member?.user?._id}
                className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-4 p-4 bg-white border border-gray-100 rounded-xl shadow-sm hover:border-blue-100 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-50 flex-1">
                  <div
                    style={{ borderColor: member?.user?.avatar || "#e2e8f0" }}
                    className="flex-none bg-white border-2 w-12 h-12 rounded-full flex items-center justify-center relative shadow-sm"
                  >
                    <Icon
                      icon="mdi:account"
                      style={{ color: member?.user?.avatar }}
                      width="24"
                    />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="font-bold text-base text-slate-800 truncate flex items-center gap-1.5">
                      {member?.user?.username}
                    </span>
                  </div>
                </div>
                
                {/* --- Actions --- */}
                <div className="w-full sm:w-auto flex shrink-0">
                  {isOwner ? (
                    // UX Fix: เปลี่ยนจากปุ่มกดไม่ได้ เป็นป้ายบอกสถานะ
                    <span className="flex items-center justify-center gap-1.5 w-full sm:w-auto px-5 py-2 text-sm font-bold text-slate-500 bg-slate-100 border border-slate-200 rounded-lg">
                      <Icon icon="mdi:star" width="18" className="text-yellow-500" />
                      Current Owner
                    </span>
                  ) : (
                    // ปุ่ม Transfer ที่ดูอันตรายและโดดเด่น
                    <button
                      onClick={() => handleTransfer(member?.user?._id, member?.user?.username)}
                      className="flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2 text-sm font-bold text-white bg-red-500 hover:bg-red-600 active:scale-95 rounded-lg transition-all shadow-sm"
                    >
                      <Icon icon="mdi:transfer-right" width="20" />
                      Transfer
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
      
    </div>
    </>
  );
}

export default SettingRoomTransferOwnership;
