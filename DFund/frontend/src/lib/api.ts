export interface Campaign {
  id: number;
  creator: string;
  goalAmount: number;
  currentAmount: number;
  deadline: number;
  isActive: boolean;
  title: string;
  description: string;
  image: string;
}

export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 0,
    creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    goalAmount: 5000,
    currentAmount: 2500,
    deadline: 150000,
    isActive: true,
    title: 'Stacks Hackathon 2024',
    description: 'Fueling the next generation of Bitcoin builders with Stacks.',
    image: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?q=80&w=2832&auto=format&fit=crop',
  },
  {
    id: 1,
    creator: 'ST2REHHSSTX0KDA9K2EYW2XJ5A3S6EGTG0A8A9E6',
    goalAmount: 10000,
    currentAmount: 12000,
    deadline: 140000,
    isActive: true, // Should be successful if goal met and deadline passed
    title: 'Bitcoin Art Collective',
    description: 'Creating a decentralized art gallery on the Bitcoin network.',
    image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=2940&auto=format&fit=crop',
  },
  {
    id: 2,
    creator: 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM',
    goalAmount: 2000,
    currentAmount: 500,
    deadline: 130000,
    isActive: false,
    title: 'DeFi Education Initiative',
    description: 'Empowering local communities with blockchain knowledge.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2940&auto=format&fit=crop',
  },
];

export async function getCampaigns(): Promise<Campaign[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return MOCK_CAMPAIGNS;
}

export async function getCampaignById(id: number): Promise<Campaign | undefined> {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return MOCK_CAMPAIGNS.find((c) => c.id === id);
}
