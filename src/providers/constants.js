//put all constants here
import * as web3utils from 'web3-utils'

export const CONSTANTS = {
  getData: {
    sig: '0x54f6127f',
    gas: web3utils.numberToHex(2000000),
    gasPrice: web3utils.numberToHex(100000000),
    value: web3utils.numberToHex(0),
  },
  dataCount: {
    sig: '0x5da40c47',
    gas: web3utils.numberToHex(2000000),
    gasPrice: web3utils.numberToHex(100000000),
    value: web3utils.numberToHex(0),
  },
  allData: {
    sig:'0xc559acef',
    gas: web3utils.numberToHex(2000000),
    gasPrice: web3utils.numberToHex(100000000),
    value: web3utils.numberToHex(0),
  }
}
