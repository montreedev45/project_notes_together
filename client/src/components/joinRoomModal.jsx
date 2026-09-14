import { Icon } from "@iconify/react";
import { useState } from "react";
import useRoomStore from "../store/useRoomStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore";

function JoinRoomModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [code, setCode] = useState(new Array(6).fill(""));

  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const joinRoom = useRoomStore((state) => state.joinRoom);
  const user = useAuthStore((state) => state.user);

  //clear value when modal close
  useEffect(() => {
    if (!isOpen) {
      setCode(new Array(6).fill(""));
    }
  }, [isOpen]);

  const handleFillCode = async (element, index) => {
    if (isNaN(element.value)) return false;

    const newCode = [...code];
    newCode[index] = element.value;
    setCode(newCode);

    const fullCode = newCode.join("");

    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }

    if (fullCode.length === 6) {
      const res = await joinRoom(fullCode);

      if (!res || !res.success || !res.data) {
        console.log("Join failed:", res);
        onClose();
        return; 
      }

      const roomId = res?._id || res?.data?._id;
      const userId = user?._id;

      const matchedMember = res.data.members.find(
        (m) => m?.user?._id === userId || m?._id === userId,
      );

      if (res.success === true) {
        onClose();
        navigate(`/notes-together/${roomId}/${matchedMember.role}`);
      }else{
        onClose();
      }
    }
  };

  const handlePaste = async (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pasteData)) return;

    const newCode = [...code];
    const characters = pasteData.split("");

    characters.forEach((char, index) => {
      if (index < 6) newCode[index] = char;
    });

    setCode(newCode);
    const fullCode = newCode.join("");

    const nextIndex = Math.min(characters.length, 5);
    document.getElementById(`code-${nextIndex}`)?.focus();

    if (fullCode.length === 6) {
      try {
        const res = await joinRoom(fullCode);
        const roomId = res?._id || res?.data?._id;
        const userId = user?._id;

        const matchedMember = res.data.members.find(
          (m) => m?.user?._id === userId || m?._id === userId,
        );

        if (res.success === true) {
          setStatus("success");
          navigate(`/notes-together/${roomId}/${matchedMember.role}`);
          onClose();
        } else {
          setErrorMsg(res.message);
          setStatus(res?.status || "error");
        }

        if (roomId) {
          onClose();
          navigate(`/notes-together/${roomId}/${matchedMember.role}`);
        } else {
          console.error("Join failed: Invalid Room ID");
          setErrorMsg(res.message);
        }
      } catch (error) {
        setErrorMsg(error.message);
        setStatus("error");
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 transition-opacity"
      onClick={onClose}
    >
      <div
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200 shadow-xl ring-1 ring-slate-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-5 border-b border-gray-200 bg-slate-50">
          <h2 className="text-xl font-bold text-slate-800">Join Room</h2>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-200 rounded-full cursor-pointer transition-colors"
          >
            <Icon icon="mdi:close" width="22" className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 pt-8 space-y-6 flex flex-col items-center">
          {/* OTP Inputs */}
          <div className="flex items-center justify-center gap-3">
            {code.map((data, index) => (
              <input
                key={index}
                id={`code-${index}`}
                onPaste={index === 0 ? handlePaste : undefined}
                type="text"
                maxLength="1"
                className="w-12 h-14 bg-gray-50 border-2 border-gray-200 rounded-lg text-center text-2xl font-bold text-slate-800 focus:border-primary focus:bg-white outline-none transition-colors"
                value={data}
                onChange={(e) => handleFillCode(e.target, index)}
                onKeyDown={(e) => {
                  if (
                    e.key === "Backspace" &&
                    !code[index] &&
                    e.target.previousSibling
                  ) {
                    e.target.previousSibling.focus();
                  }
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinRoomModal;
