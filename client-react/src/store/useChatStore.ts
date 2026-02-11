import { create } from 'zustand';

export interface Message {
  role: 'user' | 'ai';
  content: String;
  timestamp: Date;
}

export interface ChatState {
  messages: Message[];
  isTyping: boolean;
  addMessage: (msg: Message) => void;
  setTyping: (typing: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  isTyping: false,
  addMessage: (msg) => set((state) => ({ messages: [...state.messages, msg] })),
  setTyping: (typing) => set({ isTyping: typing }),
  clearChat: () => set({ messages: [] }),
}));
