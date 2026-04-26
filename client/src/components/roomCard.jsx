import { Icon } from "@iconify/react";
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import JoinRoomModal from "./joinRoomModal";
import useAuthStore from "../store/useAuthStore";
import useRoomStore from "../store/useRoomStore";

function RoomCard({ data = {} }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const leaveRoom = useRoomStore((state) => state.leaveRoom);
  const saveToRecent = useRoomStore((state) => state.saveToRecent);
  const deleteRoom = useRoomStore((state) => state.deleteRoom);
  const restoreRoom = useRoomStore((state)=> state.restoreRoom);
  const permanentlyDelete = useRoomStore((state)=> state.permanentlyDelete);

  const [isOpenMenuModal, setIsOpenMenuModal] = useState(false);
  const isUrlFromTrash = location.pathname.includes("trash");
  const [isOpenJoinRoomModal, setIsOpenJoinRoomModal] = useState(false);

  //test navigate
  const handleClickRoom = (e) => {

    if(data?.isDeleted === true){
      if(window.confirm("This room deleted, Do you want to restore this room ?")){
        restoreRoom(data?._id)
      }
      return;
    }

    saveToRecent(data)
    const isOwner = data?.owner?._id === user?._id;
    // 1. เช็คว่าเป็นสมาชิกในห้องอยู่แล้วหรือไม่ (ค้นหาใน Array members)
    const isAlreadyMember = data?.members?.some(
      (m) => (m.user?._id || m.user) === user?._id,
    );
    

    // 2. Logic การเข้าห้อง
    // ถ้าห้องเป็น Private และเรา "ไม่ใช่ทั้งเจ้าของ" และ "ไม่ใช่สมาชิก" ให้เปิด Modal
    if (data?.isPrivate && !isOwner && !isAlreadyMember) {
      setIsOpenJoinRoomModal(true);
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
      }
    } else {
      alert("you not member this room");
    }
  };

  const handleDeleteRoom = (e)=> {
    e.stopPropagation();

    if(data?.owner?._id !== user._id){
      return alert("Only owner room can delete room")
    }

    if(window.confirm(`Are you sure delete room: ${data.name}`)){
      deleteRoom(data._id)
    }
  }

  const handleRestore = (e)=> {
    e.stopPropagation()

    restoreRoom(data?._id)
  }


  const handleDeleteForever = (e)=> {
    e.stopPropagation()
    if(window.confirm("Are you sure? once deleted, it cannot be retore")){
      permanentlyDelete(data?._id)
    }
  }

  return (
    <>
      <div
        key={data._id}
        onClick={handleClickRoom}
        className="w-55 bg-white shadow-md p-3 rounded-lg cursor-pointer hover:scale-105 transition-transform"
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
              onClick={(e) => {
                e.stopPropagation();
                setIsOpenMenuModal(!isOpenMenuModal);
              }}
              icon="mdi:menu"
              width="30"
              className="text-secondary"
            />
            {isOpenMenuModal && (
              <div className="absolute left-20 -top-2 z-50 select-none">
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
                        <li onClick={(e) => e.stopPropagation()}>
                          <Link
                            to={`/notes-together/${data._id}/setting-room/general`}
                            className="block text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-gray-200 hover:text-black cursor-pointer transition-colors"
                          >
                            setting
                          </Link>
                        </li>
                        <li onClick={(e) => e.stopPropagation()}>
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
                          <Link className="block text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-gray-200 hover:text-red-500 cursor-pointer transition-colors">
                            delete
                          </Link>
                        </li>
                      </>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
        <span className="text-2xl font-semibold flex items-center">
          {data.name}
          {data?.owner?._id === user._id && (
            <Icon icon="mdi:star" className="text-yellow-200 ms-2" width={25} />
          )}
        </span>

        <p className="text-secondary text-sm font-medium">{data.description}</p>
        <div className="flex items-center gap-1 my-4">
          {data?.members?.map((member) => (
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
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-secondary text-sm">
            <div className="w-3 h-3 rounded-full bg-green-400"></div> 2 online
          </span>
          <span className="text-sm text-secondary">edited 5 min ago</span>
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
