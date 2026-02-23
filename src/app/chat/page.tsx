"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { User, ChatMessage } from '@/utils/types';
import ChatSidebar from '@/components/chatSidebar';
import ChatArea from '@/components/chatArea';
import { IoClose, IoMenu } from 'react-icons/io5';
import Loadingpage from '@/loadingpages/loadingpage';
import api from '@/utils/api';

export default function Chat() {
  const { session } = useAuth();
  // Pegando user do session de forma segura
  const user = useMemo(() => session?.user as unknown as User | null, [session]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [search, setSearch] = useState<string>('');
  const [previousContacts, setPreviousContacts] = useState<User[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const socketRef = useRef<Socket | null>(null);

  // Inicializa socket uma única vez
  useEffect(() => {
    if (!user?.id) return;

    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001', {
      query: { userId: user.id }
    });

    const socket = socketRef.current;

    socket.on('receive_message', (msg: ChatMessage) => {
      // Só adiciona se a mensagem for da conversa ativa ou do próprio usuário
      setMessages((prev) => {
        const isFromActive = msg.user_id === activeChatUser?.id || msg.receiver_id === activeChatUser?.id;
        if (prev.some((m) => m.id === msg.id) || !isFromActive) return prev;
        return [...prev, msg];
      });
    });

    socket.on('user_typing', (username: string) => {
      setTyping((prev) => (prev.includes(username) ? prev : [...prev, username]));
      setTimeout(() => {
        setTyping((prev) => prev.filter((name) => name !== username));
      }, 3000);
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, activeChatUser?.id]);

  const fetchUsers = useCallback(async () => {
    if (!search.trim()) return;
    try {
      const res = await api.get('/auth/user', { params: { username: search } });
      setProfiles((res.data as User[]).filter((u) => u.id !== user?.id));
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    }
  }, [search, user?.id]);

  const fetchMessages = useCallback(async () => {
    if (!user?.id || !activeChatUser?.id) return;
    setLoadingMessages(true);
    try {
      const res = await api.get(`/chat_messages/conversation`, {
        params: { user1: user.id, user2: activeChatUser.id },
      });
      setMessages(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [user?.id, activeChatUser?.id]);

  const loadPreviousContacts = useCallback(async () => {
    if (!user?.id) return;
    try {
      const res = await api.get(`/chat_messages/contacts/${user.id}`);
      setPreviousContacts(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    }
  }, [user?.id]);

  useEffect(() => {
    if (activeChatUser) fetchMessages();
  }, [activeChatUser, fetchMessages]);

  useEffect(() => {
    loadPreviousContacts();
  }, [loadPreviousContacts]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !activeChatUser) return;

    const msgData = {
      username: user.username,
      user_id: user.id,
      receiver_id: activeChatUser.id,
      message: newMessage,
    };

    try {
      const res = await api.post('/chat_messages', msgData);
      const savedMsg = res.data as ChatMessage;
      
      socketRef.current?.emit('send_message', savedMsg);
      setMessages((prev) => [...prev, savedMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar:', error);
    }
  };

  if (!session) return <Loadingpage />;

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950 overflow-hidden">
      <ChatSidebar
        search={search}
        setSearch={setSearch}
        profiles={profiles}
        setActiveChatUser={setActiveChatUser}
        previousContacts={previousContacts}
        isOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleSearch={fetchUsers}
        activeChatUserId={activeChatUser?.id}
      />

      <div className="flex-1 flex flex-col relative h-full">
        {/* Botão Mobile Hamburger */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden absolute top-4 left-4 z-40 bg-white dark:bg-gray-800 p-2 rounded-xl shadow-md border dark:border-gray-700"
        >
          <IoMenu size={24} className="text-gray-700 dark:text-gray-200" />
        </button>

        <ChatArea
          messages={messages}
          newMessage={newMessage}
          setNewMessage={setNewMessage}
          activeChatUser={activeChatUser}
          user={user}
          typing={typing}
          handleSendMessage={handleSendMessage}
          loadingMessages={loadingMessages}
        />
      </div>
    </div>
  );
}