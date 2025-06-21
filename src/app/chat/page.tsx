'use client';

import { useState, useEffect } from 'react';
import supabase from '@/utils/supabase';
import { io } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { User, ChatMessage } from '@/utils/types';
import ChatSidebar from '@/components/chatSidebar';
import ChatArea from '@/components/chatArea';
import { IoClose, IoMenu } from 'react-icons/io5';
import Loadingpage from '../../loadingpages/loadingpage';

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

  const fetchUsers = async () => {
    if (!search.trim()) return; // Não busca se o campo de pesquisa estiver vazio
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${search}%`); // Busca por nome de usuário

    if (!error && data) {
      setProfiles(data.filter((u: User) => u.id !== user?.id));
    }
  };

  const loadPreviousContacts = async (userId: string) => {
    const { data, error } = await supabase
      .from('chat_messages')
      .select('user_id, receiver_id')
      .or(`user_id.eq.${userId},receiver_id.eq.${userId}`);

    if (error) {
      console.error('Erro ao carregar contatos:', error);
      return;
    }

    const contactIds = new Set<string>();
    data?.forEach((msg) => {
      if (msg.user_id !== userId) contactIds.add(msg.user_id);
      if (msg.receiver_id !== userId) contactIds.add(msg.receiver_id);
    });

    const { data: usersData } = await supabase
      .from('profiles')
      .select('*')
      .in('id', Array.from(contactIds));

    setPreviousContacts(usersData || []);
  };

  useEffect(() => {
    if (user?.id) {
      loadPreviousContacts(user.id);
    }
  }, [user]);

  const fetchMessages = async () => {
    if (!user || !activeChatUser) return;

    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .or(
        `and(user_id.eq.${user.id},receiver_id.eq.${activeChatUser.id}),and(user_id.eq.${activeChatUser.id},receiver_id.eq.${user.id})`
      )
      .order('created_at', { ascending: true });

    if (!error) setMessages(data || []);
    else console.error('Erro ao carregar mensagens:', error);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user || !activeChatUser) return;

    const msg: ChatMessage = {
      username: user.username,
      user_id: user.id,
      receiver_id: activeChatUser.id,
      message: newMessage,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase.from('chat_messages').insert([msg]).select();

    if (!error && data?.[0]) {
      socket.emit('send_message', data[0]);
      setMessages((prev) => [...prev, data[0]]);
      setNewMessage('');
    }
  };

  const handleEditMessage = async (id: string, oldMsg: string) => {
    const newMsg = prompt('Editar mensagem:', oldMsg);
    if (newMsg && newMsg !== oldMsg) {
      await supabase.from('chat_messages').update({ message: newMsg }).eq('id', id);
      setMessages((prev) =>
        prev.map((msg) => (msg.id === id ? { ...msg, message: newMsg } : msg))
      );
    }
  };

  const handleDeleteMessage = async (id?: string) => {
    if (!id) return;
    await supabase.from('chat_messages').delete().eq('id', id);
    setMessages((prev) => prev.filter((msg) => msg.id !== id));
  };

  if (!session) {
    return (
      <Loadingpage/>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Botão de Menu para Sidebar */}
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 right-4 z-99 bg-blue-600 text-white p-2 rounded-full shadow-lg"
      >
        {isSidebarOpen ? <IoClose size={24} /> : <IoMenu size={24} />}
      </button>

      {/* Sidebar */}
      <ChatSidebar
        search={search}
        setSearch={setSearch}
        profiles={profiles}
        setActiveChatUser={setActiveChatUser}
        previousContacts={previousContacts}
        isOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen} // Passa a função para fechar a sidebar
        handleSearch={fetchUsers}
      />

      {/* Área de Chat */}
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
