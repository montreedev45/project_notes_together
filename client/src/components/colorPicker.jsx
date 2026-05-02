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

function ColorPicker({
  label,
  selectedColor,
  setSelectedColor,
  name = "color",
  onChange = () => {},
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <span className="text-sm font-bold text-slate-800">{label}</span>
      )}

      <div className="flex gap-4">
        {colors.map((color) => (
          <label key={color.id} className="relative cursor-pointer">
            <input
              type="radio"
              name={name}
              value={color.id}
              className="peer sr-only"
              checked={selectedColor === color.id}
              onChange={() => {
                setSelectedColor(color.id);
                onChange({ target: { name, value: color.id } });
              }}
            />

            <div
              className={`w-6 h-6 rounded-full ${color.bg} transition-all 
              peer-checked:ring-offset-2 peer-checked:ring-2 peer-checked:ring-slate-400
              hover:scale-110 active:scale-95 shadow-sm`}
            ></div>

            {selectedColor === color.id && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <Icon icon="mdi:check" className="text-white text-xs" />
              </div>
            )}
          </label>
        ))}
      </div>
    </div>
  );
}

export default ColorPicker;
