import create from 'zustand';
import axios from 'axios';
import { toast } from 'react-hot-toast';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  isLoading: false,

  login: async (username: string, password: string) => {
    try {
      set({ isLoading: true });
      
      const response = await axios.post(`${API_URL}/api/auth/login`, {
        username,
        password
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });

      toast.success('Giriş başarılı');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Giriş başarısız');
      throw error;
    }
  },

  register: async (username: string, email: string, password: string) => {
    try {
      set({ isLoading: true });
      
      const response = await axios.post(`${API_URL}/api/auth/register`, {
        username,
        email,
        password
      });

      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });

      toast.success('Kayıt başarılı');
    } catch (error: any) {
      set({ isLoading: false });
      toast.error(error.response?.data?.message || 'Kayıt başarısız');
      throw error;
    }
  },

  logout: async () => {
    try {
      await axios.post(`${API_URL}/api/auth/logout`);
      
      localStorage.removeItem('token');
      
      set({
        user: null,
        token: null,
        isAuthenticated: false
      });

      toast.success('Çıkış yapıldı');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Çıkış yapılamadı');
      throw error;
    }
  },

  updateProfile: async (data: Partial<User>) => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.put(
        `${API_URL}/api/auth/me`,
        data,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      set((state) => ({
        user: {
          ...state.user,
          ...response.data.user
        }
      }));

      toast.success('Profil güncellendi');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Profil güncellenemedi');
      throw error;
    }
  }
})); 