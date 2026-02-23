"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/useAuth';
import { User, ChatMessage } from '@/utils/types';
import ChatSidebar from '@/components/chatSidebar';
import ChatArea from '@/components/chatArea';
import Loadingpage from '@/loadingpages/loadingpage';
import api from '@/utils/api';

export default function Chat() {
  const { session } = useAuth();
  // Sincronização de usuário igual à Home e Header
  const [currentUser, setCurrentUser] = useState<User | null>(null);

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

  // 1. Carregar usuário do LocalStorage (Padrão do seu App)
  useEffect(() => {
    const storedUser = localStorage.getItem("auth_user");
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  // 2. Socket Connection
  useEffect(() => {
    if (!currentUser?.id) return;

    socketRef.current = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');
    const socket = socketRef.current;

    socket.on('receive_message', (msg: ChatMessage) => {
      setMessages((prev) => {
        // Só adiciona se for da conversa que estou vendo agora
        const isRelevant = msg.user_id === activeChatUser?.id || msg.receiver_id === activeChatUser?.id;
        if (prev.some(m => m.id === msg.id) || !isRelevant) return prev;
        return [...prev, msg];
      });
    });

    return () => { socket.disconnect(); };
  }, [currentUser?.id, activeChatUser?.id]);

  // 3. Busca de Usuários (CORRIGIDA)
  const fetchUsers = useCallback(async () => {
    if (!search.trim()) return;
    try {
      const res = await api.get('/auth/user', { params: { username: search } });
      const data = res.data as User[];
      // Filtra para não aparecer você mesmo na busca
      setProfiles(data.filter(u => u.id !== currentUser?.id));
    } catch (err) {
      console.error('Erro ao buscar usuários:', err);
    }
  }, [search, currentUser?.id]);

  const fetchMessages = useCallback(async () => {
    if (!currentUser?.id || !activeChatUser?.id) return;
    setLoadingMessages(true);
    try {
      const res = await api.get(`/chat_messages/conversation`, {
        params: { user1: currentUser.id, user2: activeChatUser.id },
      });
      setMessages(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar mensagens:', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [currentUser?.id, activeChatUser?.id]);

  const loadPreviousContacts = useCallback(async () => {
    if (!currentUser?.id) return;
    try {
      const res = await api.get(`/chat_messages/contacts/${currentUser.id}`);
      setPreviousContacts(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    }
  }, [currentUser?.id]);

  useEffect(() => {
    if (activeChatUser) fetchMessages();
  }, [activeChatUser, fetchMessages]);

  useEffect(() => {
    if (currentUser?.id) loadPreviousContacts();
  }, [currentUser, loadPreviousContacts]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !currentUser || !activeChatUser) return;
    const msgData = {
      username: currentUser.username,
      user_id: currentUser.id,
      receiver_id: activeChatUser.id,
      message: newMessage,
    };
    try {
      const res = await api.post('/chat_messages', msgData);
      socketRef.current?.emit('send_message', res.data);
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (error) { console.error(error); }
  };

  if (!session) return <Loadingpage />;

  return (
    <div className="flex h-screen bg-white dark:bg-gray-950 overflow-hidden">
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
      <ChatArea
        messages={messages}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        activeChatUser={activeChatUser}
        user={currentUser}
        typing={typing}
        handleSendMessage={handleSendMessage}
        loadingMessages={loadingMessages}
        onOpenSidebar={() => setIsSidebarOpen(true)}
      />
    </div>
  );
}