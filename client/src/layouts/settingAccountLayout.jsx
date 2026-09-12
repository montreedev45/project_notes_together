import { Outlet } from "react-router-dom";

import SettingAccountSidebar from "../components/settingAccount-sidebar";
function SettingAccountLayout() {

  return (
    <>
      <div className="p-4 md:p-8 lg:p-12 pb-0 flex flex-col h-full">
        <span className="flex items-center gap-2 font-bold text-2xl md:text-3xl text-slate-800">
          Account Setting
        </span>
        <div className="border-2 border-gray-200 mt-5 rounded-2xl flex flex-col md:flex-row overflow-hidden bg-white min-h-125">
          <SettingAccountSidebar />
          <div className="flex-1 p-4 md:p-8 flex justify-center overflow-y-auto">
            <Outlet />
          </div>
        </div>
      </div>
    </>
  );
}

export default SettingAccountLayout;
