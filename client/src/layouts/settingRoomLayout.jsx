import { useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Icon } from "@iconify/react";

import SettingRoomSidebar from "../components/settingRoom-sidebar";
function SettingRoomLayout() {
  const navigate = useNavigate();

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
          <SettingRoomSidebar/>
          <Outlet/>
        </div>
      </div>
    </>
  );
}

export default SettingRoomLayout;
