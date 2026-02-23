"use client";

import Image from 'next/image';
import { User } from '@/utils/types';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import { IoClose } from 'react-icons/io5';
import { useRouter } from "next/navigation";

interface ChatSidebarProps {
  search: string;
  setSearch: (value: string) => void;
  profiles: User[];
  setActiveChatUser: (user: User | null) => void;
  previousContacts: User[];
  handleSearch: () => Promise<void>;
  isOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
  activeChatUserId?: string;
}

export default function ChatSidebar({
  search, setSearch, profiles, setActiveChatUser, previousContacts, handleSearch, isOpen, setIsSidebarOpen, activeChatUserId
}: ChatSidebarProps) {
  const router = useRouter();

  const handleSelectUser = (user: User) => {
    setActiveChatUser(user);
    setIsSidebarOpen(false);
  };

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      <aside className={`fixed md:static inset-y-0 left-0 w-[85%] sm:w-[350px] md:w-[320px] lg:w-[380px] bg-white dark:bg-gray-900 border-r dark:border-gray-800 z-50 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 md:translate-x-0 flex flex-col`}>
        
        {/* Header Sidebar */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => router.push('/home')} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition text-gray-600 dark:text-gray-300">
              <FiArrowLeft size={22} />
            </button>
            <h2 className="text-xl font-black dark:text-white">Mensagens</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="md:hidden p-2">
              <IoClose size={24} className="dark:text-white" />
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Buscar pessoas..."
              className="w-full pl-10 pr-4 py-3 bg-gray-100 dark:bg-gray-800 border-none rounded-2xl text-sm focus:ring-2 ring-green-500 outline-none dark:text-white transition-all"
            />
          </div>
        </div>

        {/* Lista de Contatos */}
        <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-6">
          {profiles.length > 0 && (
            <div className="mb-6">
              <h3 className="px-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Resultados</h3>
              {profiles.map(p => (
                <button key={p.id} onClick={() => handleSelectUser(p)} className="w-full flex items-center gap-3 p-3 rounded-2xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-left group">
                  <div className="relative w-12 h-12">
                    <Image src={p.picture_url || '/placeholder.jpg'} alt="" fill className="rounded-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 dark:text-white group-hover:text-green-600 transition-colors">@{p.username}</p>
                    <p className="text-xs text-gray-500">Clique para iniciar conversa</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          <h3 className="px-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Conversas Recentes</h3>
          {previousContacts.length === 0 ? (
            <p className="px-2 text-sm text-gray-500 italic">Nenhuma conversa ainda.</p>
          ) : (
            previousContacts.map(c => (
              <button 
                key={c.id} 
                onClick={() => handleSelectUser(c)} 
                className={`w-full flex items-center gap-3 p-3 rounded-2xl transition-all text-left ${
                  activeChatUserId === c.id ? 'bg-green-50 dark:bg-green-900/20 ring-1 ring-green-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                <div className="relative w-12 h-12 flex-shrink-0">
                  <Image src={c.picture_url || '/placeholder.jpg'} alt="" fill className="rounded-full object-cover" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-gray-900 rounded-full" />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-gray-900 dark:text-white truncate">@{c.username}</p>
                  <p className="text-xs text-gray-500 truncate italic">Conversa ativa</p>
                </div>
              </button>
            ))
          )}
        </div>
      </aside>
    </>
  );
}