'use client';

import { X, Activity, TrendingUp, CheckCircle, XCircle } from 'lucide-react';
import { CreatorStats, getReputationBadge, calculateCreatorScore } from '@/lib/reputation';
import TrustBadge from './TrustBadge';

interface CreatorProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: CreatorStats | null;
}

export default function CreatorProfileModal({ isOpen, onClose, stats }: CreatorProfileModalProps) {
  if (!isOpen || !stats) return null;

  const score = calculateCreatorScore(stats);
  const { badge, colorClass, textClass } = getReputationBadge(score);
  const shortenedAddress = `${stats.address.slice(0, 6)}...${stats.address.slice(-6)}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="animate-in fade-in zoom-in w-full max-w-lg relative duration-200">
        <div className="brutal-card overflow-hidden p-0">
          <div className="border-b-4 border-black bg-yellow-100 p-6">
            <button 
              onClick={onClose}
              className="absolute right-6 top-6 rounded-full border-2 border-black bg-white p-1 transition-colors hover:bg-red-400"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="mb-2 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border-4 border-black bg-blue-200 text-2xl shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                👤
              </div>
              <div>
                <h2 className="text-2xl font-black uppercase leading-none">Creator Profile</h2>
                <p className="mt-1 font-mono text-sm font-bold text-gray-600">{shortenedAddress}</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="mb-8 flex items-center justify-between border-b-4 border-black pb-6">
              <div>
                <p className="mb-1 text-sm font-black uppercase text-gray-500">Reputation Score</p>
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black leading-none">{score}</span>
                  <span className="text-lg font-bold text-gray-400">/100</span>
                </div>
              </div>
              <TrustBadge 
                badge={badge} 
                colorClass={colorClass} 
                textClass={textClass} 
                score={score} 
                className="scale-125 hover:-translate-y-0" // Disable hover lift here
              />
            </div>

            <h3 className="mb-4 text-sm font-black uppercase text-gray-400">Historical Performance</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1 rounded-xl border-4 border-black bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-500">
                  <Activity className="h-4 w-4" /> Total Campaigns
                </div>
                <div className="text-2xl font-black">{stats.totalCampaignsDeployed}</div>
              </div>
              
              <div className="space-y-1 rounded-xl border-4 border-black bg-gray-50 p-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-gray-500">
                  <TrendingUp className="h-4 w-4" /> STX Raised
                </div>
                <div className="text-2xl font-black">{stats.totalStxRaised}</div>
              </div>
              
              <div className="space-y-1 rounded-xl border-4 border-black bg-green-50 p-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-green-700">
                  <CheckCircle className="h-4 w-4" /> Successful
                </div>
                <div className="text-2xl font-black text-green-700">{stats.successfulCampaigns}</div>
              </div>
              
              <div className="space-y-1 rounded-xl border-4 border-black bg-red-50 p-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-red-700">
                  <XCircle className="h-4 w-4" /> Failed
                </div>
                <div className="text-2xl font-black text-red-700">{stats.failedCampaigns}</div>
              </div>
            </div>
            
            <p className="mt-6 text-center text-xs font-bold text-gray-400">
              *Scores and stats are simulated based on historical mock data
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
