'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useChallengeStore } from '@/stores/challenge';

const NavBar: React.FunctionComponent = () => {
  const { challenges, selected, select } = useChallengeStore();
  const pathname = usePathname() || '';
  const isActive = (route: string): string => pathname.includes(route) ? 'text-[#FFF75D]' : 'text-[#F1E9D9]';

  const handleSelect = (event: React.FormEvent<HTMLSelectElement>) => {
    select(parseInt(event.currentTarget.value));
  }

  return (
    <div className="w-full h-[64px]">
      <div className="fixed w-full h-[64px] px-10 flex flex-row items-center bg-[#171717] z-[9000]">
        <div className="flex flex-row items-end flex-auto basis-1/4">
          <div className="flex-none">
            <Link href="/">
              <img className="h-full w-auto mx-2" src="/logo.svg" />
            </Link>
          </div>
          {pathname !== '/' && (
            <span className="font-inter-regular text-md text-[#606060] ml-[-16px] pointer-events-none">
              By TxPipe
            </span>
          )}
        </div>
        <div className="flex flex-row items-center flex-initial">
          <Link href="/how-to-play">
            <button className={`font-monocraft-regular py-2 px-4 rounded-full text-md mx-4 ${isActive('how-to-play')}`}>
              How to play
            </button>
          </Link>
          <span className="border-l border-l-solid border-l-[#F1E9D9] w-0 h-7 opacity-50" />
          <Link href="/map">
            <button className={`font-monocraft-regular py-2 px-4 rounded-full text-md mx-4 ${isActive('map')}`}>
              Game Map
            </button>
          </Link>
          <span className="border-l border-l-solid border-l-[#F1E9D9] w-0 h-7 opacity-50" />
          <Link href="/leaderboard">
            <button className={`font-monocraft-regular py-2 px-4 rounded-full text-md mx-4 ${isActive('leaderboard')}`}>
              Leaderboard
            </button>
          </Link>
        </div>
        <div className="flex flex-row justify-end flex-auto basis-1/4">
  
        </div>
      </div>
    </div>
  );
}

export default NavBar;