import { Icon } from "@iconify/react";
import { useState } from "react";
import ColorPicker from "./colorPicker";
import Toggle from "./toggleButton";
import useRoomStore from "../store/useRoomStore";

function CreateRoomModal({ isOpen, onClose, key }) {
  const [selectedColor, setSelectedColor] = useState("#4b9fff");
  const [isPrivate, setIsPrivate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createRoom = useRoomStore((state) => state.createRoom);

  const handleSubmit = () => {
    const finalData = {
      name,
      description,
      isPrivate,
      selectedColor,
    };

    //console.log("finalData", finalData);

    createRoom(finalData);
    onClose();
  };

  const handleChangeName = (e) => {
    setName(e.target.value);
  };
  const handleChangeDes = (e) => {
    setDescription(e.target.value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-third w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b-2 border-secondary">
          <h2 className="text-xl font-semibold text-slate-800">create room</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
          >
            <Icon icon="mdi:close" width="24" className="text-slate-500" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-8 space-y-6">
          <div>
            <input
              type="text"
              name="name"
              value={name}
              onChange={handleChangeName}
              placeholder="Room Name (10 characters limit)"
              maxLength={10}
              className="w-full px-4 py-2.5 bg-gray-100 border-2 border-secondary rounded-xl outline-none "
            />
          </div>

          <div>
            <textarea
              rows="5"
              name="description"
              value={description}
              onChange={handleChangeDes}
              placeholder="Description"
              className="w-full px-4 py-2.5 bg-gray-100 border-2 border-secondary rounded-xl outline-none"
            ></textarea>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-2  bg-slate-50 rounded-xl border border-slate-100">
              <ColorPicker
                label="Folder Color :"
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
              <Toggle
                label="Private Room :"
                onToggle={(val) => setIsPrivate(val)} // รับค่าจากลูกมาเก็บที่แม่
                defaultChecked={isPrivate}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-2 flex justify-center">
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:scale-105 cursor-pointer active:scale-95 transition-all"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateRoomModal;
