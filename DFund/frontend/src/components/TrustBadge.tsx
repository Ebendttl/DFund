import { ShieldCheck, ShieldAlert, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ReputationBadge } from '@/lib/reputation';

interface TrustBadgeProps {
  badge: ReputationBadge;
  colorClass: string;
  textClass: string;
  score: number;
  className?: string;
  onClick?: () => void;
}

export default function TrustBadge({ badge, colorClass, textClass, score, className, onClick }: TrustBadgeProps) {
  let Icon = Shield;
  if (badge === 'Trusted Creator') Icon = ShieldCheck;
  if (badge === 'High Risk') Icon = ShieldAlert;

  return (
    <button 
      onClick={onClick}
      className={cn(
        "group relative flex items-center gap-1.5 rounded-full border-2 border-black px-3 py-1 font-mono text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        colorClass,
        textClass,
        onClick ? "cursor-pointer" : "cursor-default",
        className
      )}
    >
      <Icon className="h-4 w-4" />
      <span>{score}</span>
      
      {/* Tooltip */}
      <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg border-2 border-black bg-white px-3 py-1 text-xs font-bold text-black opacity-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-opacity group-hover:opacity-100">
        {badge} (Score: {score})
      </div>
    </button>
  );
}
