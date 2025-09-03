'use client';

import Image from 'next/image';
import Graph from '@/components/graphics';
import { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Side_Seller_Dashboard from '@/components/sideSellerdashboard';
import { FiArrowLeft } from 'react-icons/fi';
import { useRouter } from 'next/navigation';
import Loadingpage from '../../loadingpages/loadingpage';

interface UserMetadata {
  name?: string;
  avatar_url?: string;
}

interface SessionUser {
  id: string;
  user_metadata?: UserMetadata;
}

const Seller_Dashboard = () => {
  const { session } = useAuth();
  const router = useRouter();

  // Memoize the user object safely
  const user = useMemo(() => {
    const userObj: SessionUser | undefined = session?.user;
    if (!userObj) return null;

    return {
      id: userObj.id,
      name: userObj.user_metadata?.name ?? 'User',
      picture: userObj.user_metadata?.avatar_url ?? null,
    };
  }, [session]);

  if (!session) return <Loadingpage />;

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Fixed header */}
      <header className="flex fixed w-full justify-between items-center z-50 p-4 bg-gray-800 shadow-md border-b border-gray-400">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/home')}
            className="text-gray-400 hover:text-white transition cursor-pointer"
          >
            <FiArrowLeft size={24} />
          </button>
          <div className="text-2xl font-bold pl-8">Korddyfire</div>
        </div>
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-sm">{user.name}</span>
            {user.picture && (
              <Image
                src={user.picture}
                alt="User Avatar"
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
          </div>
        )}
      </header>

      <div className="flex w-full">
        <Side_Seller_Dashboard />

        {/* Main content */}
        <main className="flex-1 p-4 mt-20 ml-60">
          <div className="bg-gray-800 w-275 rounded-xl flex">
            <Graph />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Seller_Dashboard;