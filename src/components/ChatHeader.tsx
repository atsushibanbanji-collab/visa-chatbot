"use client";

interface ChatHeaderProps {
  onNewChat: () => void;
  onOpenLog: () => void;
  onToggleSearch: () => void;
  onOpenHistory: () => void;
}

export default function ChatHeader({ onNewChat, onOpenLog, onToggleSearch, onOpenHistory }: ChatHeaderProps) {
  return (
    <div className="bg-gradient-to-br from-[#1a5632] to-[#2d8a4e] text-white px-5 py-4 flex items-center gap-3 shadow-md">
      <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl shrink-0">
        🇺🇸
      </div>
      <div className="flex-1">
        <div className="font-bold text-base tracking-wide">
          GF ビザサポートデスク
        </div>
        <div className="text-[11px] opacity-85 mt-0.5">
          米国ビザ申請に関するご質問にお答えします
        </div>
      </div>
      <button
        onClick={onToggleSearch}
        className="px-3.5 py-1.5 rounded-lg border border-white/40 bg-white/10 text-white text-xs cursor-pointer shrink-0 transition-colors hover:bg-white/20"
      >
        検索
      </button>
      <button
        onClick={onOpenHistory}
        className="px-3.5 py-1.5 rounded-lg border border-white/40 bg-white/10 text-white text-xs cursor-pointer shrink-0 transition-colors hover:bg-white/20"
      >
        履歴
      </button>
      <button
        onClick={onOpenLog}
        className="px-3.5 py-1.5 rounded-lg border border-white/40 bg-white/10 text-white text-xs cursor-pointer shrink-0 transition-colors hover:bg-white/20"
      >
        ログをコピー
      </button>
      <button
        onClick={onNewChat}
        className="px-3.5 py-1.5 rounded-lg border border-white/40 bg-white/10 text-white text-xs cursor-pointer shrink-0 transition-colors hover:bg-white/20"
      >
        新しい会話
      </button>
    </div>
  );
}
