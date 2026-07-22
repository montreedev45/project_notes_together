import { Icon } from "@iconify/react";
import { useState } from "react";
import ColorPicker from "./colorPicker";
import useRoomStore from "../store/useRoomStore";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function JoinRoomModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [code, setCode] = useState(new Array(6).fill(""));

  const [status, setStatus] = useState("loading");
  const [errorMsg, setErrorMsg] = useState("");

  const joinRoom = useRoomStore((state) => state.joinRoom);

  //clear value when modal close
  useEffect(() => {
    if (!isOpen) {
      setCode(new Array(6).fill(""));
    }
  }, [isOpen]);

  const handleFillCode = async (element, index) => {
    if (isNaN(element.value)) return false;

    // 1. สร้าง Array ใหม่และอัปเดตค่า
    const newCode = [...code];
    newCode[index] = element.value;
    setCode(newCode);

    // 2. รวม Array เป็น String ทันที (แก้ปัญหา Combined)
    const fullCode = newCode.join("");

    // 3. Logic: Auto-focus
    if (element.nextSibling && element.value !== "") {
      element.nextSibling.focus();
    }

    // 4. เมื่อกรอกครบ 6 ตัว ให้เรียก API (ใช้ fullCode ที่เพิ่งรวมเสร็จ)
    if (fullCode.length === 6) {
      const res = await joinRoom(fullCode);
      if (res.success) onClose();
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
        if (res?.success) {
          setStatus("success");
          navigate(`/notes-together/${roomId}/${role}`);
        } else {
          setErrorMsg(res.message);
          setStatus(res?.status || "error");
        }

        const roomId = res?._id || res?.data?._id;

        if (roomId) {
          onClose();
          // นำทางไปยังหน้า editor ของห้องนั้นๆ
          navigate(`/notes-together/${roomId}/editor`);
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
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-third w-full max-w-md rounded-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b-2 border-secondary">
          <h2 className="text-xl font-semibold text-slate-800">join room</h2>
          <button
            onClick={() => {
              onClose();
              setStatus("");
            }}
            className="p-1 hover:bg-slate-100 rounded-full cursor-pointer transition-colors"
          >
            <Icon icon="mdi:close" width="24" className="text-slate-500" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 pt-6 space-y-6">
          <div className=" flex items-center justify-center gap-3 my-5">
            {code.map((data, index) => (
              <input
                key={index}
                id={`code-${index}`}
                onPaste={index === 0 ? handlePaste : undefined}
                type="text"
                maxLength="1"
                className=" w-10 h-12 border-2 rounded-lg text-center text-xl font-semibold focus:border-blue-500 outline-none"
                value={data}
                onChange={(e) => handleFillCode(e.target, index)}
                onKeyDown={(e) => {
                  // ถ้ากด Backspace ให้ถอยกลับไปช่องก่อนหน้า
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
          <div className="h-auto text-center">
            {status === 403 && (
              <span className="text-red-600 flex justify-center items-center">
                {errorMsg || ""}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JoinRoomModal;
