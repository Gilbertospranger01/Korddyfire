'use client';

import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { User, ChatMessage } from '@/utils/types';
import ChatSidebar from '@/components/chatSidebar';
import ChatArea from '@/components/chatArea';
import { IoClose, IoMenu } from 'react-icons/io5';
import Loadingpage from '../../loadingpages/loadingpage';
import api from '@/utils/api'; // import da API RESTful

const socket = io('http://localhost:3001');

export default function Chat() {
  const { session } = useAuth();
  const user = session?.user as unknown as User | null;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState<string[]>([]);
  const [profiles, setProfiles] = useState<User[]>([]);
  const [search, setSearch] = useState<string>('');
  const [previousContacts, setPreviousContacts] = useState<User[]>([]);
  const [activeChatUser, setActiveChatUser] = useState<User | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
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
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (activeChatUser) fetchMessages();
  }, [activeChatUser]);

  // Busca usuários pela API RESTful
  const fetchUsers = async () => {
    if (!search.trim()) return;

    try {
      const res = await api.get(`/profiles?username_like=${search}`);
      const data = res.data as User[];
      setProfiles(data.filter((u) => u.id !== user?.id));
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
    }
  };

  // Carrega contatos anteriores via API RESTful
  const loadPreviousContacts = async (userId: string) => {
    try {
      const res = await api.get(`/chat_messages/contacts/${userId}`);
      // API retorna os usuários contatos direto, ajusta conforme sua API
      setPreviousContacts(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      loadPreviousContacts(user.id);
    }
  }, [user]);

  // Busca mensagens entre usuários via API RESTful
  const fetchMessages = async () => {
    if (!user || !activeChatUser) return;

    try {
      const res = await api.get(`/chat_messages/conversation`, {
        params: {
          user1: user.id,
          user2: activeChatUser.id,
        },
      });
      setMessages(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    }
  };

  // Envia mensagem via API RESTful
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
      socket.emit('send_message', savedMsg);
      setMessages((prev) => [...prev, savedMsg]);
      setNewMessage('');
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
    }
  };

  // Edita mensagem via API RESTful
  const handleEditMessage = async (id: string, oldMsg: string) => {
    const newMsg = prompt('Editar mensagem:', oldMsg);
    if (newMsg && newMsg !== oldMsg) {
      try {
        await api.put(`/chat_messages/${id}`, { message: newMsg });
        setMessages((prev) =>
          prev.map((msg) => (msg.id === id ? { ...msg, message: newMsg } : msg))
        );
      } catch (error) {
        console.error('Erro ao editar mensagem:', error);
      }
    }
  };

  // Deleta mensagem via API RESTful
  const handleDeleteMessage = async (id?: string) => {
    if (!id) return;
    try {
      await api.delete(`/chat_messages/${id}`);
      setMessages((prev) => prev.filter((msg) => msg.id !== id));
    } catch (error) {
      console.error('Erro ao deletar mensagem:', error);
    }
  };

  if (!session) {
    return <Loadingpage />;
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-99 bg-blue-600 text-white p-2 rounded-full shadow-lg"
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