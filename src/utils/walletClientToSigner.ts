import { ethers } from 'ethers';
import { WalletClient } from 'viem';

export function walletClientToSigner(walletClient: WalletClient) {
  const provider = new ethers.BrowserProvider(walletClient.transport as any);
  return provider.getSigner();
}