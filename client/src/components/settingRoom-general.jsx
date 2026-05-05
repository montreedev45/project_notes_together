import { useContext, useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { useParams, useOutletContext } from "react-router-dom";
import ColorPicker from "../components/colorPicker";
import Toggle from "../components/toggleButton";
import SettingRoomPreview from "./SettingRoom-preview";
import useRoomStore from "../store/useRoomStore";

function SettingRoomGeneral() {
  const updateRoomLocal = useRoomStore((state) => state.updateRoomLocal);
  const myRooms = useRoomStore((state)=> state.myRooms)
  const updateRoom = useRoomStore((state)=> state.updateRoom)

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
    updateRoom(id, myRooms)
  }


  return (
    <>
      <div className=" border-s-2 border-gray px-15 pt-9 flex flex-col gap-4">
        <div className="flex flex-col gap-3 relative">
          <span className="text-2xl font-semibold">Room name</span>
          <input
            type="text"
            value={roomData?.name || ""}
            name="name"
            onChange={handleChange}
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
            value={roomData?.description || ""}
            name="description"
            onChange={handleChange}
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
            name="color"
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            onChange={handleChange}
          />
        </div>
        <div className="grow flex flex-col justify-start  gap-3">
          <div className="flex items-center gap-3">
            <Toggle
              name="isOnlineStatus"
              key={roomData?._id}
              onToggle={(val) => handleChange({ target: { name: "isOnlineStatus", value: val } })}
              defaultChecked={roomData?.isOnlineStatus}
            />
            <span className="text-lg">show online status</span>
          </div>
          <div className="flex items-center gap-3">
            <Toggle
              name="isLastEditTime"
              key={roomData?._id}
              onToggle={(val) => handleChange({ target: { name: "isLastEditTime", value: val } })}
              defaultChecked={roomData?.isLastEditTime}
            />
            <span className="text-lg">show last edited timestamp</span>
          </div>
          <div className="flex items-center gap-3">
            <Toggle
              name="isPeopleJoinRoom"
              key={roomData?._id}
              onToggle={(val) => handleChange({ target: { name: "isPeopleJoinRoom", value: val } })}
              defaultChecked={roomData?.isPeopleJoinRoom}
            />
            <span className="text-lg">show people join room</span>
          </div>
        </div>
        <span onClick={handleUpdate} className="w-full text-center text-lg cursor-pointer button-primary bg-primary rounded-lg hover:bg-blue-500 transition-colors mb-8">
          Save
        </span>
      </div>
    </>
  );
}

export default SettingRoomGeneral;
