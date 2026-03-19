'use client';

import { useEffect, useState } from 'react';
import { Campaign, getCampaigns } from '@/lib/api';
import CampaignCard from '@/components/CampaignCard';
import { Search, Rocket, Filter } from 'lucide-react';

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const currentBlockHeight = 145000; // Mock current block height

  useEffect(() => {
    async function fetchCampaigns() {
      const data = await getCampaigns();
      setCampaigns(data);
      setLoading(false);
    }
    fetchCampaigns();
  }, []);

  return (
    <div className="container mx-auto px-4 py-12 md:px-8">
      {/* Hero Section */}
      <section className="mb-20 flex flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border-4 border-black bg-yellow-200 px-6 py-2 text-sm font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
          <Rocket className="h-5 w-5 text-black" />
          The Future of Funding is on Bitcoin
        </div>
        <h1 className="mb-8 max-w-4xl text-5xl font-black uppercase leading-none tracking-tighter md:text-8xl">
          Empower Ideas <br />
          <span className="text-yellow-500">Decentralize</span> Results
        </h1>
        <p className="mb-10 max-w-xl text-lg font-bold text-gray-600 md:text-xl">
          Launch and support world-changing projects with the security of the Stacks blockchain. Transparent, immutable, and community-driven.
        </p>
        <div className="flex flex-col gap-6 sm:flex-row">
          <button className="brutal-btn brutal-btn-primary px-12 py-5 text-xl">
            Explore Campaigns
          </button>
          <button className="brutal-btn px-12 py-5 text-xl">
            Launch Your Idea
          </button>
        </div>
      </section>

      {/* Explorer Section */}
      <section id="explore">
        <div className="mb-12 flex flex-col items-end justify-between gap-6 border-b-8 border-black pb-8 md:flex-row">
          <div>
            <h2 className="text-4xl font-black uppercase italic tracking-tighter md:text-6xl">
              Active Campaigns
            </h2>
            <p className="font-bold text-gray-500">Supporting builders across the ecosystem</p>
          </div>
          
          <div className="flex w-full flex-col gap-4 md:w-auto md:flex-row">
            <div className="relative flex-grow md:w-80">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search campaigns..." 
                className="w-full rounded-xl border-4 border-black p-4 pl-12 font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-0"
              />
            </div>
            <button className="flex items-center justify-center gap-2 rounded-xl border-4 border-black bg-white px-6 py-4 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Filter className="h-5 w-5" />
              Filter
            </button>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="brutal-card h-[500px] animate-pulse bg-gray-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {campaigns.map((campaign) => (
              <CampaignCard 
                key={campaign.id} 
                campaign={campaign} 
                currentBlockHeight={currentBlockHeight}
              />
            ))}
          </div>
        )}
      </section>

      {/* Stats Section */}
      <section className="mt-24 rounded-3xl border-8 border-black bg-white p-12 shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
        <div className="grid grid-cols-1 gap-12 text-center md:grid-cols-3">
          <div className="space-y-2">
            <h4 className="text-6xl font-black text-yellow-500">120+</h4>
            <p className="text-xl font-black uppercase">Projects Funded</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-6xl font-black text-green-400">1.2M</h4>
            <p className="text-xl font-black uppercase">STX Contributed</p>
          </div>
          <div className="space-y-2">
            <h4 className="text-6xl font-black text-red-500">5k</h4>
            <p className="text-xl font-black uppercase">Global Supporters</p>
          </div>
        </div>
      </section>
    </div>
  );
}
