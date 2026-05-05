import { useState } from "react";
import { Icon } from "@iconify/react";
import { useParams, useOutletContext } from "react-router-dom";
import SettingRoomPreview from "./SettingRoom-preview";
import useRoomStore from "../store/useRoomStore";
import useAuthStore from "../store/useAuthStore";

function SettingRoomShare() {
  const user = useAuthStore((state) => state.user);
  const { roomData } = useOutletContext();
  const [isCopied, setIsCopied] = useState(false);

  const link = "https://notes-together/0/editor";
  const roles = ["editor", "viewer", "commenter"];

  const handleCopy = () => {
    navigator.clipboard.writeText(link);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 1000);
  };


  return (
    <>
      <div className=" border-s-2 border-gray px-15 pt-9 flex flex-col gap-8">
        <div className="flex flex-col gap-3 relative mb-3">
          <div className="flex items-center gap-5 mb-2">
            <span className="text-2xl font-semibold">Share Link</span>
            <div className="px-4 border-2 border-gray rounded-lg">
              <select
                name="permission"
                id=""
                className="cursor-pointer ps-1 pe-3 py-1 outline-0 rounded-lg text-md font-medium text-secondary"
              >
                <option value="editor" defaultValue>
                  editor
                </option>
                <option value="viewer">viewer</option>
                <option value="viewer">commenter</option>
              </select>
            </div>
            <div className="px-4 border-2 border-gray rounded-lg">
              <select
                name="people-with-access"
                id=""
                className="cursor-pointer ps-1 pe-3 py-1 outline-0 rounded-lg text-md font-medium text-secondary"
              >
                <option value="anyone" defaultValue>
                  anyone with link
                </option>
                <option value="reader">only invited people</option>
                <option value="viewer">restricted</option>
              </select>
            </div>
          </div>
          <div className="flex gap-5 items-center">
            <input
              type="text"
              readOnly
              value={link}
              className="flex-1 py-2 outline-none px-4 text-md rounded-lg border-2 border-gray text-black"
            />

            <button
              onClick={handleCopy}
              className="cursor-pointer bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              {isCopied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
export default SettingRoomShare;