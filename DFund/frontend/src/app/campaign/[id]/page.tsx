'use client';

import { useEffect, useState } from 'react';
import { getCampaignById, Campaign } from '@/lib/api';
import { useStore } from '@/store/useStore';
import { withdrawFunds, claimRefund } from '@/lib/transactions';
import ContributeModal from '@/components/ContributeModal';
import { Clock, Target, Users, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function CampaignDetailsPage({ params }: { params: { id: string } }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { userData, isSignedIn } = useStore();
  
  // Mock current block height and user contribution status for demo purposes
  const currentBlockHeight = 145000;
  // Let's pretend the user has contributed to this specific campaign if they are connected
  const hasContributed = true; 

  useEffect(() => {
    async function fetchCampaign() {
      const data = await getCampaignById(parseInt(params.id));
      if (data) setCampaign(data);
      setLoading(false);
    }
    fetchCampaign();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto flex h-[60vh] items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-8 border-black border-t-yellow-400"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-6xl font-black uppercase text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-black uppercase">Campaign Not Found</h2>
      </div>
    );
  }

  const progress = (campaign.currentAmount / campaign.goalAmount) * 100;
  const isSuccessful = campaign.currentAmount >= campaign.goalAmount;
  const isExpired = currentBlockHeight >= campaign.deadline;
  
  const address = userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet;
  const isCreator = address === campaign.creator;

  // Dynamic Action Logic
  const canContribute = campaign.isActive && !isExpired;
  const canWithdraw = isSuccessful && isExpired && isCreator && campaign.isActive; // if isActive is false, it's already withdrawn
  const canRefund = !isSuccessful && isExpired && hasContributed && campaign.isActive;

  const handleWithdraw = async () => {
    try {
      if (confirm('Are you sure you want to withdraw the funds? This will close the campaign.')) {
        await withdrawFunds(campaign.id);
      }
    } catch (e) {
      toast.error('Withdrawal failed');
    }
  };

  const handleRefund = async () => {
    try {
      if (confirm('Are you sure you want to claim your refund?')) {
        await claimRefund(campaign.id);
      }
    } catch (e) {
      toast.error('Refund failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-8">
      {/* Campaign Header */}
      <div className="mb-12 rounded-3xl border-8 border-black bg-white overflow-hidden shadow-[16px_16px_0px_0px_rgba(0,0,0,1)]">
        <div className="h-64 w-full bg-gray-200 md:h-96">
          <img src={campaign.image} alt={campaign.title} className="h-full w-full object-cover" />
        </div>
        <div className="p-8 md:p-12">
          <div className="mb-4 flex flex-wrap gap-4">
            {isSuccessful && isExpired ? (
              <span className="inline-flex items-center gap-2 border-4 border-black bg-green-400 px-4 py-1 text-sm font-black uppercase">
                <CheckCircle2 className="h-4 w-4" /> Funded Successfully
              </span>
            ) : isExpired ? (
              <span className="inline-flex items-center gap-2 border-4 border-black bg-red-400 px-4 py-1 text-sm font-black uppercase">
                <AlertTriangle className="h-4 w-4" /> Funding Failed
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 border-4 border-black bg-yellow-400 px-4 py-1 text-sm font-black uppercase">
                Active Campaign
              </span>
            )}
            {!campaign.isActive && (
              <span className="inline-flex items-center gap-2 border-4 border-black bg-gray-400 text-white px-4 py-1 text-sm font-black uppercase">
                Closed
              </span>
            )}
          </div>
          
          <h1 className="mb-6 text-4xl font-black uppercase tracking-tighter md:text-6xl lg:text-7xl">
            {campaign.title}
          </h1>
          
          <div className="flex items-center gap-4 text-sm font-bold bg-gray-100 p-4 rounded-xl border-4 border-black inline-flex">
            <span className="text-gray-500 uppercase">Creator:</span>
            <span className="font-mono text-blue-600">{campaign.creator}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          <section className="brutal-card">
            <h2 className="mb-6 text-3xl font-black uppercase border-b-4 border-black pb-4">About the Project</h2>
            <p className="text-lg font-medium leading-relaxed text-gray-700 whitespace-pre-wrap">
              {campaign.description}
            </p>
          </section>

          <section className="brutal-card">
            <h2 className="mb-6 text-2xl font-black uppercase flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-green-500" />
              Smart Contract Security
            </h2>
            <div className="space-y-4 font-bold text-gray-600">
              <p>This project is governed by the DFund Clarity smart contract on the Stacks blockchain.</p>
              <ul className="list-inside list-disc space-y-2">
                <li>Funds are locked securely until the deadline.</li>
                <li>Creators can only withdraw if the goal is met.</li>
                <li>Backers can claim refunds if the goal is not met by the deadline.</li>
              </ul>
            </div>
          </section>
        </div>

        {/* Action Panel */}
        <div className="space-y-8">
          <div className="brutal-card sticky top-28 bg-yellow-50 border-yellow-400">
            <div className="mb-8 space-y-2">
              <div className="text-5xl font-black text-black">{campaign.currentAmount} <span className="text-2xl text-gray-500">STX</span></div>
              <div className="font-bold uppercase text-gray-500 flex justify-between">
                <span>Raised of {campaign.goalAmount} STX</span>
                <span>{Math.min(Math.round(progress), 100)}%</span>
              </div>
              <div className="h-6 w-full rounded-full border-4 border-black bg-white overflow-hidden p-[2px] mt-4">
                <div 
                  className={cn("h-full rounded-full border-r-2 border-black transition-all duration-1000", progress >= 100 ? 'bg-green-400' : 'bg-yellow-400')}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>

            <div className="mb-8 space-y-4 border-t-4 border-black pt-6">
              <div className="flex items-center gap-4">
                <div className="rounded-xl border-4 border-black bg-white p-3">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-black uppercase">Deadline</div>
                  <div className="font-bold text-gray-600">
                    {isExpired ? 'Ended' : `Block ${campaign.deadline}`}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="rounded-xl border-4 border-black bg-white p-3">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <div className="font-black uppercase">Backers</div>
                  <div className="font-bold text-gray-600">See contract state</div>
                </div>
              </div>
            </div>

            {/* Dynamic Actions */}
            <div className="space-y-4">
              {canContribute && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="brutal-btn brutal-btn-primary w-full py-5 text-xl"
                >
                  Back this Project
                </button>
              )}
              
              {canWithdraw && (
                <button 
                  onClick={handleWithdraw}
                  className="brutal-btn brutal-btn-success w-full py-5 text-xl text-white"
                >
                  Withdraw Funds
                </button>
              )}
              
              {canRefund && (
                <button 
                  onClick={handleRefund}
                  className="brutal-btn w-full bg-blue-400 hover:bg-blue-500 py-5 text-xl text-white"
                >
                  Claim Refund
                </button>
              )}

              {!canContribute && !canWithdraw && !canRefund && (
                <div className="rounded-xl border-4 border-black bg-gray-200 p-4 text-center font-bold uppercase">
                  No Actions Available
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ContributeModal 
        campaignId={campaign.id} 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
}
