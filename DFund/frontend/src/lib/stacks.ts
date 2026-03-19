import { STACKS_TESTNET } from '@stacks/network';
import { AppConfig, UserSession } from '@stacks/connect';

export const appConfig = new AppConfig(['store_write', 'publish_data']);
export const userSession = new UserSession({ appConfig });
export const network = STACKS_TESTNET;

export const contractAddress = 'ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM'; // Local dev address or testnet address
export const contractName = 'DFund';
