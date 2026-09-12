import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useParams } from "react-router-dom";
import DeleteRoomModal from "./deleteRoomModal";

function SettingRoomSidebar() {
  const { id } = useParams();

  const [isOpenDeleteRoomModal, setIsOpenDeleteRoomModal] = useState(false);
  return (
    <>
      <div className="p-4 xl:bg-transparent shrink-0 xl:w-60 border-b xl:border-b-0 border-gray-200">
        <span className="text-xl xl:text-2xl font-semibold hidden lg:flex items-center gap-2 mb-4">
          <Icon icon="mdi:folder" className="text-slate-800" width="40" />
          Room
        </span>

        <ul className="flex flex-row min-[1024px]:flex-col xl:flex-col gap-2 overflow-x-auto no-scrollbar text-sm text-secondary xl:text-base font-medium xl:border-t-2 xl:border-gray-100 xl:pt-4">
          <Link
            to={`/notes-together/${id}/setting-room/general`}
            className="shrink-0"
          >
            <li className="hover:text-black cursor-pointer transition-colors rounded-lg hover:bg-blue-100 p-2 md:p-3 text-center md:text-left capitalize">
              General
            </li>
          </Link>
          <Link
            to={`/notes-together/${id}/setting-room/member`}
            className="shrink-0"
          >
            <li className="hover:text-black cursor-pointer transition-colors rounded-lg hover:bg-blue-100 p-2 md:p-3 text-center md:text-left capitalize">
              Member
            </li>
          </Link>
          <Link
            to={`/notes-together/${id}/setting-room/share`}
            className="shrink-0"
          >
            <li className="hover:text-black cursor-pointer transition-colors rounded-lg hover:bg-blue-100 p-2 md:p-3 text-center md:text-left capitalize">
              Share
            </li>
          </Link>
          <Link
            to={`/notes-together/${id}/setting-room/transfer-ownership`}
            className="shrink-0"
          >
            <li className="cursor-pointer transition-colors rounded-lg text-yellow-400 hover:bg-yellow-100 p-2 md:p-3 text-center md:text-left capitalize">
              Transfer Ownership
            </li>
          </Link>
          <li className="shrink-0">
            <button
              onClick={() => setIsOpenDeleteRoomModal(true)}
              className="w-full text-left text-red-500 hover:text-red-600 cursor-pointer transition-colors rounded-lg hover:bg-red-100 p-2.5 xl:p-3 capitalize"
            >
              Delete Room
            </button>
          </li>
        </ul>

        <DeleteRoomModal
          roomId={id}
          isOpen={isOpenDeleteRoomModal}
          onClose={() => setIsOpenDeleteRoomModal(false)}
        />
      </div>
    </>
  );
}

export default SettingRoomSidebar;
