const Web3 = require('web3')
const config = require('./config')
const queueAbi = require('./contracts/queue-abi.json')
const Rootchain = require('@omisego/omg-js-rootchain')

//get the priority queue size
async function getQueueSize(queueAddr) {
  const web3 = new Web3(config.ETH_CLIENT)
  const queueContract = new web3.eth.Contract(queueAbi.abi, queueAddr)
  return await queueContract.methods.currentSize().call()
}

function logSize(token, size, max) {
  console.log(`queue size for token ${token} \n current size: ${size} \n max size: ${max}`)
}

//process exits
async function processExit(tokenAddr, index, numberToProcess) {
  const web3 = new Web3(config.ETH_CLIENT)
  const rootChainContract = new Rootchain(web3, config.ROOTCHAIN_CONTRACT)
  //set to 40 to prevent out of gas err
  if (numberToProcess > 40) {
    numberToProcess = 40
  }
  let receipt = await rootChainContract.processExits(
    tokenAddr,
    index,
    numberToProcess,
    {
      privateKey: process.env.PRIV,
      from: process.env.ADDR
    }
  )
  console.log(`Processed ${numberToProcess} Exit(s): ${receipt.transactionHash}`)
}

//if queue is more than a certain queue size, process exits
async function plungeQueue(token, queue) {
  let queuesize = await getQueueSize(queue)
  queuesize > config.MAX_QUEUE_SIZE
    ? processExit(token, 0, queuesize - config.MAX_QUEUE_SIZE) : logSize(token, queuesize, config.MAX_QUEUE_SIZE)
}

//plungeQueue("","")