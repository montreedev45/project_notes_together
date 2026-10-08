import { useEffect } from "react";
import { Icon } from "@iconify/react";

export default function StatusModal({
  isOpen,
  onClose,
  type = "success",
  title,
  message,
}) {
  // ล็อกไม่ให้หน้าเว็บด้านหลัง Scroll ได้เวลาเปิด Modal
  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  
  const isSuccess = type === "success";
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      {/* ฉากหลัง (Backdrop) */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>

      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl transform transition-all flex flex-col p-8 items-center text-center animate-in fade-in zoom-in duration-200">
        {/* ไอคอนแสดงสถานะ (เปลี่ยนสีและรูปแบบตาม type) */}
        <div
          className={`border-4 rounded-full p-4 mb-4 ${
            isSuccess
              ? "border-green-400 bg-green-50"
              : "border-red-400 bg-red-50"
          }`}
        >
          <Icon
            icon={
              isSuccess
                ? "icon-park-outline:check"
                : "icon-park-outline:close-one"
            }
            className={isSuccess ? "text-green-500" : "text-red-500"}
            width="64"
            height="64"
          />
        </div>

        {/* หัวข้อ (Title) */}
        <h3 className="text-2xl font-bold text-gray-800 mb-2">
          {title || (isSuccess ? "Success" : "Error")}
        </h3>

        {/* ข้อความอธิบาย (Message) */}
        {message && (
          <p className="text-gray-500 mb-6 text-sm md:text-base">{message}</p>
        )}

        {/* ปุ่มยืนยัน (Action Button) */}
        <button
          autoFocus
          onClick={onClose}
          className={`outline-none w-full py-3 rounded-lg font-bold text-white transition-transform hover:scale-105 active:scale-95 ${
            isSuccess
              ? "bg-green-500 hover:bg-green-600"
              : "bg-red-500 hover:bg-red-600"
          }`}
        >
          {isSuccess ? "OK" : "Try Again"}
        </button>
      </div>
    </div>
  );
}
