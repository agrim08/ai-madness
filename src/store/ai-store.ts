// store/ai-store.ts
import { create } from "zustand";
import CryptoJS from "crypto-js";

export type AIModel = "openai" | "gemini" | "groq" | "deepseek" | "anthropic";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  model?: AIModel; 
}

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  activeModels: Record<AIModel, boolean>; 
  createdAt: number;
  updatedAt: number;
}

interface ResponseItem {
  id: string;
  prompt: string;
  model: AIModel;
  content: string;
  createdAt: number;
}

interface AIStore {
  // Current prompt (for backward compatibility)
  prompt: string;
  setPrompt: (val: string) => void;

  // API Keys
  keys: Record<AIModel, string | null>;
  activeModels: Record<AIModel, boolean>;
  setKey: (model: AIModel, key: string) => void;
  toggleModel: (model: AIModel, active: boolean) => void;
  loadKeys: () => void;

  currentChatId: string | null;
  chatSessions: ChatSession[];
  createNewChat: () => void;
  selectChat: (chatId: string) => void;
  addMessageToChat: (chatId: string, message: ChatMessage) => void;
  addUserMessage: (content: string) => void;
  addAssistantMessage: (content: string, model: AIModel) => void;
  updateChatTitle: (chatId: string, title: string) => void;
  deleteChat: (chatId: string) => void;
  getCurrentChat: () => ChatSession | null;
  saveChatSessions: () => void;
  loadChatSessions: () => void;

  responses: ResponseItem[];
  addResponse: (res: ResponseItem) => void;
  clearResponses: () => void;
}

const generateChatTitle = (firstMessage: string): string => {
  const words = firstMessage.trim().split(' ').slice(0, 6);
  return words.length < 6 ? words.join(' ') : words.join(' ') + '...';
};

const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const useAIStore = create<AIStore>((set, get) => ({
  prompt: "",
  setPrompt: (val) => {
    set({ prompt: val });
    if (val.trim() && get().currentChatId) {
      get().addUserMessage(val);
    }
  },

  keys: {
    openai: null,
    gemini: null,
    groq: null,
    deepseek: null,
    anthropic: null,
  },
  activeModels: {
    openai: false,
    gemini: false,
    groq: false,
    deepseek: false,
    anthropic: false,
  },

  setKey: (model, key) => {
    const ciphertext = CryptoJS.AES.encrypt(key, "local-secret").toString();
    localStorage.setItem(`key-${model}`, ciphertext);
    set((state) => ({
      keys: { ...state.keys, [model]: key },
      activeModels: { ...state.activeModels, [model]: true },
    }));
  },

  toggleModel: (model, active) =>
    set((state) => ({
      activeModels: { ...state.activeModels, [model]: active },
    })),

  loadKeys: () => {
    const newKeys: Record<AIModel, string | null> = {
      openai: null,
      gemini: null,
      groq: null,
      deepseek: null,
      anthropic: null,
    };
    const newActive: Record<AIModel, boolean> = {
      openai: false,
      gemini: false,
      groq: false,
      deepseek: false,
      anthropic: false,
    };
    (Object.keys(newKeys) as AIModel[]).forEach((model) => {
      const cipher = localStorage.getItem(`key-${model}`);
      if (cipher) {
        const bytes = CryptoJS.AES.decrypt(cipher, "local-secret");
        const key = bytes.toString(CryptoJS.enc.Utf8);
        newKeys[model] = key;
        newActive[model] = true;
      }
    });
    set({ keys: newKeys, activeModels: newActive });
    
    get().loadChatSessions();
  },

  currentChatId: null,
  chatSessions: [],

  createNewChat: () => {
    const newChatId = generateId();
    const newChat: ChatSession = {
      id: newChatId,
      title: "New Chat",
      messages: [],
      activeModels: { ...get().activeModels },
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    set((state) => ({
      currentChatId: newChatId,
      chatSessions: [newChat, ...state.chatSessions],
      prompt: "", 
    }));

    get().saveChatSessions();
  },

  selectChat: (chatId) => {
    const chat = get().chatSessions.find(c => c.id === chatId);
    if (chat) {
      set({ 
        currentChatId: chatId,
        prompt: "", 
        activeModels: chat.activeModels 
      });
    }
  },

  addMessageToChat: (chatId, message) => {
    set((state) => ({
      chatSessions: state.chatSessions.map(chat => 
        chat.id === chatId 
          ? { 
              ...chat, 
              messages: [...chat.messages, message],
              updatedAt: Date.now()
            }
          : chat
      )
    }));
    get().saveChatSessions();
  },

  addUserMessage: (content) => {
    const { currentChatId } = get();
    if (!currentChatId) return;

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    get().addMessageToChat(currentChatId, userMessage);

    const currentChat = get().getCurrentChat();
    if (currentChat && currentChat.messages.length === 1 && currentChat.title === "New Chat") {
      get().updateChatTitle(currentChatId, generateChatTitle(content));
    }
  },

  addAssistantMessage: (content, model) => {
    const { currentChatId } = get();
    if (!currentChatId) return;

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content,
      timestamp: Date.now(),
      model,
    };

    get().addMessageToChat(currentChatId, assistantMessage);
  },

  updateChatTitle: (chatId, title) => {
    set((state) => ({
      chatSessions: state.chatSessions.map(chat => 
        chat.id === chatId 
          ? { ...chat, title, updatedAt: Date.now() }
          : chat
      )
    }));
    get().saveChatSessions();
  },

  deleteChat: (chatId) => {
    set((state) => {
      const newChatSessions = state.chatSessions.filter(chat => chat.id !== chatId);
      const newCurrentChatId = state.currentChatId === chatId ? null : state.currentChatId;
      
      return {
        chatSessions: newChatSessions,
        currentChatId: newCurrentChatId,
        prompt: newCurrentChatId !== state.currentChatId ? "" : state.prompt,
      };
    });
    get().saveChatSessions();
  },

  getCurrentChat: () => {
    const { currentChatId, chatSessions } = get();
    return currentChatId ? chatSessions.find(chat => chat.id === currentChatId) || null : null;
  },

  saveChatSessions: () => {
    const { chatSessions } = get();
    localStorage.setItem('chat-sessions', JSON.stringify(chatSessions));
  },

  loadChatSessions: () => {
    const saved = localStorage.getItem('chat-sessions');
    if (saved) {
      try {
        const chatSessions = JSON.parse(saved);
        set({ chatSessions });
      } catch (error) {
        console.error('Failed to load chat sessions:', error);
      }
    }
  },

  responses: [],
  addResponse: (res) => {
    set((state) => ({ responses: [res, ...state.responses] }));
    
    const { currentChatId } = get();
    if (currentChatId) {
      get().addAssistantMessage(res.content, res.model);
    }
  },
  clearResponses: () => set({ responses: [] }),
}));