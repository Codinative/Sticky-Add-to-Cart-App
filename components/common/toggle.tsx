export default function Toggle({ checked, onChange, label, description }: { checked: boolean, onChange: (checked: boolean) => void, label: string, description?: string }) {
    return (
        <label className="flex items-start gap-3 cursor-pointer group">
            <button
                role="switch"
                aria-checked={checked}
                onClick={() => onChange(!checked)}
                className={`
            relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2
            ${checked ? "bg-slate-900" : "bg-slate-300"}
          `}
            >
                <span
                    className={`
              pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out
              ${checked ? "translate-x-[22px]" : "translate-x-[2px]"}
              mt-[2px]
            `}
                />
            </button>
            <div className="flex flex-col">
                <span className="text-sm font-medium text-slate-800 group-hover:text-slate-900">{label}</span>
                {description && <span className="text-xs text-slate-500 mt-0.5">{description}</span>}
            </div>
        </label>
    );
}
