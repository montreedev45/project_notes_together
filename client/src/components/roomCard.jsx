import { Icon } from "@iconify/react";
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import JoinRoomModal from "./joinRoomModal";
import DeleteRoomModal from "./deleteAccountModal";
import useAuthStore from "../store/useAuthStore";
import useRoomStore from "../store/useRoomStore";
import useModalStore from "../store/useModalStore";

function RoomCard({ data = {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const leaveRoom = useRoomStore((state) => state.leaveRoom);
  const saveToRecent = useRoomStore((state) => state.saveToRecent);
  const restoreRoom = useRoomStore((state) => state.restoreRoom);
  const permanentlyDelete = useRoomStore((state) => state.permanentlyDelete);
  const deleteRoom = useRoomStore((state) => state.deleteRoom);
  const openDeleteModal = useModalStore((state) => state.openDeleteModal);

  const [isOpenMenuModal, setIsOpenMenuModal] = useState(false);
  const [isOpenJoinRoomModal, setIsOpenJoinRoomModal] = useState(false);
  const isUrlFromTrash = location.pathname.includes("trash");

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // ฟังก์ชันตรวจจับการคลิกข้างนอก
    const handleClickOutside = (event) => {
      // ถ้าเมนูเปิดอยู่ และ จุดที่คลิก "ไม่ใช่" พื้นที่ของเมนู
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

  //test navigate
  const handleClickRoom = (e) => {
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
      navigate(`/notes-together/${data._id}/editor`);
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

  return (
    <>
      <div
        key={data._id}
        onClick={handleClickRoom}
        className="min-w-55 max-w-55 min-h-55 max-h-55 bg-white shadow-md p-3 rounded-lg cursor-pointer hover:scale-105 transition-transform flex flex-col justify-between"
      >
        <div className="flex items-center justify-between mb-1">
          <Icon icon="mdi:folder" width="50" style={{ color: data.color }} />
          <div className="relative flex items-center">
            {data?.isPrivate ? (
              <Icon icon="mdi:lock" className="text-black" width={20} />
            ) : (
              ""
            )}
            <Icon
              ref={buttonRef}
              onClick={(e) => {
                e.stopPropagation();
                setIsOpenMenuModal(!isOpenMenuModal);
              }}
              icon="mdi:menu"
              width="30"
              className="text-secondary"
            />
            {isOpenMenuModal && (
              <>
                <div
                  ref={menuRef}
                  className="absolute left-full ml-7 -top-2 z-50 select-none"
                  onClick={(e) => e.stopPropagation()} // กันการคลิกในเมนูแล้วเด้งเข้าห้อง
                >
                  <div
                    className={`relative ${isUrlFromTrash ? `w-35` : `w-30`} bg-white border border-slate-200 rounded-xl shadow-lg p-2`}
                  >
                    {/* 1. ส่วนที่เป็น "ติ่ง" (Arrow) ชี้ไปทางซ้าย */}
                    <div className="absolute -left-1.5 top-4 w-3 h-3 bg-white border-l border-t border-slate-200 -rotate-45"></div>

                    {/* 2. รายการเมนูข้างใน */}
                    <ul className="relative z-10 flex flex-col gap-1">
                      {isUrlFromTrash ? (
                        <>
                          <li onClick={handleRestore}>
                            <Link className="block text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-green-100 hover:text-green-500 cursor-pointer transition-colors">
                              restore
                            </Link>
                          </li>
                          <li onClick={handleDeleteForever}>
                            <Link className="block text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-red-200 hover:text-red-400 cursor-pointer transition-colors">
                              delete forever
                            </Link>
                          </li>
                        </>
                      ) : (
                        <>
                          <li onClick={handleClickRoom}>
                            <Link className="block text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-gray-200 hover:text-black cursor-pointer transition-colors">
                              open
                            </Link>
                          </li>
                          <li
                            onClick={() => {
                              (e) => e.stopPropagation();
                              setIsOpenMenuModal(false);
                            }}
                          >
                            <Link
                              to={`/notes-together/${data._id}/setting-room/general`}
                              className="block text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-gray-200 hover:text-black cursor-pointer transition-colors"
                            >
                              setting
                            </Link>
                          </li>
                          <li
                            onClick={() => {
                              (e) => e.stopPropagation();
                              setIsOpenMenuModal(false);
                            }}
                          >
                            <Link className="block text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-gray-200 hover:text-black cursor-pointer transition-colors">
                              invite
                            </Link>
                          </li>
                          <li onClick={handleLeaveRoom}>
                            <Link className="block text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-gray-200 hover:text-black cursor-pointer transition-colors">
                              leave
                            </Link>
                          </li>
                          <li onClick={handleDeleteRoom}>
                            <button className="w-full block text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-gray-200 hover:text-red-500 cursor-pointer transition-colors">
                              delete
                            </button>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <span className="text-2xl font-semibold flex items-center">
          {data.name}
          {data?.owner?._id === user._id && (
            <Icon icon="mdi:star" className="text-yellow-200 ms-2" width={25} />
          )}
        </span>

        <p className="text-secondary text-sm font-medium">
          {data?.description}
        </p>
        <div className="flex items-center gap-1 my-4 -space-x-4">
          {data.isPeopleJoinRoom && (
            <>
              {data?.members?.slice(0, 5).map((member) => (
                <div
                  key={member._id}
                  style={{ borderColor: member?.user?.avatar }}
                  className="flex-none bg-white border-2 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer"
                >
                  <Icon
                    icon="mdi:account"
                    style={{ color: member?.user?.avatar }}
                    width="30"
                  />
                </div>
              ))}
              {data?.members?.length > 5 && (
                <div className="flex-none bg-gray-200 border-2 border-white w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600 z-0">
                  +{data.members.length - 5}
                </div>
              )}
            </>
          )}
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-secondary text-sm">
            {data?.isOnlineStatus && (
              <>
                <div className="w-3 h-3 rounded-full bg-green-400"></div>
                <span>2 online</span>
              </>
            )}
          </span>
          <span className="text-sm text-secondary">
            {data?.isLastEditTime && (
              <>
                <span>edited 5 min ago</span>
              </>
            )}
          </span>
        </div>
      </div>
      <JoinRoomModal
        isOpen={isOpenJoinRoomModal}
        onClose={() => setIsOpenJoinRoomModal(false)}
      />
    </>
  );
}

export default RoomCard;
