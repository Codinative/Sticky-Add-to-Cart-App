import { Icons } from "./icons";

export default function Toast({ message, type = "success", visible }: { message: string, type: "success" | "error", visible: boolean }) {
    const icons = {
      success: <Icons.Check size={16} />,
      error: <span className="text-sm">✕</span>,
    };
    const colors = {
      success: "bg-green-50 text-green-800 border-green-200",
      error: "bg-red-50 text-red-800 border-red-200",
    };
    return (
      <div
        className={`
          fixed top-4 right-4 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-lg transition-all duration-300
          ${colors[type]}
          ${visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0 pointer-events-none"}
        `}
      >
        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${type === "success" ? "bg-green-500" : "bg-red-500"} text-white`}>
          {icons[type]}
        </div>
        <span className="text-sm font-medium">{message}</span>
      </div>
    );
  }