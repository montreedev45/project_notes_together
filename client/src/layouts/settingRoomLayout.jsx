import { useEffect, useState } from "react";
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@iconify/react";
import useRoomStore from "../store/useRoomStore";
import SettingRoomPreview from "../components/SettingRoom-preview";
import SettingRoomSidebar from "../components/settingRoom-sidebar";


function SettingRoomLayout() {
  const navigate = useNavigate();
  const {id} = useParams();
  const getMyRooms = useRoomStore(state => state.getMyRooms)
  const myRooms = useRoomStore(state => state.myRooms)
  const roomData = myRooms.find(r => r._id === id) 

  useEffect(() => {
    getMyRooms();
  }, []);
  
  return (
    <>
      <div className="p-12 pt-8 pb-0">
        <span className="flex  items-center gap-2 font-bold text-3xl ">
          <Icon
            icon="ooui:arrow-previous-ltr"
            className="cursor-pointer"
            onClick={() => navigate(-1)}
            width="28"
            height="28"
          />
          Room Setting
        </span>
        <div className="bg-third border-2 border-gray mt-5 h-155 overflow-auto rounded-2xl ps-10 pe-4 py-0 grid grid-cols-[260px_1fr_320px]">
          <SettingRoomSidebar />
          <Outlet context={{roomData}}/>
        <SettingRoomPreview roomData={roomData}/>
        </div>
      </div>
    </>
  );
}

export default SettingRoomLayout;
