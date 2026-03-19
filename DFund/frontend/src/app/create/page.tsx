'use client';

import { useState } from 'react';
import { createCampaign } from '@/lib/transactions';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Wallet, Calendar, Target, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function CreateCampaignPage() {
  const { isSignedIn } = useStore();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    goalAmount: '',
    deadline: '',
    imageUrl: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error('Please connect your wallet first');
      return;
    }

    setLoading(true);
    try {
      // For the blockchain call, we only need goal and deadline
      // Title, description and image would normally go to an off-chain indexer/storage
      const goal = parseInt(formData.goalAmount);
      const deadline = parseInt(formData.deadline);
      
      await createCampaign(goal, deadline);
      
      toast.success('Campaign creation initiated!');
      // In a real app, we'd wait for tx confirmation or use an off-chain service
    } catch (error) {
      console.error(error);
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter md:text-6xl">
            Launch Your <span className="text-yellow-500">Campaign</span>
          </h1>
          <p className="mt-4 font-bold text-gray-500">
            Share your vision with the world and raise funds on Bitcoin.
          </p>
        </div>

        {!isSignedIn ? (
          <div className="brutal-card flex flex-col items-center border-red-500 bg-red-50 text-center">
            <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
            <h2 className="mb-2 text-2xl font-black uppercase">Wallet Not Connected</h2>
            <p className="mb-6 font-bold text-gray-600">
              You need to connect your Stacks wallet to create a campaign.
            </p>
            <button className="brutal-btn brutal-btn-primary px-8">Connect Wallet</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="brutal-card space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-black uppercase">Project Title</label>
              <input 
                required
                type="text"
                placeholder="Bring your idea to life"
                className="w-full rounded-xl border-4 border-black p-4 font-bold focus:outline-none"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black uppercase">Description</label>
              <textarea 
                required
                rows={4}
                placeholder="What are you building?"
                className="w-full rounded-xl border-4 border-black p-4 font-bold focus:outline-none"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-black uppercase flex items-center gap-2">
                  <Target className="h-4 w-4" /> Goal Amount (STX)
                </label>
                <input 
                  required
                  type="number"
                  placeholder="5000"
                  className="w-full rounded-xl border-4 border-black p-4 font-bold focus:outline-none"
                  value={formData.goalAmount}
                  onChange={(e) => setFormData({...formData, goalAmount: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-black uppercase flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Deadline (Block Height)
                </label>
                <input 
                  required
                  type="number"
                  placeholder="150000"
                  className="w-full rounded-xl border-4 border-black p-4 font-bold focus:outline-none"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-black uppercase">Banner Image URL</label>
              <input 
                required
                type="url"
                placeholder="https://example.com/banner.jpg"
                className="w-full rounded-xl border-4 border-black p-4 font-bold focus:outline-none"
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})}
              />
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="brutal-btn brutal-btn-primary w-full py-6 text-2xl"
            >
              {loading ? 'Processing...' : 'Create Campaign'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
