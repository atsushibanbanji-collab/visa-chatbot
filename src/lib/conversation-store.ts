import { Conversation, Message } from "@/types/chat";

const CONVERSATIONS_KEY = "gf-visa-conversations";
const ACTIVE_ID_KEY = "gf-visa-active-conversation";

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

export function loadConversations(): Conversation[] {
  try {
    const saved = localStorage.getItem(CONVERSATIONS_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [];
}

function saveConversations(conversations: Conversation[]): void {
  localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(conversations));
}

export function getActiveId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_ID_KEY);
  } catch {
    return null;
  }
}

export function setActiveId(id: string): void {
  localStorage.setItem(ACTIVE_ID_KEY, id);
}

export function titleFromMessages(messages: Message[]): string {
  const firstUser = messages.find((m) => m.role === "user");
  if (!firstUser) return "新しい会話";
  const text = firstUser.content.trim();
  return text.length > 30 ? text.slice(0, 30) + "…" : text;
}

export function saveConversation(conversation: Conversation): Conversation[] {
  const conversations = loadConversations();
  const idx = conversations.findIndex((c) => c.id === conversation.id);
  if (idx >= 0) {
    conversations[idx] = conversation;
  } else {
    conversations.unshift(conversation);
  }
  saveConversations(conversations);
  return conversations;
}

export function deleteConversation(id: string): Conversation[] {
  const conversations = loadConversations().filter((c) => c.id !== id);
  saveConversations(conversations);
  return conversations;
}
