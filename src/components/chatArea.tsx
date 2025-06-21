'use client';

import { useRef, useEffect } from 'react';
import { ChatMessage, User } from '@/utils/types';
import { FaEdit, FaTrash } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';

interface ChatAreaProps {
  messages: ChatMessage[];
  newMessage: string;
  setNewMessage: (value: string) => void;
  activeChatUser: User | null;
  user: User | null;
  typing: string[];
  handleSendMessage: () => void;
  handleEditMessage: (id: string, oldMsg: string) => void;
  handleDeleteMessage: (id?: string) => void;
}

export default function ChatArea({
  messages,
  newMessage,
  setNewMessage,
  activeChatUser,
  user,
  typing,
  handleSendMessage,
  handleEditMessage,
  handleDeleteMessage,
}: ChatAreaProps) {
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scroller.current) {
      scroller.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-gray-900 px-4 md:px-6 text-white">
      {/* Top Bar */}
      <div className="p-4 border-b border-zinc-700">
        {activeChatUser ? (
          <div className="flex items-center space-x-3">
            {activeChatUser.picture_url && (
              <img src={activeChatUser.picture_url} alt={activeChatUser.username} className="w-10 h-10 rounded-full" />
            )}
            <h2 className="text-lg">{activeChatUser.username}</h2>
            {typing.includes(activeChatUser.username) && (
              <span className="text-sm text-green-500 animate-pulse">digitando...</span>
            )}
          </div>
        ) : (
          <p className="text-zinc-500">Escolha alguém para conversar.</p>
        )}
      </div>

      {/* Messages */}
      {activeChatUser && (
        <div className="w-full px-4">
          <div
            className="w-full overflow-y-auto scrollbar-none"
            style={{
              maxHeight: 'calc(100vh - 150px)',
            }}
          >
            {messages.map((msg) => {
              const isSender = msg.user_id === user?.id;

              return (
                <div key={msg.id} className={`mb-4 flex ${isSender ? 'justify-end' : 'justify-start'}`}>
                  <div className="w-fit max-w-[90%] md:max-w-xl lg:max-w-2xl">
                    <div className="font-bold text-sm mb-1">
                      {isSender ? 'Eu' : activeChatUser?.username || 'Desconhecido'}
                    </div>
                    <div
                      className={`mb-2 flex ${isSender
                        ? 'bg-gray-200 dark:bg-gray-700 rounded-bl-lg rounded-tr-lg rounded-tl-lg'
                        : 'bg-gray-200 dark:bg-gray-800 rounded-br-lg rounded-tr-lg rounded-tl-lg'
                        } p-2 shadow-sm`}
                    >
                      <div>{msg.message}</div>

                      {isSender && (
                        <div className="flex justify-end ml-2">
                          <button
                            onClick={() => handleEditMessage(msg.id!, msg.message)}
                            className="text-blue-500 hover:text-blue-600 cursor-pointer"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg.id)}
                            className="text-red-500 hover:text-red-600 ml-2"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-400 mt-1">
                      {new Date(msg.created_at!).toLocaleString()}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={scroller} />
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bottom-0 lg:static lg:bottom-auto fixed left-0 w-full bg-white dark:bg-gray-900 border-t border-zinc-700 z-99">
        <div className="flex items-center py-3 max-w-4xl mx-auto">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 p-2 mr-2 dark:bg-gray-700 rounded-s-full pl-4 text-sm md:text-base"
            placeholder="Digite sua mensagem..."
          />

          <button
            onClick={handleSendMessage}
            className="bg-blue-500 text-white p-3 rounded-e-full hover:bg-blue-600 cursor-pointer"
          >
            <IoSend />
          </button>
        </div>
      </div>
    </div>

);
}