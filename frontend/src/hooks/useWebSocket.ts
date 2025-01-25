import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';
import { useMessageStore } from '../store/messageStore';
import { useOnlineUsersStore } from '../store/onlineUsersStore';

const SOCKET_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

export const useWebSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const token = useAuthStore(state => state.token);
  const addMessage = useMessageStore(state => state.addMessage);
  const updateMessage = useMessageStore(state => state.updateMessage);
  const removeMessage = useMessageStore(state => state.removeMessage);
  const {
    setUsers,
    addUser,
    removeUser,
    updateUserStatus,
    setUserLastSeen,
    addTypingUser,
    removeTypingUser
  } = useOnlineUsersStore();

  useEffect(() => {
    if (!token) return;

    // Socket.IO bağlantısını oluştur
    socketRef.current = io(SOCKET_URL, {
      auth: { token }
    });

    const socket = socketRef.current;

    // Bağlantı olayları
    socket.on('connect', () => {
      console.log('WebSocket bağlantısı kuruldu');
    });

    socket.on('connect_error', (error) => {
      console.error('WebSocket bağlantı hatası:', error);
    });

    // Kullanıcı olayları
    socket.on('users:list', (users) => {
      setUsers(users);
    });

    socket.on('user:online', (user) => {
      addUser(user);
    });

    socket.on('user:offline', ({ userId, lastSeen }) => {
      setUserLastSeen(userId, new Date(lastSeen));
    });

    socket.on('user:status', ({ userId, status }) => {
      updateUserStatus(userId, status);
    });

    socket.on('user:typing', ({ userId, username }) => {
      addTypingUser(userId, username);
    });

    socket.on('user:typing:stop', ({ userId }) => {
      removeTypingUser(userId);
    });

    // Mesaj olayları
    socket.on('message:new', (message) => {
      addMessage(message);
    });

    socket.on('message:update', ({ messageId, updates }) => {
      updateMessage(messageId, updates);
    });

    socket.on('message:delete', (messageId) => {
      removeMessage(messageId);
    });

    socket.on('message:reaction', (message) => {
      updateMessage(message._id, message);
    });

    socket.on('message:read', (message) => {
      updateMessage(message._id, message);
    });

    // Temizlik işlevi
    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [token]);

  // Yazıyor durumunu gönder
  const sendTyping = (isTyping: boolean) => {
    if (socketRef.current) {
      socketRef.current.emit(isTyping ? 'typing:start' : 'typing:stop');
    }
  };

  // Kullanıcı aktivitesini bildir
  const sendActivity = () => {
    if (socketRef.current) {
      socketRef.current.emit('activity');
    }
  };

  // Kullanıcı durumunu güncelle
  const updateStatus = (status: 'online' | 'away') => {
    if (socketRef.current) {
      socketRef.current.emit('status:change', status);
    }
  };

  return {
    sendTyping,
    sendActivity,
    updateStatus
  };
}; 