"use client";
import { useRef, useEffect } from 'react';
import { ChatMessage, User } from '@/utils/types';
import { IoSend, IoMenu } from 'react-icons/io5';
import Image from 'next/image';

export default function ChatArea({
  messages, newMessage, setNewMessage, activeChatUser, user, typing, handleSendMessage, loadingMessages, onOpenSidebar
}: any) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!activeChatUser) return (
    <div className="flex-1 flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 text-gray-400">
       <button onClick={onOpenSidebar} className="md:hidden mb-4 p-3 bg-blue-600 text-white rounded-full">
         <IoMenu size={24} />
       </button>
       <p>Selecione uma conversa para começar</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-950">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-800 flex items-center gap-3">
        <button onClick={onOpenSidebar} className="md:hidden p-2 dark:text-white">
          <IoMenu size={24} />
        </button>
        <div className="relative w-10 h-10">
          <Image src={activeChatUser.picture_url || '/placeholder.jpg'} alt="Avatar" fill className="rounded-full object-cover" />
        </div>
        <div>
          <h2 className="font-bold dark:text-white">@{activeChatUser.username}</h2>
          {typing.includes(activeChatUser.username) && <span className="text-xs text-green-500">digitando...</span>}
        </div>
      </div>

      {/* Mensagens */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg: any) => {
          const isMe = msg.user_id === user?.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-2xl shadow-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-gray-100 dark:bg-gray-800 dark:text-white rounded-tl-none'}`}>
                <p className="text-sm">{msg.message}</p>
                <span className="text-[10px] opacity-50 block mt-1">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          );
        })}
        <div ref={scroller} />
      </div>

      {/* Input */}
      <div className="p-4 bg-white dark:bg-gray-950 border-t dark:border-gray-800">
        <div className="flex items-center gap-2 max-w-4xl mx-auto bg-gray-100 dark:bg-gray-900 rounded-2xl p-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Mensagem..."
            className="flex-1 bg-transparent outline-none px-2 dark:text-white"
          />
          <button onClick={handleSendMessage} className="bg-blue-600 p-3 rounded-xl text-white hover:scale-105 transition">
            <IoSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}