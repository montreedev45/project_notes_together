import { Icon } from "@iconify/react";
import { useState } from "react";
import ColorPicker from "./colorPicker";
import Toggle from "./toggleButton";
import useRoomStore from "../store/useRoomStore";
import toast from "react-hot-toast";

function CreateRoomModal({ isOpen, onClose }) {
  const [selectedColor, setSelectedColor] = useState("#4b9fff");
  const [isPrivate, setIsPrivate] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const createRoom = useRoomStore((state) => state.createRoom);

  const handleSubmit = async () => {
    const finalData = {
      name,
      description,
      isPrivate,
      selectedColor,
    };

    const toastId = toast.loading("Creating room...");
    setIsLoading(true);
    const result = await createRoom(finalData);
    if (result.success === true) {
      toast.success("Created room successful", { id: toastId });
      setIsLoading(false);
      setName("");
      setDescription("");
      setIsPrivate(false);
      onClose();
    } else {
      toast.error(`${result.message || "Created room failed"}`, {
        id: toastId,
      });
      setIsLoading(false);
    }
  };

  const handleChangeName = (e) => {
    setName(e.target.value);
  };
  const handleChangeDes = (e) => {
    setDescription(e.target.value);
  };

  const handleClose = () =>{
    onClose()
    setName("")
    setDescription("")
  }
  if (!isOpen) return null;

  return (
    <div
      className="select-none fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200 shadow-2xl ring-1 ring-slate-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b-2 border-gray-300">
          <h2 className="text-xl font-semibold text-slate-800">Create Room</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
          >
            <Icon icon="mdi:close" width="24" className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 pt-8 space-y-6">
          <div>
            <input
              autoComplete="off"
              type="text"
              name="name"
              value={name}
              onChange={handleChangeName}
              placeholder="Room Name (10 characters limit)"
              maxLength={10}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl outline-primary"
            />
          </div>

          <div>
            <textarea
              rows="5"
              name="description"
              value={description}
              onChange={handleChangeDes}
              placeholder="Description"
              maxLength={50}
              className="w-full px-4 py-2.5 border-2 border-gray-300 rounded-xl outline-primary"
            ></textarea>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-2  bg-slate-50 rounded-xl border border-slate-100">
              <ColorPicker
                label="Folder Color:"
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
              />
              <Toggle
                label="Private Room:"
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
            className="w-full px-6 py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors cursor-pointer"
          >
            {isLoading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateRoomModal;
