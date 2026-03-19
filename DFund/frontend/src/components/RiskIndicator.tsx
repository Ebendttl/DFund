import { AlertTriangle, Info, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { RiskLevel } from '@/lib/reputation';

interface RiskIndicatorProps {
  riskLevel: RiskLevel;
  colorClass: string;
  className?: string;
}

export default function RiskIndicator({ riskLevel, colorClass, className }: RiskIndicatorProps) {
  let Icon = Info;
  if (riskLevel === 'Low Risk') Icon = CheckCircle2;
  if (riskLevel === 'High Risk') Icon = AlertTriangle;

  return (
    <div 
      className={cn(
        "group relative flex items-center gap-2 rounded-xl border-4 border-black px-4 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]",
        colorClass,
        className
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="text-sm">{riskLevel} Warning</span>
      
      {/* Tooltip */}
      <div className="pointer-events-none absolute -top-14 left-1/2 z-10 w-48 -translate-x-1/2 rounded-xl border-4 border-black bg-white p-2 text-center text-xs font-bold text-black opacity-0 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-opacity group-hover:opacity-100">
        Based on creator history, funding velocity, and timeframe.
      </div>
    </div>
  );
}
