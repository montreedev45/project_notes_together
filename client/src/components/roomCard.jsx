import { Icon } from "@iconify/react";
import { useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";

function RoomCard({ index }) {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpenMenuModal, setIsOpenMenuModal] = useState(false);
  const isUrlFromTrash = location.pathname.includes("trash");
  //console.log(isUrlFromTrash);

  //test nacigate
  const handleClickRoom = () => {
    navigate(`/notes-together/${index}/editor`);
  };

  return (
    <>
      <div
        key={index}
        onClick={handleClickRoom}
        className="w-55 bg-white shadow-md p-3 rounded-lg cursor-pointer hover:scale-105 transition-transform"
      >
        <div className="flex items-center justify-between mb-1">
          <Icon icon="mdi:folder" width="50" className="text-green" />
          <div className="relative">
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
              <div className="absolute left-13 -top-2 z-50 select-none">
                <div className={`relative ${isUrlFromTrash ? `w-35` : `w-30`} bg-white border border-slate-200 rounded-xl shadow-lg p-2`}>
                  {/* 1. ส่วนที่เป็น "ติ่ง" (Arrow) ชี้ไปทางซ้าย */}
                  <div className="absolute -left-1.5 top-4 w-3 h-3 bg-white border-l border-t border-slate-200 -rotate-45"></div>

                  {/* 2. รายการเมนูข้างใน */}
                  <ul className="relative z-10 flex flex-col gap-1">
                    {isUrlFromTrash ? (
                      <>
                        <li onClick={(e) => e.stopPropagation()}>
                          <Link className="block text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-green-100 hover:text-green-500 cursor-pointer transition-colors">
                            restore
                          </Link>
                        </li>
                        <li onClick={(e) => e.stopPropagation()}>
                          <Link className="block text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-red-200 hover:text-red-400 cursor-pointer transition-colors">
                            delete forever
                          </Link>
                        </li>
                      </>
                    ) : (
                      <>
                        <li onClick={(e) => e.stopPropagation()}>
                          <Link className="block text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-gray-200 hover:text-black cursor-pointer transition-colors">
                            open
                          </Link>
                        </li>
                        <li onClick={(e) => e.stopPropagation()}>
                          <Link
                            to={`/notes-together/${index}/setting-room/general`}
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
                        <li onClick={(e) => e.stopPropagation()}>
                          <Link className="block text-left px-4 py-1.5 text-slate-500 font-medium rounded-lg text-sm hover:bg-gray-200 hover:text-black cursor-pointer transition-colors">
                            leave
                          </Link>
                        </li>
                        <li onClick={(e) => e.stopPropagation()}>
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
        <span className="text-2xl font-semibold">marketing</span>
        <p className="text-secondary text-sm font-medium">
          discuss about tasking and meeting
        </p>
        <div className="flex items-center gap-1 my-4">
          <div className="flex-none bg-white border-2 border-primary w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
            <Icon icon="mdi:account" className="text-primary" width="30" />
          </div>
          <div className="flex-none bg-white border-2 border-green w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
            <Icon icon="mdi:account" className="text-green" width="30" />
          </div>
          <div className="flex-none bg-white border-2 border-orange w-8 h-8 rounded-full flex items-center justify-center cursor-pointer">
            <Icon icon="mdi:account" className="text-orange" width="30" />
          </div>
          <span className="text-lg font-semibold text-secondary">+ 3</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-secondary text-sm">
            <div className="w-3 h-3 rounded-full bg-green-400"></div> 2 online
          </span>
          <span className="text-sm text-secondary">edited 5 min ago</span>
        </div>
      </div>
    </>
  );
}

export default RoomCard;
