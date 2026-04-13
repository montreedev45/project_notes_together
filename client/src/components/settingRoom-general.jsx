import { useState } from "react";
import { Icon } from "@iconify/react";
import ColorPicker from "../components/colorPicker";
import Toggle from "../components/toggleButton";

function SettingRoomGeneral() {
  const [selectedColor, setSelectedColor] = useState("green");
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  return (
    <>
      <div className=" border-s-2 border-gray px-15 pt-9 flex flex-col gap-4">
        <div className="flex flex-col gap-3 relative">
          <span className="text-2xl font-semibold">Room name</span>
          <input
            type="text"
            placeholder="marketing"
            className="w-full py-2.5 outline-0 px-4 text-xl rounded-lg border-2 border-gray"
          />
          <Icon
            icon="mdi:pencil"
            width="30"
            className="text-secondary absolute right-3 top-14"
          />
        </div>
        <div className="flex flex-col gap-3 relative">
          <span className="text-2xl font-semibold">Description</span>
          <textarea
            type="text"
            placeholder="marketing"
            className="w-full py-2.5 outline-0 px-4 text-xl rounded-lg border-2 border-gray"
          />
          <Icon
            icon="mdi:pencil"
            width="30"
            className="text-secondary absolute right-3 top-14"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xl font-semibold">Room Color :</span>
          <ColorPicker
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
          />
        </div>
        <div className="grow flex flex-col justify-start  gap-3">
          <div className="flex items-center gap-3">
            <Toggle
              onToggle={(val) => setShowOnlineStatus(val)}
              defaultChecked={showOnlineStatus}
            />
            <span className="text-lg">show online status</span>
          </div>
          <div className="flex items-center gap-3">
            <Toggle
              onToggle={(val) => setShowOnlineStatus(val)}
              defaultChecked={showOnlineStatus}
            />
            <span className="text-lg">show last edited timestamp</span>
          </div>
          <div className="flex items-center gap-3">
            <Toggle
              onToggle={(val) => setShowOnlineStatus(val)}
              defaultChecked={showOnlineStatus}
            />
            <span className="text-lg">show people join room</span>
          </div>
        </div>
        <span className="w-full text-center text-lg cursor-pointer button-primary bg-primary rounded-lg hover:bg-blue-500 transition-colors mb-8">
          Save
        </span>
      </div>
      <div className="border-s-2 border-gray pt-9 ps-5 flex flex-col justify-start items-center gap-4">
        <span className="text-2xl font-semibold mb-2 rounded-lg">preview</span>
        <div className="w-55 bg-white shadow-md p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <Icon icon="mdi:folder" width="50" className="text-green" />
            <div className="relative">
              <Icon icon="mdi:menu" width="30" className="text-secondary" />
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
      </div>
    </>
  );
}

export default SettingRoomGeneral;
