import { CreatorStats } from "./reputation";

export interface Campaign {
  id: number;
  creator: string;
  goalAmount: number;
  currentAmount: number;
  deadline: number;
  startedAt: number;
  isActive: boolean;
  title: string;
  description: string;
  image: string;
}

export const MOCK_CREATOR_STATS: Record<string, CreatorStats> = {
  'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM': {
    address: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    totalCampaignsDeployed: 5,
    successfulCampaigns: 4,
    failedCampaigns: 1,
    totalStxRaised: 65000,
  },
  'ST2REHHSSTX0KDA9K2EYW2XJ5A3S6EGTG0A8A9E6': {
    address: 'ST2REHHSSTX0KDA9K2EYW2XJ5A3S6EGTG0A8A9E6',
    totalCampaignsDeployed: 1,
    successfulCampaigns: 1,
    failedCampaigns: 0,
    totalStxRaised: 12000,
  },
  'ST3WRG2R9RJXZFY1DGX8MNSNYVE3VGZJSABCD123': {
    address: 'ST3WRG2R9RJXZFY1DGX8MNSNYVE3VGZJSABCD123',
    totalCampaignsDeployed: 6,
    successfulCampaigns: 1,
    failedCampaigns: 5,
    totalStxRaised: 3000,
  }
};

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 0,
    creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM', // Trusted Creator
    goalAmount: 5000,
    currentAmount: 2500,
    deadline: 150000,
    startedAt: 140000,
    isActive: true,
    title: 'Stacks Hackathon 2024',
    description: 'Fueling the next generation of Bitcoin builders with Stacks.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop',
  },
  {
    id: 1,
    creator: 'ST2REHHSSTX0KDA9K2EYW2XJ5A3S6EGTG0A8A9E6', // Emerging Creator
    goalAmount: 10000,
    currentAmount: 12000,
    deadline: 140000,
    startedAt: 135000,
    isActive: true, // Should be successful if goal met and deadline passed
    title: 'Bitcoin Art Collective',
    description: 'Creating a decentralized art gallery on the Bitcoin network.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2940&auto=format&fit=crop',
  },
  {
    id: 2,
    creator: 'ST3WRG2R9RJXZFY1DGX8MNSNYVE3VGZJSABCD123', // High Risk
    goalAmount: 15000,
    currentAmount: 50,
    deadline: 148000,
    startedAt: 140000,
    isActive: true,
    title: 'Arbitrage Bot Node',
    description: 'Funding a highly experimental high-frequency trading bot.',
    image: 'https://images.unsplash.com/photo-1621501103258-3e13fc20ae1a?q=80&w=2940&auto=format&fit=crop',
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

export async function getCreatorStats(address: string): Promise<CreatorStats | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 200));
  return MOCK_CREATOR_STATS[address];
}
