import { 
  openContractCall, 
  finished, 
  showConnect 
} from '@stacks/connect';
import { 
  AnchorMode, 
  PostConditionMode, 
  uintCV,
  stringUtf8CV,
  principalCV
} from '@stacks/transactions';
import { 
  network, 
  contractAddress, 
  contractName, 
  userSession 
} from './stacks';
import toast from 'react-hot-toast';

export const createCampaign = async (goalAmount: number, deadline: number) => {
  const options = {
    contractAddress,
    contractName,
    functionName: 'create-campaign',
    functionArgs: [
      uintCV(goalAmount),
      uintCV(deadline)
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

export const withdrawFunds = async (campaignId: number) => {
  const options = {
    contractAddress,
    contractName,
    functionName: 'withdraw-funds',
    functionArgs: [
      uintCV(campaignId)
    ],
    network,
    onFinish: (data: any) => {
      toast.success('Withdrawal broadcasted!');
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
