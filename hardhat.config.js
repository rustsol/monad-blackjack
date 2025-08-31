import "@nomicfoundation/hardhat-ethers";

const config = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    monad: {
      type: "http",
      url: "https://monad-testnet.drpc.org",
      chainId: 41454,
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      type: "http",
      url: "http://127.0.0.1:8545",
    },
  },
  etherscan: {
    apiKey: {
      monad: "no-api-key-needed",
    },
    customChains: [
      {
        network: "monad",
        chainId: 41454,
        urls: {
          apiURL: "https://testnet.monadexplorer.com/api",
          browserURL: "https://testnet.monadexplorer.com",
        },
      },
    ],
  },
};

export default config;