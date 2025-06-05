/* eslint-disable react-hooks/rules-of-hooks */
import { test as base, expect } from '@playwright/test';
import { BrowserContext } from 'playwright-core';
import dappwright, { bootstrap, Dappwright, getWallet, MetaMaskWallet, OfficialOptions } from '@tenkeylabs/dappwright';
import { cyber, hardhat, sepolia } from 'viem/chains';
import { metaMask } from 'wagmi/connectors'
import { launchMetamask } from '@/tests/metamaskSetup';

export const testWithWallet = base.extend<{ wallet: Dappwright }, { walletContext: BrowserContext }>({
  walletContext: [
    async ({ }, use, info) => {
      // Launch context with extension
      const [wallet, context] = await launchMetamask();

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
// testWithWallet.afterEach(async ({ wallet, page }) => {

//   // Reset wallet state after each test
//   const walletMenuButton = page.getByTestId('wallet-menu-button');
//   if (await walletMenuButton.isVisible()) {
//     await walletMenuButton.click();
//     await page.getByTestId('disconnect-wallet-button').click();
//   }
//   // await page.close();
// });

testWithWallet("should create NFT and transfer successfully", async ({ wallet, page }) => {
  await page.goto("http://localhost:3000");

  // indicates user is connected to the wallet
  const walletMenuButton = page.getByTestId('wallet-menu-button');

  if (await walletMenuButton.isHidden()) {
    await page.getByTestId('connect-wallet-button').click();

    const CONNECTOR_NAME = 'connector-io.metamask';
    await page.getByTestId(CONNECTOR_NAME).click();

    await wallet.approve();
  } else {
    await page.getByTestId('launch-dashboard-button').click();
  }
  await page.waitForURL('**/dashboard/tokens');

  // NFT creation
  await page.getByTestId('mint-nft-button').click();
  await page.waitForURL('**/nft/create');
  await page.getByTestId('image-input').fill('https://picsum.photos/536/354');
  await page.getByTestId('name-input').fill('Name');
  await page.getByTestId('description-input').fill('Description');
  await page.getByTestId('nft-submit-button').click();

  await wallet.confirmTransaction();

  await page.waitForURL("**/dashboard/nfts");

  // test with transfer
  await page.getByTestId('send-button').click();

  await page.waitForURL('**/transfer');

  await page.getByTestId('to-address-input').fill('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'); // Example address
  await page.getByTestId('value-input').fill('0.00001');
  await page.getByTestId('send-button').click();

  await wallet.confirmTransaction();

  const toAddressInput = page.getByTestId('to-address-input');
  await expect(toAddressInput).toHaveValue('');

  // const connectStatus = page.getByTestId("connect-status");
  // expect(connectStatus).toHaveValue("connected");


  // await page.click("#switch-network-button");
  // const networkStatus = page.getByTestId("network-status");
  // expect(networkStatus).toHaveValue("31337");
});
