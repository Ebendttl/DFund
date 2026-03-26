'use client';

import { useEffect, useState } from 'react';
import { getCampaignById, Campaign } from '@/lib/api';
import { calculateCreatorScore, getReputationBadge, calculateCampaignRisk } from '@/lib/reputation';
import { useStore } from '@/store/useStore';
import { withdrawFunds, claimRefund } from '@/lib/transactions';
import ContributeModal from '@/components/ContributeModal';
import CreatorProfileModal from '@/components/CreatorProfileModal';
import TrustBadge from '@/components/TrustBadge';
import RiskIndicator from '@/components/RiskIndicator';
import { Clock, Target, Users, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useCreatorStats } from '@/hooks/useCreatorStats';

export default function CampaignDetailsPage({ params }: { params: { id: string } }) {
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const { userData, isSignedIn } = useStore();

  // Mock current block height and user contribution status for demo purposes
  const currentBlockHeight = 145000;
  const hasContributed = true;

  useEffect(() => {
    async function fetchData() {
      const data = await getCampaignById(parseInt(params.id));
      if (data) {
        setCampaign(data);
      }
      setLoading(false);
    }
    fetchData();
  }, [params.id]);

  const { data: creatorStats } = useCreatorStats(campaign?.creator || '');

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
  const canWithdraw = isSuccessful && isExpired && isCreator && campaign.isActive;
  const canRefund = !isSuccessful && isExpired && hasContributed && campaign.isActive;

  // Reputation Logic
  const score = calculateCreatorScore(creatorStats);
  const { badge, colorClass: badgeColor, textClass: badgeText } = getReputationBadge(score);
  const { risk, colorClass: riskColor } = calculateCampaignRisk(
    score,
    campaign.currentAmount,
    campaign.goalAmount,
    campaign.startedAt,
    campaign.deadline,
    currentBlockHeight
  );

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
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="brutal-card bg-white mb-8">
        <h1 className="text-4xl font-black uppercase mb-4">{campaign.title}</h1>
        <p className="text-gray-600 font-medium mb-6">{campaign.description}</p>
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 brutal-badge bg-yellow-400">
             <Target className="w-4 h-4" />
             <span>Goal: {campaign.goalAmount} STX</span>
          </div>
          <div className="flex items-center gap-2 brutal-badge bg-blue-400">
             <Users className="w-4 h-4" />
             <span>{campaign.creator.substring(0, 8)}...</span>
          </div>
        </div>
        <div className="flex gap-4 mb-6">
           <TrustBadge badge={badge} score={score} colorClass={badgeColor} textClass={badgeText} />
           <RiskIndicator riskLevel={risk} colorClass={riskColor} />
        </div>
        <div className="flex gap-4">
           {canContribute && (
             <button onClick={() => setIsModalOpen(true)} className="brutal-btn brutal-btn-primary flex-1">
               Contribute
             </button>
           )}
           {canWithdraw && (
             <button onClick={handleWithdraw} className="brutal-btn brutal-btn-primary flex-1 bg-green-500">
               Withdraw Funds
             </button>
           )}
           {canRefund && (
             <button onClick={handleRefund} className="brutal-btn flex-1 bg-red-500">
               Claim Refund
             </button>
           )}
           <button onClick={() => setIsProfileModalOpen(true)} className="brutal-btn flex-1">
             Creator Profile
             </button>
        </div>
      </div>
      <ContributeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} campaignId={campaign.id} isHighRisk={risk === 'High Risk'} />
      <CreatorProfileModal isOpen={isProfileModalOpen} onClose={() => setIsProfileModalOpen(false)} stats={creatorStats || null} />
    </div>
  );
}
