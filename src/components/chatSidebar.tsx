"use client";
import Image from 'next/image';
import { FiArrowLeft, FiSearch } from 'react-icons/fi';
import { useRouter } from "next/navigation";

export default function ChatSidebar({
  search, setSearch, profiles, setActiveChatUser, previousContacts, handleSearch, isOpen, setIsSidebarOpen, activeChatUserId
}: any) {
  const router = useRouter();

  return (
    <aside className={`fixed md:static inset-0 z-50 w-full md:w-80 bg-white dark:bg-gray-900 border-r dark:border-gray-800 transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
      <div className="p-4 flex flex-col h-full">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => router.push('/home')} className="dark:text-white"><FiArrowLeft size={24}/></button>
          <h1 className="text-xl font-bold dark:text-white">Chat</h1>
        </div>

        {/* Input de Busca */}
        <div className="relative mb-4">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full p-3 pl-10 bg-gray-100 dark:bg-gray-800 rounded-xl dark:text-white outline-none focus:ring-2 ring-blue-500"
            placeholder="Buscar usuário..."
          />
          <FiSearch className="absolute left-3 top-4 text-gray-400" />
        </div>

        <button onClick={handleSearch} className="w-full bg-blue-600 text-white p-2 rounded-xl mb-6 font-bold hover:bg-blue-700">
          Pesquisar
        </button>

        <div className="flex-1 overflow-y-auto space-y-4">
          {/* Resultados da Busca */}
          {profiles.length > 0 && (
            <div>
              <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Resultados</p>
              {profiles.map((p: any) => (
                <div key={p.id} onClick={() => { setActiveChatUser(p); setIsSidebarOpen(false); }} className="flex items-center gap-3 p-3 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl cursor-pointer">
                   <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                     {p.username[0].toUpperCase()}
                   </div>
                   <span className="dark:text-white font-medium">@{p.username}</span>
                </div>
              ))}
            </div>
          )}

          {/* Conversas Anteriores */}
          <p className="text-xs font-bold text-gray-500 mb-2 uppercase">Recentes</p>
          {previousContacts.map((c: any) => (
            <div 
              key={c.id} 
              onClick={() => { setActiveChatUser(c); setIsSidebarOpen(false); }} 
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${activeChatUserId === c.id ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}
            >
              <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                {c.username[0].toUpperCase()}
              </div>
              <span className="dark:text-white font-medium">@{c.username}</span>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}