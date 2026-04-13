import { useState } from "react";
import { Icon } from "@iconify/react";
import { Link , useParams} from "react-router-dom";
import DeleteRoomModal from "./deleteRoomModal";
function SettingRoomSidebar() {

    const {id} = useParams();
    const [isOpenDeleteRoomModal, setIsOpenDeleteRoomModal] =useState(false);
  return (
    <>
      <div className="pt-6">
        <span className="text-2xl font-semibold flex items-center gap-2 ps-3">
          <Icon icon="mdi:folder" className="text-green" width="60" />
          marketing
        </span>
        <ul className="grow text-md text-secondary font-semibold border-t-2 border-gray me-5 mt-3 pt-3 px-2 flex flex-col">
          <li className="hover:text-black cursor-pointer transition-all rounded-lg hover:bg-blue-200 p-3">
            <Link to={`/notes-together/${id}/setting-room/general`}>general</Link>
          </li>
          <li className="hover:text-black cursor-pointer transition-all rounded-lg hover:bg-blue-200 p-3">
            <Link to={`/notes-together/${id}/setting-room/member`}>member</Link>
          </li>
          <li onClick={()=> setIsOpenDeleteRoomModal(true)} className="hover:text-red-700 cursor-pointer transition-all rounded-lg hover:bg-red p-3">
            delete room
          </li>
          <DeleteRoomModal isOpen={isOpenDeleteRoomModal} onClose={()=> setIsOpenDeleteRoomModal(false)} />
        </ul>
      </div>
    </>
  );
}

export default SettingRoomSidebar;
