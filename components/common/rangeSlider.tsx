export default function RangeSlider({ label, value, onChange, min = 0, max = 100, suffix = "px" }: { label: string, value: number, onChange: (value: number) => void, min?: number, max?: number, suffix?: string }) {
    return (
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>
          <span className="text-xs font-mono text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
            {value}{suffix}
          </span>
        </div>
        <input
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    );
  }