import { Icon } from "@iconify/react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import JoinRoomModal from "./joinRoomModal";
import useAuthStore from "../store/useAuthStore";
import useRoomStore from "../store/useRoomStore";
import useModalStore from "../store/useModalStore";
import { getRelativeTimeEdit } from "../utils/getRelativeTimeEdit";
import { getSocket } from "../socket";

function RoomCard({ data = {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const leaveRoom = useRoomStore((state) => state.leaveRoom);
  const saveToRecent = useRoomStore((state) => state.saveToRecent);
  const restoreRoom = useRoomStore((state) => state.restoreRoom);
  const permanentlyDelete = useRoomStore((state) => state.permanentlyDelete);
  const openDeleteModal = useModalStore((state) => state.openDeleteModal);
  const joinRoom = useRoomStore((state) => state.joinRoom);

  const relativeTimeFromStore = useRoomStore(
    (state) => state.relativeTime[data._id] || null,
  );
  const [displayTime, setDisplayTime] = useState(
    getRelativeTimeEdit(relativeTimeFromStore),
  );
  const [isOpenMenuModal, setIsOpenMenuModal] = useState(false);
  const [isOpenJoinRoomModal, setIsOpenJoinRoomModal] = useState(false);
  const isUrlFromTrash = location.pathname.includes("trash");

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const memberData = data?.members?.find((m) => m.user?._id === user?._id);
  const role = memberData?.role || "viewer";

  const isAlreadyMember = data?.members?.some(
    (m) => (m.user?._id || m.user) === user?._id,
  );
  const isOwner = data?.owner?._id === user?._id;

  const [roomOnlineCounts, setRoomOnlineCounts] = useState({});

  const socket = getSocket();

  useEffect(() => {
    if (!socket) {
      const checkSocketTimer = setInterval(() => {
        const currentSocket = getSocket();
        if (currentSocket) {
          //setSocketLocal(currentSocket);
          clearInterval(checkSocketTimer);
        }
      }, 200);
      return () => clearInterval(checkSocketTimer);
    }

    const eventName = `room-online-status:${data._id}`;

    const handleStatusChange = (res) => {
      const { roomId, count, activeUsers } = res;
      setRoomOnlineCounts((prev) => ({
        ...prev,
        [roomId]: activeUsers,
      }));
    };

    socket.on(eventName, handleStatusChange);
    return () => {
      socket.off(eventName, handleStatusChange);
    };
  }, [socket, data._id]);

  //relative time

  useEffect(() => {
    setDisplayTime(getRelativeTimeEdit(relativeTimeFromStore));

    const interval = setInterval(() => {
      setDisplayTime(getRelativeTimeEdit(relativeTimeFromStore));
    }, 60000);

    // เคลียร์ท่อเวลาก่อนหน้า ป้องกัน Memory Leak
    return () => clearInterval(interval);
  }, [relativeTimeFromStore]);

  useEffect(() => {
    // ฟังก์ชันตรวจจับการคลิกข้างนอก
    const handleClickOutside = (event) => {
      if (
        isOpenMenuModal &&
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        !buttonRef.current.contains(event.target)
      ) {
        setIsOpenMenuModal(false);
      }
    };

    // เพิ่ม Event Listener
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // ลบ Event Listener เมื่อปิดหน้าหรือลบ Component
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpenMenuModal]);

  const handleClickRoom = async(e) => {
    if (data?.isDeleted === true) {
      if (
        window.confirm("This room deleted, Do you want to restore this room ?")
      ) {
        restoreRoom(data?._id);
        setIsOpenMenuModal(false);
      }
      return;
    }

    saveToRecent(data);
    const isOwner = data?.owner?._id === user?._id;
    // 1. เช็คว่าเป็นสมาชิกในห้องอยู่แล้วหรือไม่ (ค้นหาใน Array members)
    const isAlreadyMember = data?.members?.some(
      (m) => (m.user?._id || m.user) === user?._id,
    );

    // 2. Logic การเข้าห้อง
    // ถ้าห้องเป็น Private และเรา "ไม่ใช่ทั้งเจ้าของ" และ "ไม่ใช่สมาชิก" ให้เปิด Modal
    if (data?.isPrivate && !isOwner && !isAlreadyMember) {
      setIsOpenJoinRoomModal(true);
      setIsOpenMenuModal(false);
    } else {
      // ถ้าเป็น Public หรือเป็นสมาชิกอยู่แล้ว ให้เข้า Editor ได้เลย
      const res = await joinRoom({roomId: data?._id});
      navigate(`/notes-together/${data._id}/${role}`);
    }
  };

  const handleLeaveRoom = (e) => {
    e.stopPropagation();

    if (data?.owner?._id === user?._id) {
      return alert("Owner cannot leave. Please delete the room instead.");
    }

    const isAlreadyMember = data?.members?.some(
      (m) => (m.user?._id || m.user) === user?._id,
    );

    if (isAlreadyMember) {
      if (window.confirm(`Are you sure you want to leave "${data.name}"?`)) {
        leaveRoom(data?._id, user._id);
        setIsOpenMenuModal(false);
      }
    } else {
      alert("you not member this room");
    }
  };

  const handleDeleteRoom = (e) => {
    e.stopPropagation();

    if (data?.owner?._id !== user._id) {
      return alert("Only owner room can delete room");
    }

    openDeleteModal(data._id);
    setIsOpenMenuModal(false);
  };

  const handleRestore = (e) => {
    e.stopPropagation();

    restoreRoom(data?._id);
    setIsOpenMenuModal(false);
  };

  const handleDeleteForever = (e) => {
    e.stopPropagation();
    if (window.confirm("Are you sure? once deleted, it cannot be retore")) {
      permanentlyDelete(data?._id);
    }
    setIsOpenMenuModal(false);
  };

  const handleSettingRoom = () => {
    const isAlreadyMember = data?.owner?._id === user?._id;

    if (!isAlreadyMember) {
      alert(`Only owner room can access setting page.`);
    } else {
      navigate(`/notes-together/${data._id}/setting-room/general`);
    }
  };

  return (
    <>
      <div
        key={data._id}
        onClick={handleClickRoom}
        className="w-full h-full bg-white shadow-md p-4 rounded-xl cursor-pointer hover:shadow-lg hover:-translate-y-1 transition-all flex flex-col justify-between border border-gray-100"
      >
        {/* --- Header (Icon + Menu) --- */}
        <div className="flex items-center justify-between">
          <Icon icon="mdi:folder" width="45" style={{ color: data.color }} />

          <div className="relative flex items-center gap-2">
            {data?.isPrivate && (
              <Icon icon="mdi:lock" className="text-slate-700" width={18} />
            )}

            <Icon
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpenMenuModal(!isOpenMenuModal);
              }}
              icon="mdi:dots-horizontal"
              width="28"
              className="text-gray-400 hover:text-gray-700 transition-colors p-1 rounded-md hover:bg-gray-100"
            />

            {isOpenMenuModal && (
              <div
                ref={menuRef}
                className="absolute right-0 top-10 z-50 select-none min-w-35"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="relative bg-white border border-slate-200 rounded-xl shadow-xl p-1.5">
                  <div className="absolute right-2 -top-1.5 w-3 h-3 bg-white border-l border-t border-slate-200 rotate-45"></div>
                  <ul className="relative z-10 flex flex-col gap-0.5">
                    {isUrlFromTrash ? (
                      <>
                        <li onClick={handleRestore}>
                          <span className="block px-3 py-2 text-slate-600 font-medium rounded-md text-sm hover:bg-green-50 hover:text-green-600 cursor-pointer transition-colors">
                            Restore
                          </span>
                        </li>
                        <li onClick={handleDeleteForever}>
                          <span className="block px-3 py-2 text-red-500 font-medium rounded-md text-sm hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors">
                            Delete Forever
                          </span>
                        </li>
                      </>
                    ) : (
                      <>
                        <li onClick={handleClickRoom}>
                          <span className="block px-3 py-2 text-slate-600 font-medium rounded-md text-sm hover:bg-gray-100 hover:text-slate-900 cursor-pointer transition-colors">
                            Open Room
                          </span>
                        </li>
                        {isOwner && (
                          <li
                            onClick={(e) => {
                              e.stopPropagation();
                              setIsOpenMenuModal(false);
                            }}
                          >
                            <span
                              onClick={handleSettingRoom}
                              className="block px-3 py-2 text-slate-600 font-medium rounded-md text-sm hover:bg-gray-100 hover:text-slate-900 cursor-pointer transition-colors"
                            >
                              Settings
                            </span>
                          </li>
                        )}
                        {isAlreadyMember && !isOwner && (
                          <li onClick={handleLeaveRoom}>
                            <span className="block px-3 py-2 text-slate-600 font-medium rounded-md text-sm hover:bg-gray-100 hover:text-slate-900 cursor-pointer transition-colors">
                              Leave Room
                            </span>
                          </li>
                        )}
                        {isOwner && (
                          <li onClick={handleDeleteRoom}>
                            <span className="block w-full text-left px-3 py-2 text-red-500 font-medium rounded-md text-sm hover:bg-red-50 hover:text-red-600 cursor-pointer transition-colors">
                              Delete Room
                            </span>
                          </li>
                        )}
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 mb-2 flex flex-col grow">
          <span className="text-xl font-bold flex items-center text-slate-800 truncate">
            {data.name}
            {data?.owner?._id === user?._id && (
              <Icon
                icon="mdi:star"
                className="text-yellow-400 ms-1 shrink-0"
                width={20}
              />
            )}
          </span>

          <p className="text-slate-500 mt-1 text-sm wrap-break-word line-clamp-2">
            {data?.description || "No description provided."}
          </p>
        </div>

        {/* --- Footer (Avatars + Status) --- */}
        <div className="mt-auto pt-3 border-t border-gray-50 flex flex-col gap-3">
          {/* Avatar Stack */}
          {data.isPeopleJoinRoom && (
            <div className="flex items-center -space-x-3">
              {(roomOnlineCounts[data._id] || [])
                .slice(0, 5)
                .map((member, index) => (
                  <div
                    key={member?._id || index}
                    style={{ borderColor: member?.avatar || "#fff" }}
                    className="flex-none bg-white border-2 w-8 h-8 rounded-full flex items-center justify-center relative z-10 hover:z-20 hover:-translate-y-1 transition-transform"
                  >
                    <Icon
                      icon="mdi:account"
                      style={{ color: member?.avatar }}
                      width="24"
                    />
                  </div>
                ))}

              {(roomOnlineCounts[data._id] || []).length > 5 && (
                <div className="flex-none bg-slate-100 border-2 border-white w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-slate-600 relative z-0">
                  +{(roomOnlineCounts[data._id] || []).length - 5}
                </div>
              )}
            </div>
          )}

          {/* Online Status & Time */}
          <div className="flex items-center justify-between text-xs font-medium text-slate-400">
            <span className="flex items-center gap-1.5">
              {data?.isOnlineStatus && (
                <>
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-slate-600">
                    {roomOnlineCounts[data._id]?.length || 0} online
                  </span>
                </>
              )}
            </span>
            <span>{data?.isLastEditTime && displayTime}</span>
          </div>
        </div>
      </div>

      {isOpenJoinRoomModal && (
        <JoinRoomModal
          isOpen={isOpenJoinRoomModal}
          onClose={() => setIsOpenJoinRoomModal(false)}
        />
      )}
    </>
  );
}

export default RoomCard;
