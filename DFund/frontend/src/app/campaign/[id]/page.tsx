'use client';

import { useEffect, useState } from 'react';
import { getCampaignById, Campaign } from '@/lib/api';
import { calculateCreatorScore, getReputationBadge, calculateCampaignRisk } from '@/lib/reputation';
import { useStore } from '@/store/useStore';
import { claimRefund, voteMilestone, claimMilestone } from '@/lib/transactions';
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
  const isExpired = currentBlockHeight >= campaign.deadline;

  const address = userData?.profile?.stxAddress?.testnet || userData?.profile?.stxAddress?.mainnet;
  const isCreator = address === campaign.creator;

  // Dynamic Action Logic
  const canContribute = campaign.isActive && !isExpired;
  // WithdrawFunds is deprecated via DFund update. Creator claims individual milestones instead.
  const canRefund = isExpired && hasContributed && campaign.isActive;

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

  const handleRefund = async () => {
    try {
      if (confirm('Are you sure you want to claim your refund? This returns your remaining unspent share.')) {
        await claimRefund(campaign.id);
      }
    } catch (e) {
      toast.error('Refund failed');
    }
  };

  const handleVote = async (milestoneId: number, approve: boolean) => {
    try {
      if (confirm(`Are you sure you want to ${approve ? 'approve' : 'reject'} this milestone?`)) {
        await voteMilestone(campaign!.id, milestoneId, approve);
      }
    } catch (e) {
      toast.error('Vote failed');
    }
  };

  const handleClaimMilestone = async (milestoneId: number) => {
    try {
      if (confirm('Are you sure you want to claim this milestone?')) {
        await claimMilestone(campaign!.id, milestoneId);
      }
    } catch (e) {
      toast.error('Claim failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="brutal-card bg-white mb-8 border-4 border-black p-8 rounded-xl shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <h1 className="text-4xl font-black uppercase mb-4">{campaign.title}</h1>
        <p className="text-gray-600 font-medium mb-6 text-lg">{campaign.description}</p>
        <div className="flex flex-wrap gap-4 mb-8">
          <div className="flex items-center gap-2 border-2 border-black px-4 py-2 font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-yellow-400">
             <Target className="w-5 h-5" />
             <span>Goal: {campaign.goalAmount} STX</span>
          </div>
          <div className="flex items-center gap-2 border-2 border-black px-4 py-2 font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-blue-400 cursor-pointer" onClick={() => setIsProfileModalOpen(true)}>
             <Users className="w-5 h-5" />
             <span>Creator: {campaign.creator.substring(0, 8)}...</span>
          </div>
          <div className="flex items-center gap-2 border-2 border-black px-4 py-2 font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] bg-gray-200">
             <Clock className="w-5 h-5" />
             <span>Deadline: {campaign.deadline} Blk</span>
          </div>
        </div>
        
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm font-black uppercase mb-2">
            <span>Funding Progress: {Math.min(Math.round(progress), 100)}%</span>
            <span>Raised: {campaign.currentAmount} STX</span>
          </div>
          <div className="h-6 w-full border-4 border-black bg-gray-100 overflow-hidden">
            <div
              className={cn('h-full border-r-4 border-black transition-all duration-1000', progress >= 100 ? 'bg-green-400' : 'bg-yellow-400')}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 mb-8">
           <TrustBadge badge={badge} score={score} colorClass={badgeColor} textClass={badgeText} />
           <RiskIndicator riskLevel={risk} colorClass={riskColor} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {canContribute && (
             <button onClick={() => setIsModalOpen(true)} className="brutal-btn brutal-btn-primary w-full py-4 text-xl">
               Contribute Now
             </button>
           )}
           {canRefund && (
             <button onClick={handleRefund} className="brutal-btn w-full py-4 text-xl bg-red-400 hover:bg-red-500">
               Claim Refund (Withdraw Unspent)
             </button>
           )}
        </div>
      </div>

      {campaign.milestones && campaign.milestones.length > 0 && (
        <div className="brutal-card bg-gray-50 mb-8 border-t-8 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <h2 className="text-2xl font-black uppercase mb-6 flex items-center gap-2">
            <Target className="w-6 h-6 text-black" /> Project Milestones
          </h2>
          <p className="text-sm font-bold text-gray-500 mb-8">Funds are released incrementally based on community approval of each milestone.</p>
          
          <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-transparent before:via-black before:to-transparent">
            {campaign.milestones.map((m, idx) => {
               const isPending = !m.isApproved && !m.isClaimed;
               const threshold = campaign.goalAmount / 2;
               const approvalProgress = Math.min((m.approvedAmount / threshold) * 100, 100) || 0;
               const rejectionProgress = Math.min((m.rejectedAmount / threshold) * 100, 100) || 0;

               return (
                <div key={m.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                   <div className={cn("flex items-center justify-center w-10 h-10 rounded-full border-4 border-black shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-10", 
                      m.isClaimed ? "bg-gray-400" : m.isApproved ? "bg-green-400" : m.rejectedAmount >= threshold ? "bg-red-500" : "bg-blue-400")}>
                     {m.isClaimed ? <CheckCircle2 className="w-5 h-5 text-white" /> : m.rejectedAmount >= threshold ? <AlertTriangle className="w-5 h-5 text-white" /> : <Target className="w-5 h-5 text-white" />}
                   </div>
                   
                   <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] brutal-card bg-white p-4">
                      <div className="flex justify-between items-start mb-2">
                         <h3 className="font-black uppercase text-lg">{m.description}</h3>
                         <span className="font-black text-gray-500 uppercase px-2 py-1 border-2 border-black text-xs">{m.amount} STX</span>
                      </div>
                      
                      {!m.isClaimed && (
                        <div className="space-y-2 mb-4">
                          <div className="space-y-1">
                            <div className="flex justify-between text-[10px] font-black uppercase">
                               <span>Approval</span>
                               <span>{m.isApproved ? '100' : Math.round(approvalProgress)}%</span>
                            </div>
                            <div className="h-2 w-full border-2 border-black bg-white overflow-hidden">
                               <div className={cn("h-full transition-all", m.isApproved ? "bg-green-400" : "bg-blue-400")} style={{width: `${m.isApproved ? 100 : approvalProgress}%`}}></div>
                            </div>
                          </div>
                          
                          {m.rejectedAmount > 0 && (
                            <div className="space-y-1">
                              <div className="flex justify-between text-[10px] font-black uppercase text-red-500">
                                 <span>Rejection Threshold</span>
                                 <span>{Math.round(rejectionProgress)}%</span>
                              </div>
                              <div className="h-2 w-full border-2 border-black bg-white overflow-hidden">
                                 <div className="h-full bg-red-400 transition-all" style={{width: `${rejectionProgress}%`}}></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-2 mt-4">
                         {isCreator && m.isApproved && !m.isClaimed && campaign.isActive && (
                           <button onClick={() => handleClaimMilestone(m.id)} className="text-sm px-3 py-1 bg-green-400 font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                             Claim Funds
                           </button>
                         )}
                         {hasContributed && isPending && !isCreator && progress >= 100 && campaign.isActive && (
                           <>
                             <button onClick={() => handleVote(m.id, true)} className="text-sm px-3 py-1 bg-blue-400 font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                               Approve
                             </button>
                             <button onClick={() => handleVote(m.id, false)} className="text-sm px-3 py-1 bg-red-400 text-white font-bold border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                               Reject
                             </button>
                           </>
                         )}
                         {m.isClaimed && (
                           <span className="text-sm font-black uppercase text-gray-400">Funds Transferred</span>
                         )}
                         {m.isApproved && !m.isClaimed && !isCreator && (
                           <span className="text-sm font-black uppercase text-green-500">Milestone Approved</span>
                         )}
                         {m.rejectedAmount >= threshold && (
                           <span className="text-sm font-black uppercase text-red-500">Milestone Rejected</span>
                         )}
                      </div>
                   </div>
                </div>
               )

            })}
          </div>
        </div>
      )}
      
      {campaign && (
        <ContributeModal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)} 
          campaignId={campaign.id} 
          isHighRisk={risk === 'High Risk'}
        />
      )}
      <CreatorProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
        stats={creatorStats || null} 
      />
    </div>
  );
}
