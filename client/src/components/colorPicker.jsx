import { Icon } from "@iconify/react";

const colors = [
  { id: "blue", bg: "bg-primary" },
  { id: "red", bg: "bg-red" },
  { id: "green", bg: "bg-green" },
  { id: "orange", bg: "bg-orange" },
  { id: "yellow", bg: "bg-yellow" },
  { id: "pink", bg: "bg-pink" },
  { id: "gray", bg: "bg-gray" },
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
