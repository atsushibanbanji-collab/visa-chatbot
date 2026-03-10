"use client";

import { useRef, useEffect } from "react";

interface ChatLogModalProps {
  logText: string;
  onClose: () => void;
}

export default function ChatLogModal({ logText, onClose }: ChatLogModalProps) {
  const logRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      logRef.current?.select();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-5"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-xl w-full max-w-[500px] max-h-[80vh] flex flex-col overflow-hidden">
        <div className="px-[18px] py-3.5 border-b border-gray-200 flex justify-between items-center">
          <span className="font-semibold text-sm">チャットログ</span>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-xl cursor-pointer text-gray-500 leading-none hover:text-gray-800"
          >
            ×
          </button>
        </div>
        <div className="px-[18px] py-3 text-xs text-gray-500">
          下のテキストを全選択（Ctrl+A）してコピー（Ctrl+C）してください
        </div>
        <textarea
          ref={logRef}
          readOnly
          value={logText}
          onFocus={(e) => e.target.select()}
          className="flex-1 mx-[18px] mb-[18px] p-3 rounded-lg border border-gray-300 text-xs leading-relaxed resize-none font-mono min-h-[200px] outline-none"
        />
      </div>
    </div>
  );
}
