"use client";

import { useRef, useEffect } from "react";

interface SearchBarProps {
  query: string;
  onChange: (query: string) => void;
  currentIndex: number;
  totalMatches: number;
  onPrev: () => void;
  onNext: () => void;
  onClose: () => void;
}

export default function SearchBar({
  query,
  onChange,
  currentIndex,
  totalMatches,
  onPrev,
  onNext,
  onClose,
}: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "Enter") {
      if (e.shiftKey) {
        onPrev();
      } else {
        onNext();
      }
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-2">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="会話内を検索..."
        className="flex-1 px-3 py-1.5 rounded-lg border border-gray-300 text-sm outline-none focus:border-[#2d8a4e] transition-colors"
      />
      <span className="text-xs text-gray-500 min-w-[50px] text-center shrink-0">
        {query && totalMatches > 0
          ? `${currentIndex + 1}/${totalMatches}`
          : query
            ? "0件"
            : ""}
      </span>
      <button
        onClick={onPrev}
        disabled={totalMatches === 0}
        className={`w-7 h-7 rounded flex items-center justify-center text-sm border border-gray-300 shrink-0 transition-colors ${
          totalMatches > 0
            ? "cursor-pointer hover:bg-gray-100 text-gray-700"
            : "cursor-default text-gray-300"
        }`}
      >
        ▲
      </button>
      <button
        onClick={onNext}
        disabled={totalMatches === 0}
        className={`w-7 h-7 rounded flex items-center justify-center text-sm border border-gray-300 shrink-0 transition-colors ${
          totalMatches > 0
            ? "cursor-pointer hover:bg-gray-100 text-gray-700"
            : "cursor-default text-gray-300"
        }`}
      >
        ▼
      </button>
      <button
        onClick={onClose}
        className="w-7 h-7 rounded flex items-center justify-center text-base text-gray-500 cursor-pointer shrink-0 transition-colors hover:text-gray-800"
      >
        ×
      </button>
    </div>
  );
}
