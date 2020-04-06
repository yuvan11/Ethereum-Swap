const Token = artifacts.require("Token");
const EtherSwap = artifacts.require("EtherSwap");

require('chai')
    .use(require('chai-as-promised'))
    .should()

    function tokens(n) {
        return web3.utils.toWei(n,'ether');
    }

contract('EtherSwap', ([deployer,investor])=> {
     
    let token,etherSwap
    
    before(async() =>{
        token = await Token.new()
        etherSwap = await EtherSwap.new(token.address)
          //Transfer all the tokens to EtherSwap (1 Millions)
  await token.transfer(etherSwap.address,tokens('1000000'))
    })

    describe('Token Deployment', async() => {
        it('contract has a name', async() =>{
            
            const name = await token.name()
            assert.equal(name,'DApp Token')
        })

    })

    
    describe('EtherSwap Deployment', async() => {
        it('contract has a name', async() =>{
            const name = await etherSwap.name()
            assert.equal(name,'EtherSwap Instant Exchange')
        })
        it('contract has a token', async() =>{  
            let balance = await token.balanceOf(etherSwap.address)
            assert.equal(balance.toString(),'1000000000000000000000000')
        })

    })

    describe('buyTokens()', async() => {
        let results

        before(async() =>{
            results = await etherSwap.buyTokens({from: investor, value:web3.utils.toWei('1','ether')})
        })

        it('Allows user to instantly purchase tokens from etherSwap for a fixed price', async() => {
            //check investor token balance after purchase

            let investerBalance = await token.balanceOf(investor)
            assert.equal(investerBalance.toString(),tokens('100'))

            //check etherSwap balance after purchase

            let etherSwapBalance
            etherSwapBalance = await token.balanceOf(etherSwap.address)
            assert.equal(etherSwapBalance.toString(),tokens('999900'))

            etherSwapBalance = await web3.eth.getBalance(etherSwap.address)
            assert.equal(etherSwapBalance.toString(),web3.utils.toWei('1','Ether'))
            
            // check the logs to ensure event was emitted with correct data
            const event = results.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')
        })

    })



    describe('sellTokens()', async() => {
        let results

        before(async() =>{
            // Investor must approve the token before purchase
            await token.approve(etherSwap.address,tokens('100'),{from : investor})
            results = await etherSwap.sellTokens(tokens('100'),{from : investor})
        })

        it('Allows user to instantly sell tokens to etherSwap for a fixed price', async() => {

             //check investor token balance after purchase

             let investerBalance = await token.balanceOf(investor)
             assert.equal(investerBalance.toString(),tokens('0'))

              //check etherSwap balance after purchase

            let etherSwapBalance
            etherSwapBalance = await token.balanceOf(etherSwap.address)
            assert.equal(etherSwapBalance.toString(),tokens('1000000'))

            etherSwapBalance = await web3.eth.getBalance(etherSwap.address)
            assert.equal(etherSwapBalance.toString(),web3.utils.toWei('0','Ether'))
          
            // check the logs to ensure event was emitted with correct data
            const event = results.logs[0].args
            assert.equal(event.account, investor)
            assert.equal(event.token, token.address)
            assert.equal(event.amount.toString(), tokens('100').toString())
            assert.equal(event.rate.toString(), '100')

    //FAILURE : invester can't sell more tokens than they have 
    await etherSwap.sellTokens(tokens('500'), {from : investor}).should.be.rejected;
        })

    })

})