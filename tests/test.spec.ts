import { test as base, expect } from '@playwright/test';
import { BrowserContext } from 'playwright-core';
import dappwright, { bootstrap, Dappwright, getWallet, MetaMaskWallet, OfficialOptions } from '@tenkeylabs/dappwright';
import { hardhat } from 'viem/chains';
import { metaMask } from 'wagmi/connectors'

export const testWithWallet = base.extend<{ wallet: Dappwright }, { walletContext: BrowserContext }>({
  walletContext: [
    async ({ }, use, info) => {
      // Launch context with extension
      const [wallet, _, context] = await dappwright.bootstrap("", {
        wallet: "metamask",
        version: MetaMaskWallet.recommendedVersion,
        seed: "test test test test test test test test test test test junk", // Hardhat's default https://hardhat.org/hardhat-network/docs/reference#accounts
        headless: true,
      });

      await wallet.addNetwork({
        chainId: 31337,
        networkName: "Hardhat Local",
        rpc: 'http://localhost:8545',
        symbol: "ETH",
      });

      await use(context);
      await context.close();
    },
    { scope: 'worker' },
  ],
  context: async ({ walletContext }, use) => {
    await use(walletContext);
  },
  wallet: async ({ walletContext }, use, info) => {
    const projectMetadata = info.project.metadata;
    const wallet = await getWallet(projectMetadata.wallet, walletContext);
    await use(wallet);
  },
});

// testWithWallet.beforeEach(async ({ page }) => {
//   await page.goto("http://localhost:3000");
// });

testWithWallet("should be able to connect", async ({ wallet, page }) => {
  await page.goto("http://localhost:3000");
  await page.getByTestId('connect-wallet-button').click();

  await page.pause()

  const CONNECTOR_NAME = 'connector-io.metamask';
  await page.getByTestId(CONNECTOR_NAME).click();

  // await wallet.sign()
  await wallet.approve();
  await page.waitForURL('**/dashboard/tokens');

  const connectStatus = page.getByTestId("connect-status");
  expect(connectStatus).toHaveValue("connected");


  // await page.click("#switch-network-button");
  // const networkStatus = page.getByTestId("network-status");
  // expect(networkStatus).toHaveValue("31337");
});
