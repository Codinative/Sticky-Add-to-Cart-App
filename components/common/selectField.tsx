import { Icons } from "./icons";

export default function SelectField({ label, value, onChange, options }: { label: string, value: string | number, onChange: (value: string | number) => void, options: { value: string | number, label: string }[] }) {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      const selectedValue = e.target.value;
      // Check if the original option value is a number by looking at the options
      const originalOption = options.find(opt => String(opt.value) === selectedValue);
      if (originalOption && typeof originalOption.value === 'number') {
        onChange(Number(selectedValue));
      } else {
        onChange(selectedValue);
      }
    };

    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">{label}</label>
        <div className="relative">
          <select
            value={value}
            onChange={handleChange}
            className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 appearance-none cursor-pointer hover:border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-colors pr-8"
          >
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
            <Icons.ChevronDown />
          </div>
        </div>
      </div>
    );
  }