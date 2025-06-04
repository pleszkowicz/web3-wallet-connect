// tests/metamaskSetup.ts
import { BrowserContext } from 'playwright-core';
import { bootstrap, Dappwright, MetaMaskWallet } from '@tenkeylabs/dappwright';

export async function launchMetamask(): Promise<[Dappwright, BrowserContext]> {
  const version = MetaMaskWallet.recommendedVersion;

  const downloadDir = "~/.cache/dappwright/metamask-12.16.0";

  const [wallet, , context] = await bootstrap("", {
    wallet: "metamask",
    version,
    downloadDir,
    seed: "test test test test test test test test test test test junk", // domyślny seed Hardhata
    headless: true,
  });

  return [wallet, context];
}
