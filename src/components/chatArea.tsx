"use client";

import { useRef, useEffect } from 'react';
import { ChatMessage, User } from '@/utils/types';
import { IoSend } from 'react-icons/io5';
import Image from 'next/image';

interface ChatAreaProps {
  messages: ChatMessage[];
  newMessage: string;
  setNewMessage: (value: string) => void;
  activeChatUser: User | null;
  user: User | null;
  typing: string[];
  handleSendMessage: () => void;
  loadingMessages: boolean;
}

export default function ChatArea({
  messages, newMessage, setNewMessage, activeChatUser, user, typing, handleSendMessage, loadingMessages
}: ChatAreaProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  if (!activeChatUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm text-center">
          <p className="text-lg font-medium">Selecione uma conversa para começar</p>
          <p className="text-sm opacity-60">Sua privacidade é nossa prioridade.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header do Chat */}
      <div className="px-6 py-4 border-b dark:border-gray-800 flex items-center justify-between bg-white/80 dark:bg-gray-950/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            <Image
              src={activeChatUser.picture_url || '/placeholder.jpg'}
              alt={activeChatUser.username}
              fill
              className="rounded-full object-cover border-2 border-green-500"
            />
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-950 rounded-full" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white leading-none">
              {activeChatUser.username}
            </h3>
            {typing.includes(activeChatUser.username) ? (
              <span className="text-xs text-green-500 font-medium animate-pulse">digitando...</span>
            ) : (
              <span className="text-xs text-gray-500">Online agora</span>
            )}
          </div>
        </div>
      </div>

      {/* Mensagens */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth">
        {loadingMessages ? (
          <div className="flex justify-center p-10"><span className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></span></div>
        ) : (
          messages.map((msg) => {
            const isSender = msg.user_id === user?.id;
            return (
              <div key={msg.id} className={`flex ${isSender ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[80%] md:max-w-[60%] px-4 py-2.5 rounded-2xl shadow-sm ${
                  isSender 
                    ? 'bg-green-600 text-white rounded-tr-none' 
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-tl-none'
                }`}>
                  <p className="text-sm md:text-base leading-relaxed">{msg.message}</p>
                  <span className={`block text-[10px] mt-1 opacity-70 ${isSender ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.created_at!).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input de Mensagem */}
      <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="max-w-4xl mx-auto flex items-center gap-2 bg-gray-100 dark:bg-gray-900 rounded-2xl p-1.5 border dark:border-gray-800 focus-within:ring-2 ring-green-500 transition-all">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Escreva sua mensagem..."
            className="flex-1 bg-transparent border-none focus:ring-0 px-3 text-sm dark:text-white outline-none"
          />
          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white p-3 rounded-xl transition-all active:scale-95 shadow-lg shadow-green-500/20"
          >
            <IoSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}