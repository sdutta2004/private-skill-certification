// src/lib/deployment.ts
// Real-time deployment coordinator for Private Skill Certification on Midnight Network.

import { publishPublicReceipt } from './api';
import {
  announcePublicReceipt,
  receiptFromFinalizedDeployment,
  type FinalizedDeploymentPublicData,
  type PublicReceipt,
} from './receipt';
import type { Network, WalletSession } from './wallet';

export type DeploymentAdapter = (input: {
  wallet: WalletSession;
  network: Network;
  skillId?: string;
  threshold?: number;
}) => Promise<FinalizedDeploymentPublicData>;

let deploymentAdapter: DeploymentAdapter | undefined;

/** Tests or alternate runtimes can replace the built-in Midnight deployment implementation. */
export function registerDeploymentAdapter(adapter: DeploymentAdapter): void {
  deploymentAdapter = adapter;
}

export async function deployPSCContract(input: {
  wallet: WalletSession;
  network: Network;
  skillId?: string;
  threshold?: number;
}): Promise<{ receipt: PublicReceipt; registered: boolean }> {
  const status = await input.wallet.getConnectionStatus();
  if (status.status !== 'connected' || status.networkId !== input.network) {
    throw new Error(`1AM is no longer connected to ${input.network}. Reconnect before deploying.`);
  }

  await input.wallet.hintUsage([
    'getShieldedAddresses',
    'getProvingProvider',
    'balanceUnsealedTransaction',
    'submitTransaction',
  ]);

  const adapter =
    deploymentAdapter ??
    (await import(/* webpackIgnore: true */ './midnightDeployment')).deployWithMidnight;
  const finalized = await adapter(input);
  const receipt = receiptFromFinalizedDeployment(finalized, input.network);
  announcePublicReceipt(receipt);

  try {
    await publishPublicReceipt(receipt);
    return { receipt, registered: true };
  } catch {
    // The on-chain receipt remains useful even if the optional public registry is unavailable.
    return { receipt, registered: false };
  }
}