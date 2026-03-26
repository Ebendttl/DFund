import { CreatorStats } from "./reputation";
import { fetchCallReadOnlyFunction, principalCV, cvToJSON } from '@stacks/transactions';
import { contractAddress, contractName, network } from './stacks';

export interface Milestone {
  id: number;
  description: string;
  amount: number;
  isApproved: boolean;
  isClaimed: boolean;
  approvedAmount: number;
  rejectedAmount: number;
}

export interface Campaign {
  id: number;
  creator: string;
  goalAmount: number;
  currentAmount: number;
  claimedAmount: number;
  deadline: number;
  startedAt: number;
  isActive: boolean;
  title: string;
  description: string;
  image: string;
  milestones: Milestone[];
}

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 0,
    creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', 
    goalAmount: 5000,
    currentAmount: 2500,
    claimedAmount: 1000,
    deadline: 150000,
    startedAt: 140000,
    isActive: true,
    title: 'Stacks Hackathon 2024',
    description: 'Fueling the next generation of Bitcoin builders with Stacks.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop',
    milestones: [
      { id: 0, description: 'Initial Venue Booking', amount: 1000, isApproved: true, isClaimed: true, approvedAmount: 2500, rejectedAmount: 0 },
      { id: 1, description: 'Marketing & Outreach', amount: 1500, isApproved: true, isClaimed: false, approvedAmount: 2000, rejectedAmount: 100 },
      { id: 2, description: 'Prize Pool Funding', amount: 2500, isApproved: false, isClaimed: false, approvedAmount: 1000, rejectedAmount: 500 }
    ]
  },
  {
    id: 1,
    creator: 'ST2REHHSSTX0KDA9K2EYW2XJ5A3S6EGTG0A8A9E6', 
    goalAmount: 10000,
    currentAmount: 12000,
    claimedAmount: 8000,
    deadline: 140000,
    startedAt: 135000,
    isActive: true, 
    title: 'Bitcoin Art Collective',
    description: 'Creating a decentralized art gallery on the Bitcoin network.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2940&auto=format&fit=crop',
    milestones: [
      { id: 0, description: 'Website Development', amount: 3000, isApproved: true, isClaimed: true, approvedAmount: 10000, rejectedAmount: 0 },
      { id: 1, description: 'Artist Grants', amount: 5000, isApproved: true, isClaimed: true, approvedAmount: 8500, rejectedAmount: 200 },
      { id: 2, description: 'Virtual Gallery Launch', amount: 2000, isApproved: false, isClaimed: false, approvedAmount: 3000, rejectedAmount: 1500 }
    ]
  },
  {
    id: 2,
    creator: 'ST3WRG2R9RJXZFY1DGX8MNSNYVE3VGZJSABCD123', 
    goalAmount: 15000,
    currentAmount: 50,
    claimedAmount: 0,
    deadline: 148000,
    startedAt: 140000,
    isActive: true,
    title: 'Arbitrage Bot Node',
    description: 'Funding a highly experimental high-frequency trading bot.',   
    image: 'https://images.unsplash.com/photo-1621501103258-3e13fc20ae1a?q=80&w=2940&auto=format&fit=crop',
    milestones: [
      { id: 0, description: 'Server Setup', amount: 5000, isApproved: false, isClaimed: false, approvedAmount: 10, rejectedAmount: 0 },
      { id: 1, description: 'Initial Liquidity', amount: 10000, isApproved: false, isClaimed: false, approvedAmount: 0, rejectedAmount: 0 }
    ]
  },
];

export async function getCampaigns(): Promise<Campaign[]> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_CAMPAIGNS;
}

export async function getCampaignById(id: number): Promise<Campaign | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_CAMPAIGNS.find((c) => c.id === id);
}

export async function getCreatorStats(address: string): Promise<CreatorStats> {
  try {
    const result = await fetchCallReadOnlyFunction({
      contractAddress,
      contractName,
      functionName: 'get-creator-stats',
      functionArgs: [principalCV(address)],
      network,
      senderAddress: address, // just to satisfy the API
    });
    
    const json = cvToJSON(result);
    // The result is a tuple, so json.value contains the fields
    return {
      address,
      totalCampaignsDeployed: Number(json.value['total-campaigns'].value),
      successfulCampaigns: Number(json.value['successful-campaigns'].value),
      failedCampaigns: Number(json.value['failed-campaigns'].value),
      totalStxRaised: Number(json.value['total-raised'].value),
    };
  } catch (error) {
    console.error('Error fetching creator stats:', error);
    return {
      address,
      totalCampaignsDeployed: 0,
      successfulCampaigns: 0,
      failedCampaigns: 0,
      totalStxRaised: 0,
    };
  }
}
