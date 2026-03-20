'use client';

import { useState } from 'react';
import { X, Coins, AlertTriangle } from 'lucide-react';
import { contribute } from '@/lib/transactions';
import { useStore } from '@/store/useStore';
import toast from 'react-hot-toast';

interface ContributeModalProps {
  campaignId: number;
  isOpen: boolean;
  onClose: () => void;
  isHighRisk: boolean;
}

export default function ContributeModal({ campaignId, isOpen, onClose, isHighRisk }: ContributeModalProps) {
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmedRisk, setConfirmedRisk] = useState(!isHighRisk); // Automatically confirmed if not high risk
  const { isSignedIn } = useStore();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (isHighRisk && !confirmedRisk) {
      toast.error('Please acknowledge the risk warning before contributing');
      return;
    }

    const numAmount = parseInt(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error('Please enter a valid amount greater than 0');
      return;
    }

    setLoading(true);
    try {
      await contribute(campaignId, numAmount);
      onClose();
    } catch (error) {
      console.error(error);
      toast.error('Failed to initiate contribution');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md brutal-card relative animate-in fade-in zoom-in duration-200">
        <button 
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border-2 border-black bg-gray-200 p-1 hover:bg-red-400 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="mb-6 text-2xl font-black uppercase flex items-center gap-2">
          <Coins className="h-6 w-6 text-yellow-500" />
          Back this Project
        </h2>

        {isHighRisk && (
          <div className="mb-6 rounded-xl border-4 border-red-500 bg-red-50 p-4">
            <div className="flex items-center gap-2 mb-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-black uppercase">High Risk Warning</span>
            </div>
            <p className="text-sm font-bold text-red-800 mb-3">
              This campaign has been flagged as high risk based on the creator&apos;s history or funding metrics. Your contribution may be at risk.
            </p>
            <label className="flex items-start gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                className="mt-1 h-4 w-4 rounded-sm border-2 border-black accent-yellow-400"
                checked={confirmedRisk}
                onChange={(e) => setConfirmedRisk(e.target.checked)}
              />
              <span className="text-xs font-bold text-red-900 leading-tight">
                I understand the risks and wish to proceed with this contribution.
              </span>
            </label>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-black uppercase">Amount (STX)</label>
            <input 
              required
              type="number"
              min="1"
              placeholder="100"
              className="w-full rounded-xl border-4 border-black p-4 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-yellow-400/50"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-xs font-bold text-gray-500">
              Ensure you have enough STX to cover the transaction fee.
            </p>
          </div>

          <button 
            disabled={loading || (isHighRisk && !confirmedRisk)}
            type="submit" 
            className="brutal-btn brutal-btn-success w-full py-4 text-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : 'Contribute STX'}
          </button>
        </form>
      </div>
    </div>
  );
}
