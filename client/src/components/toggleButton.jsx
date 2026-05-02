import { useState, useEffect } from "react";

// รับ props: label (ชื่อ), description (คำอธิบาย),
// และ onToggle (ฟังก์ชันส่งค่ากลับ)
function Toggle({ label, onToggle, defaultChecked }) {
  const [enabled, setEnabled] = useState(defaultChecked);
  useEffect(() => {
    if (defaultChecked !== undefined) {
      setEnabled(defaultChecked);
    }
  }, [defaultChecked]);

  const handleToggle = () => {
    const newValue = !enabled;
    setEnabled(newValue);
    onToggle(newValue);
  };

  return (
    <label className="flex items-center justify-start  group py-2">
      <div className="flex flex-col me-3">
        <span className="text-sm font-bold text-slate-800">{label}</span>
      </div>

      <div className="relative cursor-pointer">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={enabled}
          onChange={handleToggle}
        />
        <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:bg-primary transition-colors duration-300"></div>
        <div className="absolute  left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow-sm"></div>
      </div>
    </label>
  );
}

export default Toggle;
