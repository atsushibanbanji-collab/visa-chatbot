import { Message } from "@/types/chat";

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] px-4 py-3 text-sm leading-[1.7] break-words whitespace-pre-wrap ${
          isUser
            ? "bg-gradient-to-br from-[#1a5632] to-[#2d8a4e] text-white rounded-[16px_16px_4px_16px] shadow-[0_2px_6px_rgba(26,86,50,0.25)]"
            : "bg-white text-[#1a1a1a] rounded-[16px_16px_16px_4px] shadow-[0_1px_4px_rgba(0,0,0,0.08)]"
        }`}
      >
        {message.content}
      </div>
    </div>
  );
}
