import { useState } from "react";
import { Icons } from "./icons";

type ElementItem = { id: string; label: string; visible: boolean; group: "left" | "right" };

export default function ElementArranger({
  elements,
  onChange,
}: {
  elements: ElementItem[];
  onChange: (elements: ElementItem[]) => void;
}) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (idx: number) => setDragIndex(idx);

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, idx: number) => {
    e.preventDefault();
    setDragOverIndex(idx);
  };

  const handleDrop = (idx: number) => {
    if (dragIndex === null || dragIndex === idx) return;
    // Capture the target's group before any mutations
    const targetGroup = elements[idx].group;
    const updated = [...elements];
    const [removed] = updated.splice(dragIndex, 1);
    removed.group = targetGroup;
    updated.splice(idx, 0, removed);
    onChange(updated);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDropZone = (targetGroup: "left" | "right") => {
    if (dragIndex === null) return;
    const updated = [...elements];
    const [removed] = updated.splice(dragIndex, 1);
    removed.group = targetGroup;
    // Insert at the end of the target group
    const lastInGroup = [...updated].map((el, i) => ({ el, i })).filter(({ el }) => el.group === targetGroup).pop();
    const insertAt = lastInGroup ? lastInGroup.i + 1 : updated.length;
    updated.splice(insertAt, 0, removed);
    onChange(updated);
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
    setDragOverIndex(null);
  };

  const isFirstInGroup = (idx: number) => {
    const group = elements[idx].group;
    return !elements.slice(0, idx).some((el) => el.group === group);
  };

  const isLastInGroup = (idx: number) => {
    const group = elements[idx].group;
    return !elements.slice(idx + 1).some((el) => el.group === group);
  };

  const moveItem = (idx: number, direction: number) => {
    const currentGroup = elements[idx].group;
    let targetIdx = idx + direction;
    while (targetIdx >= 0 && targetIdx < elements.length) {
      if (elements[targetIdx].group === currentGroup) break;
      targetIdx += direction;
    }
    if (targetIdx < 0 || targetIdx >= elements.length) return;
    const updated = [...elements];
    [updated[idx], updated[targetIdx]] = [updated[targetIdx], updated[idx]];
    onChange(updated);
  };

  const toggleVisibility = (idx: number) => {
    const updated = [...elements];
    updated[idx] = { ...updated[idx], visible: !updated[idx].visible };
    onChange(updated);
  };

  const toggleGroup = (idx: number) => {
    const updated = [...elements];
    const newGroup = updated[idx].group === "left" ? "right" : "left";
    updated[idx] = { ...updated[idx], group: newGroup };
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

  const renderElement = (el: ElementItem, idx: number) => (
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
      <div
        className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${
          el.visible ? "bg-blue-50 text-blue-500" : "bg-gray-100 text-gray-400"
        }`}
      >
        {elementIcons[el.id as keyof typeof elementIcons] || <Icons.Layout size={15} />}
      </div>
      <span className={`text-sm font-medium flex-1 ${el.visible ? "text-gray-700" : "text-gray-400"}`}>
        {el.label}
      </span>
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => moveItem(idx, -1)}
          disabled={isFirstInGroup(idx)}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Icons.ArrowUp />
        </button>
        <button
          onClick={() => moveItem(idx, 1)}
          disabled={isLastInGroup(idx)}
          className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Icons.ArrowDown />
        </button>
      </div>
      <button
        onClick={() => toggleGroup(idx)}
        title={el.group === "left" ? "Move to right group" : "Move to left group"}
        className="p-1.5 rounded-md transition-colors text-gray-400 hover:text-blue-500 hover:bg-blue-50 opacity-0 group-hover:opacity-100"
      >
        <Icons.ArrowLeftRight size={14} />
      </button>
      <button
        onClick={() => toggleVisibility(idx)}
        className={`p-1.5 rounded-md transition-colors ${
          el.visible
            ? "text-gray-400 hover:text-gray-600 hover:bg-gray-100"
            : "text-gray-300 hover:text-gray-500 hover:bg-gray-100"
        }`}
      >
        {el.visible ? <Icons.Eye size={15} /> : <Icons.EyeOff size={15} />}
      </button>
    </div>
  );

  const leftElements = elements.map((el, idx) => ({ el, idx })).filter(({ el }) => (el.group ?? "left") === "left");
  const rightElements = elements.map((el, idx) => ({ el, idx })).filter(({ el }) => (el.group ?? "left") === "right");

  return (
    <div className="flex flex-col gap-4">
      {/* Group 1 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 px-1">
          <div className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Group 1 · Info</span>
        </div>
        {leftElements.length === 0 ? (
          <div
            className="px-3 py-4 rounded-lg border-2 border-dashed border-gray-200 text-xs text-gray-400 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDropZone("left")}
          >
            Drag elements here
          </div>
        ) : (
          leftElements.map(({ el, idx }) => renderElement(el, idx))
        )}
      </div>

      {/* Group 2 */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 px-1">
          <div className="w-2 h-2 rounded-full bg-purple-400 shrink-0" />
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Group 2 · Actions</span>
        </div>
        {rightElements.length === 0 ? (
          <div
            className="px-3 py-4 rounded-lg border-2 border-dashed border-gray-200 text-xs text-gray-400 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleDropZone("right")}
          >
            Drag elements here
          </div>
        ) : (
          rightElements.map(({ el, idx }) => renderElement(el, idx))
        )}
      </div>

      <p className="text-xs text-gray-400 px-1">
        Drag across groups or use the ⟷ button to move elements between groups.
      </p>
    </div>
  );
}
