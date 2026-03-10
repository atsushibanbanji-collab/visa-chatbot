"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Message } from "@/types/chat";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import ChatInput from "./ChatInput";
import ChatLogModal from "./ChatLogModal";

const STORAGE_KEY = "gf-visa-chat-messages";

const INITIAL_MESSAGE: Message = {
  role: "assistant",
  content:
    "こんにちは！GFビザサポートデスクです。\n米国ビザに関するご質問にお答えします。\n\nビザの種類、申請条件、手続き、永住権など、何でもお気軽にお聞きください。",
};

function loadMessages(): Message[] {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [INITIAL_MESSAGE];
}

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages(loadMessages());
  }, []);

  useEffect(() => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

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
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const apiMessages = newMessages.map((m) => ({
        role: m.role,
        content: m.content,
      }));
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: apiMessages }),
      });
      const data = await response.json();

      if (!response.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.error || "エラーが発生しました。もう一度お試しください。",
          },
        ]);
        return;
      }

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.content || "回答を生成できませんでした。もう一度お試しください。",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "通信エラーが発生しました。しばらく待ってからもう一度お試しください。",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#f7f8fa] font-sans">
      <ChatHeader onNewChat={() => setMessages([INITIAL_MESSAGE])} onOpenLog={() => setShowLog(true)} />

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white px-5 py-3 rounded-[16px_16px_16px_4px] shadow-[0_1px_4px_rgba(0,0,0,0.08)] flex gap-1.5 items-center">
              <span className="text-[#2d8a4e] text-[13px]">
                回答を生成中...
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
    </div>
  );
}
