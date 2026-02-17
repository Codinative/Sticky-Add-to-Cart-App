export default function PositionSelector({ value, onChange }: { value: "top" | "left" | "right" | "bottom", onChange: (value: "top" | "left" | "right" | "bottom") => void }) {
    const positions = [
      { id: "top", label: "Top", row: 0, col: 1 },
      { id: "bottom", label: "Bottom", row: 2, col: 1 },
    ];
    return (
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-gray-600 uppercase tracking-wide">Bar Position</label>
        <div className="grid grid-cols-3 grid-rows-3 gap-1.5 w-[180px] mx-auto mt-1">
          {[0, 1, 2].map((row) =>
            [0, 1, 2].map((col) => {
              const pos = positions.find((p) => p.row === row && p.col === col);
              if (row === 1 && col === 1) {
                return (
                  <div key="center" className="w-14 h-10 rounded-md bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-[9px] text-gray-400 font-medium">PAGE</span>
                  </div>
                );
              }
              if (!pos) return <div key={`${row}-${col}`} className="w-14 h-10" />;
              return (
                <button
                  key={pos.id}
                  onClick={() => onChange(pos.id as "top" | "left" | "right" | "bottom")}
                  className={`
                    w-14 h-10 rounded-md text-xs font-medium transition-all duration-200
                    ${value === (pos.id as "top" | "left" | "right" | "bottom")
                      ? "bg-blue-500 text-white shadow-md shadow-blue-500/25 scale-105"
                      : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
                    }
                  `}
                >
                  {pos.label}
                </button>
              );
            })
          )}
        </div>
      </div>
    );
  }