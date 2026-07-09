import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config({ path: "../.env" });

const accounts = process.env.DEPLOYER_PRIVATE_KEY ? [process.env.DEPLOYER_PRIVATE_KEY] : [];

const config: HardhatUserConfig = {
  solidity: { version: "0.8.20", settings: { optimizer: { enabled: true, runs: 200 } } },
  networks: {
    hashkey: {
      url:     process.env.HASHKEY_RPC_URL ?? "https://mainnet.hsk.xyz",
      chainId: 177,
      accounts,
    },
    hashkeyTestnet: {
      url:     process.env.HASHKEY_TESTNET_RPC_URL ?? "https://testnet.hsk.xyz",
      chainId: 133,
      accounts,
    },
  },
};
export default config;
