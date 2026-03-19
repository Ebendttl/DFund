import Link from 'next/link';
import { Campaign } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Wallet, Clock, Target, TrendingUp } from 'lucide-react';

interface CampaignCardProps {
  campaign: Campaign;
  currentBlockHeight: number;
}

export default function CampaignCard({ campaign, currentBlockHeight }: CampaignCardProps) {
  const progress = (campaign.currentAmount / campaign.goalAmount) * 100;
  const isSuccessful = campaign.currentAmount >= campaign.goalAmount;
  const isExpired = currentBlockHeight >= campaign.deadline;
  
  let status = 'Active';
  let statusColor = 'bg-yellow-400';
  
  if (isSuccessful && isExpired) {
    status = 'Successful';
    statusColor = 'bg-green-400';
  } else if (!isSuccessful && isExpired) {
    status = 'Failed';
    statusColor = 'bg-red-400';
  } else if (!campaign.isActive) {
    status = 'Closed';
    statusColor = 'bg-gray-400';
  }

  return (
    <div className="brutal-card group flex flex-col h-full bg-white transition-transform hover:-translate-x-1 hover:-translate-y-1">
      <div className="relative mb-6 h-48 w-full overflow-hidden rounded-xl border-4 border-black">
        <img 
          src={campaign.image} 
          alt={campaign.title} 
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className={cn("absolute left-4 top-4 rounded-full border-2 border-black px-4 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]", statusColor)}>
          {status}
        </div>
      </div>

      <div className="flex flex-col flex-grow">
        <h3 className="mb-2 text-xl font-black uppercase tracking-tight line-clamp-1">{campaign.title}</h3>
        <p className="mb-6 text-sm font-medium text-gray-500 line-clamp-2">
          {campaign.description}
        </p>

        <div className="mt-auto space-y-4">
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-black uppercase">
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Goal: {campaign.goalAmount} STX
              </span>
              <span>{Math.min(Math.round(progress), 100)}%</span>
            </div>
            <div className="h-4 w-full rounded-full border-4 border-black bg-gray-100 overflow-hidden p-[2px]">
              <div 
                className={cn("h-full rounded-full border-r-2 border-black transition-all duration-1000", progress >= 100 ? 'bg-green-400' : 'bg-yellow-400')}
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t-4 border-black pt-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Raised
              </span>
              <p className="font-black">{campaign.currentAmount} STX</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase text-gray-400 flex items-center gap-1">
                <Clock className="h-3 w-3" /> Deadline
              </span>
              <p className="font-black">{campaign.deadline} Blks</p>
            </div>
          </div>

          <Link 
            href={`/campaign/${campaign.id}`}
            className="brutal-btn brutal-btn-primary block w-full text-center text-sm"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
