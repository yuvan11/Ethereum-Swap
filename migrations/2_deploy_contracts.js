const Token = artifacts.require("Token");
const EtherSwap = artifacts.require("EtherSwap");

module.exports = async function(deployer) {
    //deploy token
   await deployer.deploy(Token); 
    const token = await Token.deployed()

    //deploy EtherSwap
  await deployer.deploy(EtherSwap,token.address);
  const etherSwap = await EtherSwap.deployed()

  //Transfer all the tokens to EtherSwap (1 Millions)
  await token.transfer(etherSwap.address,'1000000000000000000000000')
};
