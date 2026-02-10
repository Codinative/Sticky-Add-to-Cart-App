import { useState } from "react";
import { Icons } from "./icons";

export default function ElementArranger({ elements, onChange }: { elements: { id: string, label: string, visible: boolean }[], onChange: (elements: { id: string, label: string, visible: boolean }[]) => void }) {
    const [dragIndex, setDragIndex] = useState<number | null>(null);
    const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  
    const handleDragStart = (idx: number) => setDragIndex(idx);
    const handleDragOver = (e: React.DragEvent<HTMLDivElement>, idx: number) => { e.preventDefault(); setDragOverIndex(idx); };
    const handleDrop = (idx: number) => {
      if (dragIndex === null || dragIndex === idx) return;
      const updated = [...elements];    
      const [removed] = updated.splice(dragIndex, 1);
      updated.splice(idx, 0, removed);
      onChange(updated);
      setDragIndex(null);
      setDragOverIndex(null);
    };
    const handleDragEnd = () => { setDragIndex(null); setDragOverIndex(null); };
  
    const moveItem = (fromIndex: number, direction: number) => {
      const toIndex = fromIndex + direction;
      if (toIndex < 0 || toIndex >= elements.length) return;
      const updated = [...elements];
      [updated[fromIndex], updated[toIndex]] = [updated[toIndex], updated[fromIndex]];
      onChange(updated);
    };
  
    const toggleVisibility = (idx: number) => {
      const updated = [...elements];
      updated[idx] = { ...updated[idx], visible: !updated[idx].visible };
      onChange(updated);
    };
  
    const elementIcons = {
      image: <Icons.Image size={15} />,
      title: <Icons.Type size={15} />,
      price: <span className="text-xs font-bold">$</span>,
      variants: <Icons.Layout size={15} />,
      quantity: <span className="text-xs font-bold">#</span>,
      button: <Icons.ShoppingCart size={15} />,
    };
  
    return (
      <div className="flex flex-col gap-1.5">
        {elements.map((el, idx) => (
          <div
            key={el.id}
            draggable
            onDragStart={() => handleDragStart(idx)}
            onDragOver={(e) => handleDragOver(e, idx)}
            onDrop={() => handleDrop(idx)}
            onDragEnd={handleDragEnd}
            className={`
              flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all duration-150 cursor-grab active:cursor-grabbing group
              ${dragOverIndex === idx ? "border-blue-400 bg-blue-50" : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"}
              ${!el.visible ? "opacity-50" : ""}
            `}
          >
            <div className="text-gray-300 group-hover:text-gray-400 cursor-grab">
              <Icons.GripVertical />
            </div>
            <div className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${el.visible ? "bg-blue-50 text-blue-500" : "bg-gray-100 text-gray-400"}`}>
              {elementIcons[el.id as keyof typeof elementIcons] || <Icons.Layout size={15} />}
            </div>
            <span className={`text-sm font-medium flex-1 ${el.visible ? "text-gray-700" : "text-gray-400"}`}>
              {el.label}
            </span>
            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => moveItem(idx, -1)}
                disabled={idx === 0}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icons.ArrowUp />
              </button>
              <button
                onClick={() => moveItem(idx, 1)}
                disabled={idx === elements.length - 1}
                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Icons.ArrowDown />
              </button>
            </div>
            <button
              onClick={() => toggleVisibility(idx)}
              className={`p-1.5 rounded-md transition-colors ${el.visible ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100" : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"}`}
            >
              {el.visible ? <Icons.Eye size={15} /> : <Icons.EyeOff size={15} />}
            </button>
          </div>
        ))}
      </div>
    );
  }