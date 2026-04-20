import { Icon } from "@iconify/react";

const colors = [
  { id: "#4b9fff", bg: "bg-primary" },
  { id: "#f9aaaa", bg: "bg-red" },
  { id: "#baf9aa", bg: "bg-green" },
  { id: "#f9d4aa", bg: "bg-orange" },
  { id: "#f9f2aa", bg: "bg-yellow" },
  { id: "#f9aae1", bg: "bg-pink" },
  { id: "#c7c6c6", bg: "bg-gray" },
];

function ColorPicker({ label, selectedColor, setSelectedColor }) {
  return (
    <div className="flex gap-4">
      <div className="flex flex-col">
        <span className="text-sm font-bold text-slate-800">{label}</span>
      </div>
      {colors.map((color) => (
        <label key={color.id} className="relative cursor-pointer">
          {/* 1. ซ่อน Radio จริงไว้ข้างหลัง */}
          <input
            type="radio"
            name="color-choice"
            value={color.id}
            className="peer sr-only" // sr-only คือซ่อนแต่ยังกดได้
            onChange={() => setSelectedColor(color.id)}
            checked={selectedColor === color.id}
          />

          {/* 2. สร้างวงกลมสี (Custom UI) */}
          <div
            className={`w-5 h-5 rounded-full ${color.bg} transition-all 
            peer-checked:ring-offset-2 peer-checked:ring-2 peer-checked:ring-slate-400
            hover:scale-110 active:scale-95 `}
          ></div>

          {/* 3. เครื่องหมายถูก (โชว์เฉพาะตอนเลือก) */}
          {selectedColor === color.id && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <Icon icon="mdi:check" className="text-white" width="16" />
            </div>
          )}
        </label>
      ))}
    </div>
  );
}

export default ColorPicker;
