// put all constants here
import Web3Utils from 'web3-utils'

export const CONSTANTS = {
    methods: {
        getData: {
            sig: '0x54f6127f',
            gas: Web3Utils.numberToHex(2000000),
            gasPrice: Web3Utils.numberToHex(100000000),
            value: Web3Utils.numberToHex(0),
        },
        dataCount: {
            sig: '0x5da40c47',
            gas: Web3Utils.numberToHex(2000000),
            gasPrice: Web3Utils.numberToHex(100000000),
            value: Web3Utils.numberToHex(0),
        },
        allData: {
            sig: '0xc559acef',
            gas: Web3Utils.numberToHex(2000000),
            gasPrice: Web3Utils.numberToHex(100000000),
            value: Web3Utils.numberToHex(0),
        },

    },
    hashFunctions: [
        {
            name: 'keccak256',
            sig: '0xb7845733',
            method: Web3Utils.keccak256,
        },
        {
            name: 'keccak256(utf8)',
            sig: '0x6f357c6a',
            method: Web3Utils.keccak256,
        },
    ],

}

export default CONSTANTS
