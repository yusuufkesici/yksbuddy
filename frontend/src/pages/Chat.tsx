import React, { useEffect, useRef, useState } from 'react';
import { useMessageStore } from '../store/messageStore';
import { useAuthStore } from '../store/authStore';
import { useWebSocket } from '../hooks/useWebSocket';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PaperAirplaneIcon, PhotoIcon } from '@heroicons/react/24/outline';

const Chat: React.FC = () => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuthStore();
  const { messages, sendMessage, getMessages, isLoading, hasMore } = useMessageStore();
  const { sendTyping } = useWebSocket();

  // Mesajları yükle
  useEffect(() => {
    getMessages();
  }, []);

  // Mesajları otomatik kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Yazıyor durumunu kontrol et
  useEffect(() => {
    if (message && !isTyping) {
      setIsTyping(true);
      sendTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        sendTyping(false);
      }
    }, 1000);

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping]);

  // Mesaj gönder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    try {
      await sendMessage(message);
      setMessage('');
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
    }
  };

  // Dosya seç
  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  // Dosya yükle
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await sendMessage('', 'image', file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
    }
  };

  // Daha fazla mesaj yükle
  const handleLoadMore = () => {
    if (messages.length > 0) {
      getMessages(messages[messages.length - 1].createdAt);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Mesaj listesi */}
      <div className="flex-1 overflow-y-auto p-4">
        {hasMore && (
          <div className="text-center mb-4">
            <button
              onClick={handleLoadMore}
              disabled={isLoading}
              className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            >
              {isLoading ? 'Yükleniyor...' : 'Daha fazla mesaj yükle'}
            </button>
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`flex ${
                msg.sender._id === user?._id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[70%] rounded-lg px-4 py-2 ${
                  msg.sender._id === user?._id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                {/* Gönderen bilgisi */}
                <div className="flex items-center space-x-2 mb-1">
                  <span className="font-medium text-sm">
                    {msg.sender.username}
                  </span>
                  <span className="text-xs opacity-75">
                    {format(new Date(msg.createdAt), 'HH:mm', { locale: tr })}
                  </span>
                </div>

                {/* Mesaj içeriği */}
                {msg.type === 'text' ? (
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {msg.content}
                  </p>
                ) : (
                  <div className="mt-2">
                    <img
                      src={msg.mediaUrl}
                      alt="Paylaşılan görsel"
                      className="max-w-full rounded-lg"
                    />
                    {msg.content && (
                      <p className="mt-2 text-sm">{msg.content}</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Mesaj gönderme formu */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSubmit} className="flex items-center space-x-4">
          {/* Dosya yükleme */}
          <button
            type="button"
            onClick={handleFileSelect}
            className="text-gray-500 hover:text-indigo-600"
          >
            <PhotoIcon className="h-6 w-6" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          {/* Mesaj girişi */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Bir mesaj yazın..."
            className="flex-1 border-0 focus:ring-0 focus:outline-none"
          />

          {/* Gönder butonu */}
          <button
            type="submit"
            disabled={!message.trim()}
            className="text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
          >
            <PaperAirplaneIcon className="h-6 w-6" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chat; 