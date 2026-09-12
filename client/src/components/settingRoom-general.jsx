import { useContext, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useParams, useOutletContext } from "react-router-dom";
import ColorPicker from "../components/colorPicker";
import Toggle from "../components/toggleButton";
import SettingRoomPreview from "./SettingRoom-preview";
import useRoomStore from "../store/useRoomStore";

function SettingRoomGeneral() {
  const updateRoomLocal = useRoomStore((state) => state.updateRoomLocal);
  const myRooms = useRoomStore((state) => state.myRooms);
  const updateRoom = useRoomStore((state) => state.updateRoom);

  const { roomData } = useOutletContext();
  const { id } = useParams();
  const [selectedColor, setSelectedColor] = useState("");

  //set data when roomData have value
  useEffect(() => {
    if (roomData) {
      // ใช้การเช็คว่ามี Property นี้อยู่จริงไหม แทนการเช็คค่า boolean ตรงๆ
      if (roomData.color !== undefined) {
        setSelectedColor(roomData.color);
      }
    }
  }, [roomData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    updateRoomLocal(id, { [name]: value });
  };

  const handleUpdate = () => {
    updateRoom(id, myRooms);
  };

  return (
    <>
      <div className="flex flex-col md:flex-row">
        <div className="flex flex-col gap-6 max-w-2xl lg:min-w-xl mx-auto pe-5">
          <div className="flex flex-col gap-2 relative">
            <span className="text-lg font-semibold text-slate-800">
              Room Name
            </span>
            <div className="relative">
              <input
                type="text"
                value={roomData?.name || ""}
                placeholder="Minimum 12 characters"
                maxLength={50} // 12 น่าจะน้อยไปสำหรับ max ลองปรับตามสมควร
                name="name"
                onChange={handleChange}
                className="w-full py-3 px-4 outline-none text-slate-700 rounded-lg border-2 border-gray-200 focus:border-primary pr-12 transition-colors"
              />
              <Icon
                icon="mdi:pencil"
                width="24"
                className="text-gray-400 absolute right-4 top-1/2 -translate-y-1/2"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2 relative">
            <span className="text-lg font-semibold text-slate-800">
              Description
            </span>
            <div className="relative">
              <textarea
                value={roomData?.description || ""}
                placeholder="Maximum 150 characters"
                maxLength={150}
                name="description"
                onChange={handleChange}
                rows="3"
                className="w-full py-3 px-4 outline-none text-slate-700 rounded-lg border-2 border-gray-200 focus:border-primary pr-12 transition-colors resize-none"
              />
              <Icon
                icon="mdi:pencil"
                width="24"
                className="text-gray-400 absolute right-4 top-4"
              />
            </div>
          </div>

          <div className="flex items-center gap-4 py-2">
            <span className="text-lg font-semibold text-slate-800">
              Room Color:
            </span>
            <ColorPicker
              name="color"
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              onChange={handleChange}
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-col gap-4 bg-gray-50 p-4 md:p-6 rounded-xl border border-gray-100">
            {[
              { label: "Private room", name: "isPrivate" },
              { label: "Show online status", name: "isOnlineStatus" },
              { label: "Show last edited timestamp", name: "isLastEditTime" },
              { label: "Show people join room", name: "isPeopleJoinRoom" },
              {
                label: "Allow access room with link",
                name: "isAllowLinkSharing",
              },
              {
                label: "Allow access room with code",
                name: "isAllowCodeSharing",
              },
            ].map((setting) => (
              <div
                key={setting.name}
                className="flex items-center justify-between gap-4"
              >
                <span className="text-slate-700 font-medium">
                  {setting.label}
                </span>
                <Toggle
                  name={setting.name}
                  onToggle={(val) =>
                    handleChange({ target: { name: setting.name, value: val } })
                  }
                  defaultChecked={roomData?.[setting.name]}
                />
              </div>
            ))}
          </div>

          <button
            onClick={handleUpdate}
            className=" py-2 mt-4 text-lg font-medium text-white bg-primary rounded-lg hover:bg-blue-500 active:scale-95 transition-all"
          >
            Save Changes
          </button>
        </div>
        <div className="w-full hidden md:flex md:w-85 lg:w-95 p-4 md:p-8 border-t md:border-t-0 md:border-l border-gray-200 flex-col items-center justify-start shrink-0">
          <SettingRoomPreview roomData={roomData} />
        </div>
      </div>
    </>
  );
}

export default SettingRoomGeneral;
