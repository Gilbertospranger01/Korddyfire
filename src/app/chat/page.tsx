'use client';

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
  const user = useMemo(() => session?.user as unknown as User | null, [session]);

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [search, setSearch] = useState<string>('');
  const [previousContacts, setPreviousContacts] = useState<User[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const socketRef = useRef<Socket | null>(null);
  const mounted = useRef(true);

  // Inicializa socket
  useEffect(() => {
    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');

    const socket = socketRef.current;

    socket.on('receive_message', (msg: ChatMessage) => {
      setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
    });

    socket.on('user_typing', (username: string) => {
      setTyping((prev) => (prev.includes(username) ? prev : [...prev, username]));
      setTimeout(() => {
        setTyping((prev) => prev.filter((name) => name !== username));
      }, 2000);
    });

    return () => {
      mounted.current = false;
      socket.disconnect();
    };
  }, []);

  // Busca usuários pela API RESTful
  const fetchUsers = useCallback(async () => {
    if (!search.trim()) return;

    try {
      const res = await api.get(`/profiles?username_like=${search}`);
      const data = res.data as User[];
      if (mounted.current) setProfiles(data.filter((u) => u.id !== user?.id));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  }, [search, user?.id]);

  // Busca mensagens entre usuários via API RESTful
  const fetchMessages = useCallback(async () => {
    if (!user || !activeChatUser) return;

    try {
      const res = await api.get(`/chat_messages/conversation`, {
        params: {
          user1: user.id,
          user2: activeChatUser.id,
        },
      });
      if (mounted.current) setMessages(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  }, [user, activeChatUser]);

  // Carrega contatos anteriores via API RESTful
  const loadPreviousContacts = useCallback(async (userId: string) => {
    try {
      const res = await api.get(`/chat_messages/contacts/${userId}`);
      if (mounted.current) setPreviousContacts(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (activeChatUser) fetchMessages();
  }, [activeChatUser, fetchMessages]);

  useEffect(() => {
    if (user?.id) loadPreviousContacts(user.id);
  }, [user, loadPreviousContacts]);

  // Envia mensagem
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !activeChatUser) return;

    const msg: Partial<ChatMessage> = {
      username: user.username,
      user_id: user.id,
      receiver_id: activeChatUser.id,
      message: newMessage,
      created_at: new Date().toISOString(),
    };

    try {
      const res = await api.post('/chat_messages', msg);
      const savedMsg = res.data as ChatMessage;
      socketRef.current?.emit('send_message', savedMsg);
      if (mounted.current) {
        setMessages((prev) => [...prev, savedMsg]);
        setNewMessage('');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  // Edita mensagem
  const handleEditMessage = async (id: string, oldMsg: string) => {
    const newMsg = prompt('Editar mensagem:', oldMsg);
    if (newMsg && newMsg !== oldMsg) {
      try {
        await api.put(`/chat_messages/${id}`, { message: newMsg });
        if (mounted.current) {
          setMessages((prev) =>
            prev.map((msg) => (msg.id === id ? { ...msg, message: newMsg } : msg))
          );
        }
      } catch (error) {
        console.error('Erro ao editar mensagem:', error);
      }
    }
  };

  // Deleta mensagem
  const handleDeleteMessage = async (id?: string) => {
    if (!id) return;
    try {
      await api.delete(`/chat_messages/${id}`);
      if (mounted.current) setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
    }
  };

  if (!session) return <Loadingpage />;

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-100 dark:bg-gray-900">
      {/* Botão mobile para abrir menu */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-50 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full shadow-lg transition"
      >
        {isSidebarOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
      </button>

      <ChatSidebar
        search={search}
        setSearch={setSearch}
        profiles={profiles}
        setActiveChatUser={setActiveChatUser}
        previousContacts={previousContacts}
        isOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleSearch={fetchUsers}
      />

      <ChatArea
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        activeChatUser={activeChatUser}
        user={user}
        typing={typing}
        handleSendMessage={handleSendMessage}
        handleEditMessage={handleEditMessage}
        handleDeleteMessage={handleDeleteMessage}
      />
    </div>
  );
}