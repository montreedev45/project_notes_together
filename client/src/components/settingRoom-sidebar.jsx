import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link, useParams } from "react-router-dom";
import DeleteRoomModal from "./deleteRoomModal";
import useRoomStore from "../store/useRoomStore";

function SettingRoomSidebar() {
  const {id} = useParams()

  const [isOpenDeleteRoomModal, setIsOpenDeleteRoomModal] = useState(false);
  return (
    <>
      <div className="pt-6">
        <span className="text-2xl font-semibold flex items-center gap-2 ps-3">
          <Icon
            icon="mdi:folder"
            style={{ color: "#000000" }}
            width="60"
          />
          Room
        </span>
        <ul className="grow text-md text-secondary font-semibold border-t-2 border-gray me-5 mt-3 pt-3 px-2 flex flex-col">
          <Link to={`/notes-together/${id}/setting-room/general`}>
            <li className="hover:text-black cursor-pointer transition-all rounded-lg hover:bg-blue-200 p-3">
              general
            </li>
          </Link>
          <Link to={`/notes-together/${id}/setting-room/member`}>
            <li className="hover:text-black cursor-pointer transition-all rounded-lg hover:bg-blue-200 p-3">
              member
            </li>
          </Link>
          <Link to={`/notes-together/${id}/setting-room/share`}>
            <li className="hover:text-black cursor-pointer transition-all rounded-lg hover:bg-blue-200 p-3">
              share
            </li>
          </Link>
          <li
            onClick={() => setIsOpenDeleteRoomModal(true)}
            className="hover:text-red-700 cursor-pointer transition-all rounded-lg hover:bg-red p-3"
          >
            delete room
          </li>
          <DeleteRoomModal
            roomId={id}
            isOpen={isOpenDeleteRoomModal}
            onClose={() => setIsOpenDeleteRoomModal(false)}
          />
        </ul>
      </div>
    </>
  );
}

export default SettingRoomSidebar;
