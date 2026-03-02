"use client";

import { useRef, useEffect } from "react";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled: boolean;
}

export default function ChatInput({
  value,
  onChange,
  onSend,
  disabled,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 120) + "px";
    }
  }, [value]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const canSend = value.trim() && !disabled;

  return (
    <div className="px-4 py-3 bg-white border-t border-gray-200 flex gap-2.5 items-end">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="ビザに関するご質問を入力してください..."
        rows={1}
        className="flex-1 px-3.5 py-2.5 rounded-xl border-[1.5px] border-gray-300 text-sm leading-normal resize-none outline-none font-[inherit] focus:border-[#2d8a4e] transition-colors"
      />
      <button
        onClick={onSend}
        disabled={!canSend}
        className={`px-[18px] py-2.5 rounded-xl border-none text-sm font-semibold text-white shrink-0 transition-colors ${
          canSend
            ? "bg-[#1a5632] cursor-pointer hover:bg-[#155228]"
            : "bg-gray-300 cursor-default"
        }`}
      >
        送信
      </button>
    </div>
  );
}
