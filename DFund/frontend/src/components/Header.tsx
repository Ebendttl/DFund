'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useStore } from '@/store/useStore';
import { showConnect, authenticate } from '@stacks/connect';
import { appConfig, userSession } from '@/lib/stacks';
import { Wallet, LogOut, Menu, X, PlusCircle, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function Header() {
  const { userData, setUserData, isSignedIn, setIsSignedIn, checkSession } = useStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  const onConnect = () => {
    showConnect({
      appDetails: {
        name: 'CrowdStack',
        icon: '/logo.png', // Fallback to a default icon
      },
      redirectTo: '/',
      onFinish: () => {
        const userData = userSession.loadUserData();
        setUserData(userData);
        setIsSignedIn(true);
        toast.success('Wallet connected!');
      },
      userSession,
    });
  };

  const onDisconnect = () => {
    userSession.signUserOut();
    setUserData(null);
    setIsSignedIn(false);
    toast.success('Wallet disconnected');
  };

  const address = userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet;
  const shortenedAddress = address ? `${address.slice(0, 4)}...${address.slice(-4)}` : '';

  return (
    <header className="sticky top-0 z-50 w-full border-b-4 border-black bg-white">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-2xl font-black uppercase tracking-tighter transition-transform hover:scale-105">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border-4 border-black bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <Compass className="h-6 w-6" />
          </div>
          <span>CrowdStack</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-bold uppercase transition-colors hover:text-yellow-600">
            Explore
          </Link>
          <Link href="/create" className="flex items-center gap-2 text-sm font-bold uppercase transition-colors hover:text-yellow-600">
            <PlusCircle className="h-4 w-4" />
            Create Campaign
          </Link>
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 rounded-xl border-4 border-black bg-green-400 px-4 py-2 font-mono text-sm font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <Wallet className="h-4 w-4" />
                {shortenedAddress}
              </div>
              <button
                onClick={onDisconnect}
                className="flex h-10 w-10 items-center justify-center rounded-xl border-4 border-black bg-red-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="flex items-center gap-2 rounded-xl border-4 border-black bg-yellow-400 px-6 py-3 text-sm font-black uppercase shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
            >
              <Wallet className="h-5 w-5" />
              Connect Wallet
            </button>
          )}
        </nav>

        {/* Mobile menu button */}
        <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X className="h-8 w-8" /> : <Menu className="h-8 w-8" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMenuOpen && (
        <div className="border-t-4 border-black bg-white p-4 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold uppercase">
              Explore
            </Link>
            <Link href="/create" onClick={() => setIsMenuOpen(false)} className="text-lg font-bold uppercase">
              Create Campaign
            </Link>
            {isSignedIn ? (
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 rounded-xl border-4 border-black bg-green-400 p-4 font-mono font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <Wallet className="h-5 w-5" />
                  {shortenedAddress}
                </div>
                <button
                  onClick={() => { onDisconnect(); setIsMenuOpen(false); }}
                  className="flex items-center justify-center gap-2 rounded-xl border-4 border-black bg-red-400 p-4 font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => { onConnect(); setIsMenuOpen(false); }}
                className="flex items-center justify-center gap-2 rounded-xl border-4 border-black bg-yellow-400 p-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                <Wallet className="h-5 w-5" />
                Connect Wallet
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
