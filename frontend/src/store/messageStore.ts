import create from 'zustand';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  username: string;
  avatar?: string;
}

interface Reaction {
  user: User;
  emoji: string;
}

interface Message {
  _id: string;
  content: string;
  sender: User;
  type: 'text' | 'image' | 'file';
  mediaUrl?: string;
  reactions: Reaction[];
  readBy: User[];
  replyTo?: Message;
  createdAt: string;
}

interface MessageState {
  messages: Message[];
  isLoading: boolean;
  hasMore: boolean;
  getMessages: (before?: string) => Promise<void>;
  sendMessage: (content: string, type?: 'text' | 'image' | 'file', file?: File, replyTo?: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  addReaction: (messageId: string, emoji: string) => Promise<void>;
  markAsRead: (messageId: string) => Promise<void>;
  addMessage: (message: Message) => void;
  updateMessage: (messageId: string, updates: Partial<Message>) => void;
  removeMessage: (messageId: string) => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  isLoading: false,
  hasMore: true,

  getMessages: async (before?: string) => {
    try {
      set({ isLoading: true });
      
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/messages`, {
        params: { before, limit: 50 },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const newMessages = response.data;
      
      set((state) => ({
        messages: before
          ? [...state.messages, ...newMessages]
          : newMessages,
        hasMore: newMessages.length === 50,
        isLoading: false
      }));
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Mesajlar alınamadı');
      throw error;
    }
  },

  sendMessage: async (content: string, type = 'text', file?: File, replyTo?: string) => {
    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('content', content);
      formData.append('type', type);
      
      if (file) {
        formData.append('file', file);
      }
      
      if (replyTo) {
        formData.append('replyTo', replyTo);
      }

      const response = await axios.post(
        `${API_URL}/api/messages${type !== 'text' ? '/media' : ''}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      const newMessage = response.data;
      
      set((state) => ({
        messages: [newMessage, ...state.messages]
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Mesaj gönderilemedi');
      throw error;
    }
  },

  deleteMessage: async (messageId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`${API_URL}/api/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      set((state) => ({
        messages: state.messages.filter(m => m._id !== messageId)
      }));

      toast.success('Mesaj silindi');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Mesaj silinemedi');
      throw error;
    }
  },

  addReaction: async (messageId: string, emoji: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/api/messages/${messageId}/reactions`,
        { emoji },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const updatedMessage = response.data;
      
      set((state) => ({
        messages: state.messages.map(m =>
          m._id === messageId ? updatedMessage : m
        )
      }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Reaksiyon eklenemedi');
      throw error;
    }
  },

  markAsRead: async (messageId: string) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/api/messages/${messageId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const updatedMessage = response.data;
      
      set((state) => ({
        messages: state.messages.map(m =>
          m._id === messageId ? updatedMessage : m
        )
      }));
    } catch (error: any) {
      console.error('Okundu işaretleme hatası:', error);
    }
  },

  addMessage: (message: Message) => {
    set((state) => ({
      messages: [message, ...state.messages]
    }));
  },

  updateMessage: (messageId: string, updates: Partial<Message>) => {
    set((state) => ({
      messages: state.messages.map(m =>
        m._id === messageId ? { ...m, ...updates } : m
      )
    }));
  },

  removeMessage: (messageId: string) => {
    set((state) => ({
      messages: state.messages.filter(m => m._id !== messageId)
    }));
  }
})); 