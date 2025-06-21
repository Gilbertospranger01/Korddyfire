'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Side_Seller_Dashboard from '@/components/sideSellerdashboard';
import { useRouter } from 'next/navigation';
import { FiArrowLeft } from 'react-icons/fi';
import Loadingpage from '../../loadingpages/loadingpage';


const Savings = () => {
  const { session } = useAuth();
  const router = useRouter();

  const user = useMemo(() => {
    if (!session?.user) return null;
    return {
      id: session.user.id,
      name: session.user.user_metadata?.name || 'User',
      picture: session.user.user_metadata?.avatar_url || null,
    };
  }, [session]);

  if (!session) {
    return (
      <Loadingpage />
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white overflow-hidden">
      {/* Header fixo no topo */}
      <header className="flex fixed w-full justify-between z-99 items-center p-4 bg-gray-800 shadow-md border-b border-gray-400">
        <div className="flex items-center">
          <button onClick={() => router.push('/home')} className='text-gray-400 hover:text-white transition cursor-pointer'>
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
          <h1>Savings</h1>
        </main>
      </div>
    </div>
  );
};

export default Savings;