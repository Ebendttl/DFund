const fs = require('fs');

const content = \'use client';

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
      <div className=\" container mx-auto flex h-[60vh] items-center justify-center\>
