'use client';

import Image from 'next/image';
import { User } from '@/utils/types';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter } from "next/navigation";

interface ChatSidebarProps {
  search: string;
  setSearch: (value: string) => void;
  profiles: User[];
  setActiveChatUser: (user: User | null) => void; // Adicionado corretamente
  previousContacts: User[];
  handleSearch: () => Promise<void>; // Certifique-se de que o tipo é uma função assíncrona
  isOpen: boolean;
}

export default function ChatSidebar({
  search,
  setSearch,
  profiles,
  setActiveChatUser,
  previousContacts,
  handleSearch,
  isOpen,
  setIsSidebarOpen, // Adicionada prop para controlar a visibilidade
}: ChatSidebarProps & { setIsSidebarOpen: (value: boolean) => void }) {
  const router = useRouter();

  return (
    <div
      className={`fixed md:static top-0 left-0 h-full w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-800 p-4 border-b md:border-r border-gray-300 dark:border-gray-700 overflow-y-auto z-50 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } transition-transform duration-300 md:translate-x-0`}
    >
      <button
        onClick={() => router.push('/home')}
        className="text-gray-400 hover:text-white transition cursor-pointer"
        aria-label="Voltar para página inicial"
      >
        <FiArrowLeft size={24} />
      </button>
      <h1 className="text-base md:text-lg font-semibold text-center">Korddyfire Chat</h1>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full p-2 mb-2 border rounded dark:bg-gray-700"
        placeholder="Digite nome de usuário"
      />
      <button
        onClick={handleSearch}
        className="w-full bg-blue-600 text-white p-2 rounded mb-4 hover:bg-blue-700 cursor-pointer"
      >
        Buscar
      </button>

      {profiles.map((profile) => (
        <div
          key={profile.id}
          className="flex items-center justify-between mb-3 p-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
        >
          <div className="flex items-center gap-3">
            {profile.picture_url ? (
              <Image
                src={profile.picture_url}
                alt="Profile"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
                {profile.username[0]?.toUpperCase()}
              </div>
            )}
            <span className="font-medium">{profile.username}</span>
          </div>
          <button
            onClick={() => {
              setActiveChatUser(profile);
              setIsSidebarOpen(false); // Fecha a sidebar
            }}
            className="text-sm bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
          >
            Send SMS
          </button>
        </div>
      ))}

      <hr className="my-4" />
      <h3 className="text-md font-semibold">Conversas anteriores</h3>
      {previousContacts.map((c) => (
        <div key={c.id} className="flex items-center mt-4 justify-between">
          {c.picture_url ? (
            <Image
              src={c.picture_url}
              alt="Profile"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold">
              {c.username[0]?.toUpperCase()}
            </div>
          )}
          <span className="mr-2">{c.username}</span>
          <button
            onClick={() => {
              setActiveChatUser(c);
              setIsSidebarOpen(false); // Fecha a sidebar
            }}
            className="text-sm text-blue-600 hover:underline cursor-pointer"
          >
            Open
          </button>
        </div>
      ))}
    </div>
  );
}

