import { type ReactNode } from "react";
import { Message } from "@/types/chat";

interface MatchInfo {
  messageIndex: number;
  matchIndex: number;
}

interface MessageBubbleProps {
  message: Message;
  searchQuery?: string;
  activeMatch?: MatchInfo | null;
  messageIndex: number;
  matchStartIndex: number;
}

function highlightText(
  text: string,
  query: string,
  messageIndex: number,
  matchStartIndex: number,
  activeMatch: MatchInfo | null | undefined
) {
  if (!query) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let localMatchCount = 0;

  let pos = lowerText.indexOf(lowerQuery, lastIndex);
  while (pos !== -1) {
    if (pos > lastIndex) {
      parts.push(text.slice(lastIndex, pos));
    }
    const globalMatchIndex = matchStartIndex + localMatchCount;
    const isActive =
      activeMatch?.messageIndex === messageIndex &&
      activeMatch?.matchIndex === globalMatchIndex;

    parts.push(
      <mark
        key={`${pos}-${localMatchCount}`}
        data-match-index={globalMatchIndex}
        className={
          isActive
            ? "bg-orange-400 text-white rounded-sm px-0.5"
            : "bg-yellow-200 rounded-sm px-0.5"
        }
      >
        {text.slice(pos, pos + query.length)}
      </mark>
    );
    lastIndex = pos + query.length;
    localMatchCount++;
    pos = lowerText.indexOf(lowerQuery, lastIndex);
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? parts : text;
}

export default function MessageBubble({
  message,
  searchQuery,
  activeMatch,
  messageIndex,
  matchStartIndex,
}: MessageBubbleProps) {
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
        {searchQuery
          ? highlightText(
              message.content,
              searchQuery,
              messageIndex,
              matchStartIndex,
              activeMatch
            )
          : message.content}
      </div>
    </div>
  );
}
