import { Icons } from "./icons";

export default function NumberInput({ label, value, onChange, min = 0, max = 100, suffix = "px" }: { label: string, value: number, onChange: (value: number) => void, min?: number, max?: number, suffix?: string }) {
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>
        <div className="flex items-center bg-white border border-gray-200 rounded-lg overflow-hidden hover:border-gray-300 transition-colors">
          <button
            onClick={() => onChange(Math.max(min, value - 1))}
            className="px-2.5 py-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Icons.Minus />
          </button>
          <input
            type="number"
            value={value}
            onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value))))}
            className="w-full text-center text-sm text-gray-700 border-0 focus:ring-0 py-2 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          <span className="text-xs text-gray-400 pr-1">{suffix}</span>
          <button
            onClick={() => onChange(Math.min(max, value + 1))}
            className="px-2.5 py-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Icons.Plus />
          </button>
        </div>
      </div>
    );
  }