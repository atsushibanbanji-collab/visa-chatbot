"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Message, Conversation } from "@/types/chat";
import {
  generateId,
  loadConversations,
  getActiveId,
  setActiveId,
  titleFromMessages,
  saveConversation,
  deleteConversation,
} from "@/lib/conversation-store";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import ChatLogModal from "./ChatLogModal";
import SearchBar from "./SearchBar";
import SelectionPopup from "./SelectionPopup";
import ConversationDrawer from "./ConversationDrawer";

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "こんにちは！GFビザサポートデスクです。\n米国ビザに関するご質問にお答えします。\n\nビザの種類、申請条件、手続き、永住権など、何でもお気軽にお聞きください。",
};

function createNewConversation(): Conversation {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    title: "新しい会話",
    messages: [INITIAL_MESSAGE],
    createdAt: now,
    updatedAt: now,
  };
}

function countMatches(text: string, query: string): number {
  if (!query) return 0;
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let count = 0;
  let pos = lowerText.indexOf(lowerQuery);
  while (pos !== -1) {
    count++;
    pos = lowerText.indexOf(lowerQuery, pos + lowerQuery.length);
  }
  return count;
}

export default function ChatWindow() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string>("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMatchIndex, setActiveMatchIndex] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Initialize from localStorage on mount
  useEffect(() => {
    let convs = loadConversations();
    let activeId = getActiveId();

    if (convs.length === 0) {
      // Migrate from old sessionStorage if present
      try {
        const oldData = sessionStorage.getItem("gf-visa-chat-messages");
        if (oldData) {
          const oldMessages: Message[] = JSON.parse(oldData);
          if (oldMessages.length > 1) {
            const migrated = createNewConversation();
            migrated.messages = oldMessages;
            migrated.title = titleFromMessages(oldMessages);
            convs = [migrated];
            activeId = migrated.id;
            saveConversation(migrated);
            sessionStorage.removeItem("gf-visa-chat-messages");
          }
        }
      } catch {}
    }

    if (convs.length === 0) {
      const newConv = createNewConversation();
      convs = [newConv];
      saveConversation(newConv);
      activeId = newConv.id;
    }

    if (!activeId || !convs.find((c) => c.id === activeId)) {
      activeId = convs[0].id;
    }

    setConversations(convs);
    setActiveConvId(activeId);
    setActiveId(activeId);
  }, []);

  const activeConversation = useMemo(
    () => conversations.find((c) => c.id === activeConvId),
    [conversations, activeConvId]
  );

  const messages = activeConversation?.messages ?? [INITIAL_MESSAGE];

  // Persist active conversation when messages change
  const persistCurrentConversation = useCallback(
    (newMessages: Message[]) => {
      if (!activeConvId) return;
      const conv = conversations.find((c) => c.id === activeConvId);
      if (!conv) return;
      const updated: Conversation = {
        ...conv,
        messages: newMessages,
        title: titleFromMessages(newMessages),
        updatedAt: new Date().toISOString(),
      };
      const newConvs = saveConversation(updated);
      setConversations(newConvs);
    },
    [activeConvId, conversations]
  );

  const matchInfo = useMemo(() => {
    if (!searchQuery) return { total: 0, messageMatchStarts: [] as number[] };
    let total = 0;
    const messageMatchStarts: number[] = [];
    for (const msg of messages) {
      messageMatchStarts.push(total);
      total += countMatches(msg.content, searchQuery);
    }
    return { total, messageMatchStarts };
  }, [messages, searchQuery]);

  const activeMatch = useMemo(() => {
    if (matchInfo.total === 0 || !searchQuery) return null;
    const idx = activeMatchIndex % matchInfo.total;
    for (let i = 0; i < messages.length; i++) {
      const start = matchInfo.messageMatchStarts[i];
      const count = countMatches(messages[i].content, searchQuery);
      if (idx < start + count) {
        return { messageIndex: i, matchIndex: idx };
      }
    }
    return null;
  }, [activeMatchIndex, matchInfo, messages, searchQuery]);

  useEffect(() => {
    setActiveMatchIndex(0);
  }, [searchQuery]);

  useEffect(() => {
    if (!activeMatch) return;
    const container = messagesContainerRef.current;
    if (!container) return;
    const mark = container.querySelector(
      `mark[data-match-index="${activeMatch.matchIndex}"]`
    );
    if (mark) {
      mark.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [activeMatch]);

  const getLogText = useCallback(() => {
    const log = messages
      .map(
        (m) =>
          (m.role === "user" ? "【質問】" : "【回答】") + "\n" + m.content
      )
      .join("\n\n---\n\n");
    return (
      "=== GFビザサポートデスク チャットログ ===\n" +
      new Date().toLocaleString("ja-JP") +
      "\n\n" +
      log
    );
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    persistCurrentConversation(newMessages);
    setInput("");
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
        signal: controller.signal,
      });
      const data = await response.json();

      if (!response.ok) {
        const errorMessages = [
          ...newMessages,
          {
            role: "assistant" as const,
            content:
              data.error || "エラーが発生しました。もう一度お試しください。",
            isError: true,
          },
        ];
        persistCurrentConversation(errorMessages);
        return;
      }

      const finalMessages = [
        ...newMessages,
        {
          role: "assistant" as const,
          content:
            data.content || "回答を生成できませんでした。もう一度お試しください。",
        },
      ];
      persistCurrentConversation(finalMessages);
    } catch (error) {
      const isTimeout = error instanceof DOMException && error.name === "AbortError";
      const errorMessages = [
        ...newMessages,
        {
          role: "assistant" as const,
          content: isTimeout
            ? "回答の生成がタイムアウトしました。もう一度お試しください。"
            : "通信エラーが発生しました。しばらく待ってからもう一度お試しください。",
          isError: true,
        },
      ];
      persistCurrentConversation(errorMessages);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const handleNewChat = () => {
    const newConv = createNewConversation();
    const newConvs = saveConversation(newConv);
    setConversations(newConvs);
    setActiveConvId(newConv.id);
    setActiveId(newConv.id);
    setSearchQuery("");
    setShowSearch(false);
  };

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    setActiveId(id);
    setSearchQuery("");
    setShowSearch(false);
  };

  const handleDeleteConversation = (id: string) => {
    const newConvs = deleteConversation(id);
    setConversations(newConvs);
    // If we deleted the active one, switch to first available or create new
    if (id === activeConvId) {
      if (newConvs.length > 0) {
        setActiveConvId(newConvs[0].id);
        setActiveId(newConvs[0].id);
      } else {
        handleNewChat();
      }
    }
  };

  const handleToggleSearch = () => {
    if (showSearch) {
      setShowSearch(false);
      setSearchQuery("");
    } else {
      setShowSearch(true);
    }
  };

  const handleSelectionSearch = (text: string) => {
    setSearchQuery(text);
    setShowSearch(true);
  };

  const handleSearchPrev = () => {
    if (matchInfo.total === 0) return;
    setActiveMatchIndex((prev) =>
      prev <= 0 ? matchInfo.total - 1 : prev - 1
    );
  };

  const handleSearchNext = () => {
    if (matchInfo.total === 0) return;
    setActiveMatchIndex((prev) =>
      prev >= matchInfo.total - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="flex flex-col h-screen bg-[#f7f8fa] font-sans">
      <ChatHeader
        onNewChat={handleNewChat}
        onOpenLog={() => setShowLog(true)}
        onToggleSearch={handleToggleSearch}
        onOpenHistory={() => setShowHistory(true)}
      />

      {showSearch && (
        <SearchBar
          query={searchQuery}
          onChange={setSearchQuery}
          currentIndex={activeMatchIndex}
          totalMatches={matchInfo.total}
          onPrev={handleSearchPrev}
          onNext={handleSearchNext}
          onClose={() => {
            setShowSearch(false);
            setSearchQuery("");
          }}
        />
      )}

      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-3 relative"
      >
        <SelectionPopup
          containerRef={messagesContainerRef}
          onSearch={handleSelectionSearch}
        />
        {messages.map((msg, idx) => (
          <MessageBubble
            key={idx}
            message={msg}
            searchQuery={searchQuery}
            activeMatch={activeMatch}
            messageIndex={idx}
            matchStartIndex={
              matchInfo.messageMatchStarts[idx] ?? 0
            }
          />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-5 py-3 rounded-[16px_16px_16px_4px] shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex gap-2 items-center">
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-[#2d8a4e] rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-[#2d8a4e] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-[#2d8a4e] rounded-full animate-bounce [animation-delay:300ms]" />
              </span>
              <span className="text-[#2d8a4e] text-[13px]">
                回答を生成中です...
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput
        value={input}
        onChange={setInput}
        onSend={sendMessage}
        disabled={loading}
      />

      {showLog && (
        <ChatLogModal
          logText={getLogText()}
          onClose={() => setShowLog(false)}
        />
      )}

      {showHistory && (
        <ConversationDrawer
          conversations={conversations}
          activeId={activeConvId}
          onSelect={handleSelectConversation}
          onDelete={handleDeleteConversation}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}
