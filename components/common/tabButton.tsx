export default function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
    return (
      <button
        onClick={onClick}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all flex-1 justify-center
          ${active
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          }
        `}
      >
        {icon}
        <span>{label}</span>
      </button>
    );
  }