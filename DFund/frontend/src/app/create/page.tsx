'use client';

import { useState } from 'react';
import { createCampaign } from '@/lib/transactions';
import { useStore } from '@/store/useStore';
import { useRouter } from 'next/navigation';
import { Wallet, Calendar, Target, AlertCircle, Plus, Trash2 } from 'lucide-react';
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

  const [milestones, setMilestones] = useState([{ description: '', amount: '' }]);

  const handleAddMilestone = () => {
    if (milestones.length >= 10) {
      toast.error('Maximum 10 milestones allowed');
      return;
    }
    setMilestones([...milestones, { description: '', amount: '' }]);
  };

  const handleRemoveMilestone = (index: number) => {
    if (milestones.length <= 1) {
      toast.error('At least 1 milestone is required');
      return;
    }
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index: number, field: 'description' | 'amount', value: string) => {
    const newMilestones = [...milestones];
    newMilestones[index][field] = value;
    setMilestones(newMilestones);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSignedIn) {
      toast.error('Please connect your wallet first');
      return;
    }

    const goal = parseInt(formData.goalAmount);
    if (isNaN(goal) || goal <= 0) {
      toast.error('Please enter a valid goal amount');
      return;
    }

    const parsedMilestones = milestones.map(m => ({
      description: m.description,
      amount: parseInt(m.amount)
    }));

    const isValidMilestones = parsedMilestones.every(m => !isNaN(m.amount) && m.amount > 0 && m.description.length > 0);
    if (!isValidMilestones) {
      toast.error('Please fill all milestone descriptions and amounts validly');
      return;
    }

    const totalMilestones = parsedMilestones.reduce((sum, m) => sum + m.amount, 0);
    if (totalMilestones !== goal) {
      toast.error(`The sum of milestones (${totalMilestones} STX) must equal the total goal (${goal} STX).`);
      return;
    }

    setLoading(true);
    try {
      const deadline = parseInt(formData.deadline);
      await createCampaign(goal, deadline, parsedMilestones);
      
      toast.success('Campaign creation initiated!');
      // Assuming successful broadcast or we route back to listing
      setTimeout(() => router.push('/'), 2000);
    } catch (error) {
      console.error(error);
      toast.error('Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 md:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-black uppercase tracking-tighter md:text-6xl">
            Launch Your <span className="text-yellow-500">Campaign</span>
          </h1>
          <p className="mt-4 font-bold text-gray-500">
            Define milestones and secure your funding via standard escrow logic.
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
            <div className="bg-white p-6 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
               <h3 className="text-2xl font-black uppercase mb-4 border-b-4 border-black pb-2">Campaign Basics</h3>
               <div className="space-y-4">
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
                     rows={3}
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
               </div>
            </div>

            <div className="bg-gray-100 p-6 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
               <div className="flex justify-between items-center mb-4 border-b-4 border-black pb-2">
                  <h3 className="text-2xl font-black uppercase">Funding Milestones</h3>
                  <button 
                    type="button" 
                    onClick={handleAddMilestone}
                    className="flex items-center gap-1 font-bold text-sm bg-black text-white px-3 py-1 rounded hover:bg-yellow-500 hover:text-black transition-colors"
                  >
                     <Plus className="w-4 h-4" /> Add
                  </button>
               </div>
               <p className="text-xs font-bold text-gray-500 mb-4 uppercase">Funds will be released incrementally based on community approval of each milestone.</p>
               
               <div className="space-y-4">
                  {milestones.map((m, index) => (
                    <div key={index} className="flex flex-col md:flex-row gap-4 items-start md:items-center bg-white p-4 border-2 border-dashed border-black rounded-xl">
                      <div className="flex-1 w-full space-y-1">
                         <label className="text-xs font-black uppercase">Milestone {index + 1} Description</label>
                         <input 
                           required
                           type="text"
                           placeholder="e.g. Design Phase"
                           className="w-full rounded border-2 border-black p-2 font-bold focus:outline-none"
                           value={m.description}
                           onChange={(e) => handleMilestoneChange(index, 'description', e.target.value)}
                         />
                      </div>
                      <div className="w-full md:w-48 space-y-1">
                         <label className="text-xs font-black uppercase">Amount (STX)</label>
                         <input 
                           required
                           type="number"
                           placeholder="1000"
                           className="w-full rounded border-2 border-black p-2 font-bold focus:outline-none"
                           value={m.amount}
                           onChange={(e) => handleMilestoneChange(index, 'amount', e.target.value)}
                         />
                      </div>
                      <button 
                        type="button"
                        onClick={() => handleRemoveMilestone(index)}
                        className="mt-5 text-red-500 hover:text-red-700 p-2 border-2 border-transparent hover:border-red-500 rounded transition-colors"
                      >
                         <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
               </div>
               <div className="mt-4 text-right">
                 <span className="font-black uppercase text-sm">
                   Total Milestones: {milestones.reduce((s, m) => s + (parseInt(m.amount) || 0), 0)} / {formData.goalAmount || 0} STX
                 </span>
               </div>
            </div>

            <button 
              disabled={loading}
              type="submit" 
              className="brutal-btn brutal-btn-primary w-full py-6 text-2xl"
            >
              {loading ? 'Processing...' : 'Deploy Campaign Elements'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
