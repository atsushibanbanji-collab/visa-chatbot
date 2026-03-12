"use client";

import { Conversation } from "@/types/chat";

interface ConversationDrawerProps {
  conversations: Conversation[];
  activeId: string;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

export default function ConversationDrawer({
  conversations,
  activeId,
  onSelect,
  onDelete,
  onClose,
}: ConversationDrawerProps) {
  return (
    <div
      className="fixed inset-0 z-[90] flex"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-[280px] max-w-[80vw] h-full bg-white shadow-2xl flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <span className="font-semibold text-sm">会話履歴</span>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-xl cursor-pointer text-gray-500 leading-none hover:text-gray-800"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-gray-400">
              履歴はありません
            </div>
          ) : (
            conversations.map((conv) => (
              <div
                key={conv.id}
                className={`px-4 py-3 border-b border-gray-100 cursor-pointer flex items-start gap-2 transition-colors ${
                  conv.id === activeId
                    ? "bg-[#e8f5ec]"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => {
                  onSelect(conv.id);
                  onClose();
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm truncate">{conv.title}</div>
                  <div className="text-[11px] text-gray-400 mt-0.5">
                    {new Date(conv.updatedAt).toLocaleDateString("ja-JP", {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" · "}
                    {conv.messages.filter((m) => m.role === "user").length}件の質問
                  </div>
                </div>
                {conv.id !== activeId && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(conv.id);
                    }}
                    className="text-gray-300 hover:text-red-400 text-base bg-transparent border-none cursor-pointer shrink-0 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>
      <div className="flex-1 bg-black/30" onClick={onClose} />
    </div>
  );
}
