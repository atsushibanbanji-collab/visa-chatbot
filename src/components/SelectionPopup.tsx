"use client";

import { useState, useEffect, useCallback } from "react";

interface SelectionPopupProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  onSearch: (text: string) => void;
}

export default function SelectionPopup({
  containerRef,
  onSearch,
}: SelectionPopupProps) {
  const [popup, setPopup] = useState<{
    text: string;
    x: number;
    y: number;
  } | null>(null);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();
    if (!text || !containerRef.current) {
      setPopup(null);
      return;
    }

    const range = selection!.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    setPopup({
      text,
      x: rect.left + rect.width / 2 - containerRect.left,
      y: rect.top - containerRect.top - 8,
    });
  }, [containerRef]);

  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      if (!popup) return;
      const target = e.target as HTMLElement;
      if (target.closest("[data-selection-popup]")) return;
      setPopup(null);
    },
    [popup]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    container.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      container.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [containerRef, handleMouseUp, handleMouseDown]);

  if (!popup) return null;

  return (
    <div
      data-selection-popup
      className="absolute z-50 -translate-x-1/2 -translate-y-full pointer-events-auto"
      style={{ left: popup.x, top: popup.y }}
    >
      <button
        onMouseDown={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onSearch(popup.text);
          setPopup(null);
          window.getSelection()?.removeAllRanges();
        }}
        className="px-3 py-1.5 bg-[#1a5632] text-white text-xs font-semibold rounded-lg shadow-lg cursor-pointer hover:bg-[#155228] transition-colors whitespace-nowrap"
      >
        検索
      </button>
      <div className="w-2 h-2 bg-[#1a5632] rotate-45 mx-auto -mt-1" />
    </div>
  );
}
