import { 
  openContractCall, 
  showConnect 
} from '@stacks/connect';
import { 
  AnchorMode, 
  PostConditionMode, 
  uintCV,
  stringAsciiCV,
  listCV,
  tupleCV,
  boolCV,
  principalCV
} from '@stacks/transactions';
import { 
  network, 
  contractAddress, 
  contractName, 
  userSession 
} from './stacks';
import toast from 'react-hot-toast';

export const createCampaign = async (goalAmount: number, deadline: number, milestones: { amount: number, description: string }[]) => {
  const milestoneList = listCV(milestones.map(m => tupleCV({
    amount: uintCV(m.amount),
    description: stringAsciiCV(m.description)
  })));

  const options = {
    contractAddress,
    contractName,
    functionName: 'create-campaign',
    functionArgs: [
      uintCV(goalAmount),
      uintCV(deadline),
      milestoneList
    ],
    network,
    appDetails: {
      name: 'CrowdStack',
      icon: '/logo.png',
    },
    onFinish: (data: any) => {
      console.log('Transaction broadcasted:', data.txId);
      toast.success('Transaction broadcasted! ID: ' + data.txId);
    },
    onCancel: () => {
      toast.error('Transaction canceled');
    },
  };

  await openContractCall(options);
};

export const contribute = async (campaignId: number, amount: number) => {
  const options = {
    contractAddress,
    contractName,
    functionName: 'contribute',
    functionArgs: [
      uintCV(campaignId),
      uintCV(amount)
    ],
    network,
    appDetails: {
      name: 'CrowdStack',
      icon: '/logo.png',
    },
    onFinish: (data: any) => {
      toast.success('Contribution broadcasted!');
    },
  };

  await openContractCall(options);
};

export const voteMilestone = async (campaignId: number, milestoneId: number, approve: boolean) => {
  const options = {
    contractAddress,
    contractName,
    functionName: 'vote-milestone',
    functionArgs: [
      uintCV(campaignId),
      uintCV(milestoneId),
      boolCV(approve)
    ],
    network,
    onFinish: (data: any) => {
      toast.success('Vote broadcasted!');
    },
  };

  await openContractCall(options);
};

export const claimMilestone = async (campaignId: number, milestoneId: number) => {
  const options = {
    contractAddress,
    contractName,
    functionName: 'claim-milestone',
    functionArgs: [
      uintCV(campaignId),
      uintCV(milestoneId)
    ],
    network,
    onFinish: (data: any) => {
      toast.success('Milestone claim broadcasted!');
    },
  };

  await openContractCall(options);
};

export const claimRefund = async (campaignId: number) => {
  const options = {
    contractAddress,
    contractName,
    functionName: 'refund',
    functionArgs: [
      uintCV(campaignId)
    ],
    network,
    onFinish: (data: any) => {
      toast.success('Refund request broadcasted!');
    },
  };

  await openContractCall(options);
};
