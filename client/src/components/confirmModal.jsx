import { createPortal } from "react-dom";
export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isLoading,
}) {
  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
    >
      <div className="bg-white rounded-xl p-6 w-full max-w-md">
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>

        <div className="flex justify-end gap-3">
          {/* ปุ่มยกเลิก: ควรใช้ autoFocus เพื่อป้องกันการเผลอกด Enter แล้วไปโดน Confirm */}
          <button
            autoFocus
            disabled={isLoading}
            onClick={onClose}
            className="outline-0 cursor-pointer px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 font-semibold"
          >
            Cancel
          </button>

          <button
            disabled={isLoading}
            onClick={onConfirm}
            className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-semibold"
          >
            {isLoading ? "Confirm..." : "Confirm"}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
