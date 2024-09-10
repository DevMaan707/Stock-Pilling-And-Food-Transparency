require('@nomiclabs/hardhat-waffle');
require('@nomiclabs/hardhat-ethers');
require('@nomicfoundation/hardhat-toolbox');
require('dotenv').config(); 

module.exports = {
  solidity: "0.8.24",
  networks: {
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_PROJECT_ID}`, 
      accounts: [`0x${process.env.PRIVATE_KEY}`] 
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY 
  }
};
